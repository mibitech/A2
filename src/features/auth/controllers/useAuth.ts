
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@lib/supabase/client'
import { DISABLE_USUARIOS_TABLE } from '@lib/supabase/config'
import * as authService from '../services/auth.service'
import type {
  SignUpInput,
  SignInInput,
  ResetPasswordInput,
  UpdatePasswordInput,
  AuthState,
  AuthUser,
} from '../models/auth.types'

/**
 * Hook useAuth - Controller de Autenticação
 * Camada [C] do MVC - Orquestra estado e services
 */

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(initialState)
  const [error, setError] = useState<string | null>(null)

  // ===== LOAD USER ON MOUNT =====
  // Usa onAuthStateChange como única fonte de verdade para evitar race conditions.
  // Safety timeout de 5s garante que isLoading nunca fique preso.
  useEffect(() => {
    let mounted = true

    // Timeout de segurança: se nada resolver em 5s, libera o loading
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setState(prev => prev.isLoading ? { ...prev, isLoading: false } : prev)
      }
    }, 5_000)

    // Usa session.user diretamente — sem chamar getUser() na rede.
    // Busca dados extras (role, etc.) na tabela usuarios com timeout de 3s.
    async function resolveUser(session: { user: { id: string; email?: string; user_metadata?: Record<string, string>; created_at: string }; access_token: string; refresh_token: string }) {
      const authUser = session.user
      const metadata = authUser.user_metadata || {}
      const sessionTokens = { accessToken: session.access_token, refreshToken: session.refresh_token }

      let role: 'cliente' | 'funcionario' | 'admin' = 'cliente'
      let nomeCompleto: string | null = metadata.nome_completo || null
      let telefone: string | null = metadata.telefone || null
      let cpfCnpj: string | null = metadata.cpf_cnpj || null
      let tipoPessoa: 'fisica' | 'juridica' = (metadata.tipo_pessoa as 'fisica' | 'juridica') || 'fisica'

      if (!DISABLE_USUARIOS_TABLE) {
        try {
          const { data } = (await Promise.race([
            supabase
              .from('usuarios')
              .select('role, nome_completo, telefone, cpf_cnpj, tipo_pessoa')
              .eq('id', authUser.id)
              .single(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3_000)),
          ])) as { data: { role: string; nome_completo: string | null; telefone: string | null; cpf_cnpj: string | null; tipo_pessoa: string | null } | null; error: unknown }

          if (data) {
            role = (data.role as typeof role) || role
            nomeCompleto = data.nome_completo || nomeCompleto
            telefone = data.telefone || telefone
            cpfCnpj = data.cpf_cnpj || cpfCnpj
            tipoPessoa = (data.tipo_pessoa as typeof tipoPessoa) || tipoPessoa
          }
        } catch {
          // timeout ou erro — usa metadata como fallback
        }
      }

      return {
        user: {
          id: authUser.id,
          email: authUser.email || '',
          nomeCompleto,
          telefone,
          cpfCnpj,
          tipoPessoa,
          role,
          createdAt: authUser.created_at,
        } as AuthUser,
        sessionTokens,
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        clearTimeout(safetyTimer)

        if (event === 'INITIAL_SESSION') {
          // Primeira carga da página — resolve usuário completo (com role do banco)
          if (session) {
            try {
              const { user, sessionTokens } = await resolveUser(session)
              if (user && mounted) {
                setState({ user, session: sessionTokens, isLoading: false, isAuthenticated: true })
              } else if (mounted) {
                setState({ ...initialState, isLoading: false })
              }
            } catch {
              if (mounted) setState({ ...initialState, isLoading: false })
            }
          } else {
            if (mounted) setState({ ...initialState, isLoading: false })
          }
        } else if (event === 'SIGNED_IN' && session) {
          // Login explícito (signIn()) já atualiza o estado diretamente.
          // Aqui apenas garantimos que os tokens ficam atualizados sem sobrescrever o role.
          if (mounted) {
            setState(prev => ({
              ...prev,
              session: { accessToken: session.access_token, refreshToken: session.refresh_token },
              isLoading: false,
            }))
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Refresh automático de token — apenas atualiza tokens, preserva role
          if (mounted) {
            setState(prev => ({
              ...prev,
              session: { accessToken: session.access_token, refreshToken: session.refresh_token },
            }))
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) setState({ ...initialState, isLoading: false })
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(safetyTimer)
      authListener.subscription.unsubscribe()
    }
  }, [])

  // ===== SIGN UP =====
  const signUp = useCallback(async (data: SignUpInput) => {
    try {
      setError(null)
      setState(prev => ({ ...prev, isLoading: true }))

      const { user: _user, error } = await authService.signUp(data)

      if (error) {
        setError(error.message)
        setState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: error.message }
      }

      // Após signup, o usuário recebe email de confirmação
      // O estado será atualizado pelo onAuthStateChange quando confirmar
      setState(prev => ({ ...prev, isLoading: false }))

      return {
        success: true,
        message: 'Conta criada! Verifique seu e-mail para confirmar.',
      }
    } catch (err) {
      const message = 'Erro inesperado ao criar conta'
      setError(message)
      setState(prev => ({ ...prev, isLoading: false }))
      return { success: false, error: message }
    }
  }, [])

  // ===== SIGN IN =====
  const signIn = useCallback(async (data: SignInInput) => {
    try {
      setError(null)
      setState(prev => ({ ...prev, isLoading: true }))

      const { user: basicUser, error, session } = await authService.signIn(data)

      if (error) {
        setError(error.message)
        setState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: error.message }
      }

      if (!basicUser || !session) {
        setError('Erro ao fazer login')
        setState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: 'Erro ao fazer login' }
      }

      setState({
        user: basicUser,
        session,
        isLoading: false,
        isAuthenticated: true,
      })

      return { success: true, role: basicUser.role }
    } catch (err) {
      const message = 'Erro inesperado ao fazer login'
      setError(message)
      setState(prev => ({ ...prev, isLoading: false }))
      return { success: false, error: message }
    }
  }, [])

  // ===== SIGN OUT =====
  const signOut = useCallback(async () => {
    try {
      setError(null)
      setState(prev => ({ ...prev, isLoading: true }))

      const { error } = await authService.signOut()

      if (error) {
        setError(error.message)
        setState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: error.message }
      }

      // O estado será atualizado pelo onAuthStateChange
      return { success: true }
    } catch (err) {
      const message = 'Erro inesperado ao sair'
      setError(message)
      setState(prev => ({ ...prev, isLoading: false }))
      return { success: false, error: message }
    }
  }, [])

  // ===== RESET PASSWORD =====
  const resetPassword = useCallback(async (data: ResetPasswordInput) => {
    try {
      setError(null)

      const { error } = await authService.resetPassword(data)

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return {
        success: true,
        message: 'Link de recuperação enviado para seu e-mail',
      }
    } catch (err) {
      const message = 'Erro inesperado ao solicitar recuperação de senha'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  // ===== UPDATE PASSWORD =====
  const updatePassword = useCallback(async (data: UpdatePasswordInput) => {
    try {
      setError(null)

      const { error } = await authService.updatePassword(data)

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return {
        success: true,
        message: 'Senha atualizada com sucesso',
      }
    } catch (err) {
      const message = 'Erro inesperado ao atualizar senha'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  // ===== CLEAR ERROR =====
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Estado
    user: state.user,
    session: state.session,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error,

    // Ações
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
  }
}
