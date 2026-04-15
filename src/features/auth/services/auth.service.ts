import { supabase } from '@lib/supabase/client'
import { DISABLE_USUARIOS_TABLE } from '@lib/supabase/config'
import type { Database } from '@/types/supabase'
import type {
  SignUpInput,
  SignInInput,
  ResetPasswordInput,
  UpdatePasswordInput,
  AuthUser,
  AuthError,
} from '../models/auth.types'

type UsuarioRow = Database['public']['Tables']['usuarios']['Row']
type UsuarioUpdate = Database['public']['Tables']['usuarios']['Update']
type QueryResult = { data: UsuarioRow | null; error: { message: string } | null }

/**
 * Service de Autenticação
 * Camada [M] do MVC - Acesso ao Supabase Auth
 */

// ===== SIGN UP =====
export async function signUp(data: SignUpInput): Promise<{
  user: AuthUser | null
  error: AuthError | null
}> {
  try {
    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nome_completo: data.nomeCompleto,
          telefone: data.telefone,
          tipo_pessoa: data.tipoPessoa,
          cpf_cnpj: data.cpfCnpj,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      return { user: null, error: { message: authError.message, code: authError.code } }
    }

    if (!authData.user) {
      return { user: null, error: { message: 'Erro ao criar usuário' } }
    }

    // 2. MODO EMERGÊNCIA: Pular queries na tabela usuarios se houver erro de recursão
    if (DISABLE_USUARIOS_TABLE) {
      console.warn('⚠️ MODO EMERGÊNCIA: Tabela usuarios desabilitada. Aplique fix de recursão!')
      return {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          nomeCompleto: data.nomeCompleto,
          telefone: data.telefone ?? null,
          cpfCnpj: data.cpfCnpj ?? null,
          tipoPessoa: data.tipoPessoa,
          role: 'cliente',
          createdAt: authData.user.created_at,
        },
        error: null,
      }
    }

    // 3. Tentar atualizar dados complementares (pode falhar se houver erro RLS)
    try {
      const updatePayload: UsuarioUpdate = {
        nome_completo: data.nomeCompleto,
        telefone: data.telefone ?? null,
        tipo_pessoa: data.tipoPessoa,
        cpf_cnpj: data.cpfCnpj ?? null,
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await Promise.race([
        (supabase.from('usuarios') as any).update(updatePayload).eq('id', authData.user.id),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ])
    } catch (updateError) {
      console.warn('Aviso: Não foi possível atualizar dados complementares:', updateError)
      // Continuar mesmo se falhar - dados básicos já estão criados
    }

    // 4. Tentar buscar dados completos (com timeout)
    try {
      const { data: userData, error: userError } = (await Promise.race([
        supabase.from('usuarios').select('*').eq('id', authData.user.id).single(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ])) as QueryResult

      if (!userError && userData) {
        return {
          user: {
            id: userData.id,
            email: userData.email,
            nomeCompleto: userData.nome_completo,
            telefone: userData.telefone,
            cpfCnpj: userData.cpf_cnpj,
            tipoPessoa: userData.tipo_pessoa as 'fisica' | 'juridica',
            role: userData.role as 'cliente' | 'funcionario' | 'admin',
            createdAt: userData.created_at,
          },
          error: null,
        }
      }
    } catch (fetchError) {
      console.warn('Aviso: Não foi possível buscar dados completos:', fetchError)
    }

    // Se chegar aqui, usuário foi criado mas não conseguimos buscar dados
    // Retornar dados básicos do Auth
    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        nomeCompleto: data.nomeCompleto,
        telefone: data.telefone ?? null,
        cpfCnpj: data.cpfCnpj ?? null,
        tipoPessoa: data.tipoPessoa,
        role: 'cliente',
        createdAt: authData.user.created_at,
      },
      error: null,
    }
  } catch (error) {
    console.error('Erro no signup:', error)
    return {
      user: null,
      error: { message: 'Erro inesperado ao criar conta. Verifique o console para detalhes.' },
    }
  }
}

// ===== SIGN IN =====
export async function signIn(data: SignInInput): Promise<{
  user: AuthUser | null
  session: { accessToken: string; refreshToken: string } | null
  error: AuthError | null
}> {
  try {
    // 1. Login no Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

    if (authError) {
      return { user: null, session: null, error: { message: authError.message, code: authError.code } }
    }

    if (!authData.user || !authData.session) {
      return { user: null, session: null, error: { message: 'Erro ao fazer login' } }
    }

    // 2. Buscar dados do banco usando o ID já conhecido (sem chamar getUser novamente)
    let role: 'cliente' | 'funcionario' | 'admin' = 'cliente'
    let nomeCompleto = authData.user.user_metadata?.nome_completo || ''
    let telefone = authData.user.user_metadata?.telefone || ''
    let cpfCnpj = authData.user.user_metadata?.cpf_cnpj || ''
    let tipoPessoa: 'fisica' | 'juridica' = (authData.user.user_metadata?.tipo_pessoa as 'fisica' | 'juridica') || 'fisica'
    try {
      const { data: userData } = (await Promise.race([
        supabase.from('usuarios').select('role, nome_completo, telefone, cpf_cnpj, tipo_pessoa').eq('id', authData.user.id).single(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ])) as { data: { role: string; nome_completo: string | null; telefone: string | null; cpf_cnpj: string | null; tipo_pessoa: string | null } | null; error: unknown }
      if (userData) {
        role = (userData.role as typeof role) || role
        nomeCompleto = userData.nome_completo || nomeCompleto
        telefone = userData.telefone || telefone
        cpfCnpj = userData.cpf_cnpj || cpfCnpj
        tipoPessoa = (userData.tipo_pessoa as typeof tipoPessoa) || tipoPessoa
      }
    } catch {
      // timeout ou erro — usa dados do metadata como fallback
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        nomeCompleto,
        telefone,
        cpfCnpj,
        tipoPessoa,
        role,
        createdAt: authData.user.created_at,
      },
      session: {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
      },
      error: null,
    }
  } catch (error) {
    console.error('Erro no signin:', error)
    return {
      user: null,
      session: null,
      error: { message: 'Erro inesperado ao fazer login. Por favor, tente novamente.' },
    }
  }
}

// ===== SIGN OUT =====
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: { message: error.message, code: error.code } }
    }

    return { error: null }
  } catch (error) {
    console.error('Erro no signout:', error)
    return { error: { message: 'Erro inesperado ao sair' } }
  }
}

// ===== GET CURRENT USER =====
export async function getCurrentUser(): Promise<{
  user: AuthUser | null
  error: AuthError | null
}> {
  try {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      return { user: null, error: { message: authError.message, code: authError.code } }
    }

    if (!authUser) {
      return { user: null, error: null }
    }

    // MODO EMERGÊNCIA: Pular queries na tabela usuarios se houver erro de recursão
    if (DISABLE_USUARIOS_TABLE) {
      console.warn('⚠️ MODO EMERGÊNCIA: Tabela usuarios desabilitada. Aplique fix de recursão!')
      return {
        user: {
          id: authUser.id,
          email: authUser.email!,
          nomeCompleto: authUser.user_metadata?.nome_completo || '',
          telefone: authUser.user_metadata?.telefone || '',
          cpfCnpj: authUser.user_metadata?.cpf_cnpj || '',
          tipoPessoa: (authUser.user_metadata?.tipo_pessoa as 'fisica' | 'juridica') || 'fisica',
          role: 'cliente',
          createdAt: authUser.created_at,
        },
        error: null,
      }
    }

    // Tentar buscar dados completos (com timeout de 5s)
    try {
      const { data: userData, error: userError } = (await Promise.race([
        supabase.from('usuarios').select('*').eq('id', authUser.id).single(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 3000)
        ),
      ])) as QueryResult

      if (!userError && userData) {
        return {
          user: {
            id: userData.id,
            email: userData.email,
            nomeCompleto: userData.nome_completo,
            telefone: userData.telefone,
            cpfCnpj: userData.cpf_cnpj,
            tipoPessoa: userData.tipo_pessoa as 'fisica' | 'juridica',
            role: userData.role as 'cliente' | 'funcionario' | 'admin',
            createdAt: userData.created_at,
          },
          error: null,
        }
      }
    } catch (fetchError) {
      console.warn('Aviso: Timeout ao buscar dados completos do usuário:', fetchError)
    }

    // Se chegar aqui, usuário existe mas não conseguimos buscar dados completos
    // Retornar dados básicos do Auth
    return {
      user: {
        id: authUser.id,
        email: authUser.email!,
        nomeCompleto: authUser.user_metadata?.nome_completo || '',
        telefone: authUser.user_metadata?.telefone || '',
        cpfCnpj: authUser.user_metadata?.cpf_cnpj || '',
        tipoPessoa: (authUser.user_metadata?.tipo_pessoa as 'fisica' | 'juridica') || 'fisica',
        role: 'cliente',
        createdAt: authUser.created_at,
      },
      error: null,
    }
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error)
    return {
      user: null,
      error: { message: 'Erro inesperado ao buscar usuário' },
    }
  }
}

// ===== RESET PASSWORD =====
export async function resetPassword(
  data: ResetPasswordInput
): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      return { error: { message: error.message, code: error.code } }
    }

    return { error: null }
  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error)
    return { error: { message: 'Erro inesperado ao solicitar reset de senha' } }
  }
}

// ===== UPDATE PASSWORD =====
export async function updatePassword(
  data: UpdatePasswordInput
): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (error) {
      return { error: { message: error.message, code: error.code } }
    }

    return { error: null }
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return { error: { message: 'Erro inesperado ao atualizar senha' } }
  }
}

// ===== GET SESSION =====
export async function getSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return { session: null, error: { message: error.message, code: error.code } }
    }

    return { session, error: null }
  } catch (error) {
    console.error('Erro ao buscar sessão:', error)
    return {
      session: null,
      error: { message: 'Erro inesperado ao buscar sessão' },
    }
  }
}
