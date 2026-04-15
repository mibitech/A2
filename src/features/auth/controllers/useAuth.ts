
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
  useEffect(() => {
    let mounted = true

    async function loadUser() {
      try {
        const { session } = await authService.getSession()

        if (session && mounted) {
          // MODO EMERGÊNCIA: Extrair dados diretamente da sessão para evitar lock conflict
          if (DISABLE_USUARIOS_TABLE && session.user) {
            const metadata = session.user.user_metadata || {}
            const user: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              nomeCompleto: metadata.nome_completo || null,
              telefone: metadata.telefone || null,
              cpfCnpj: metadata.cpf_cnpj || null,
              tipoPessoa: (metadata.tipo_pessoa as 'fisica' | 'juridica') || 'fisica',
              role: 'cliente',
              createdAt: session.user.created_at,
            }

            setState({
              user,
              session: {
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
              },
              isLoading: false,
              isAuthenticated: true,
            })
          } else {
            // MODO NORMAL: Buscar do banco de dados
            const { user, error } = await authService.getCurrentUser()

            if (user && !error) {
              setState({
                user,
                session: {
                  accessToken: session.access_token,
                  refreshToken: session.refresh_token,
                },
                isLoading: false,
                isAuthenticated: true,
              })
            } else {
              setState({
                ...initialState,
                isLoading: false,
              })
            }
          }
        } else {
          setState({
            ...initialState,
            isLoading: false,
          })
        }
      } catch (err) {
        console.error('Erro ao carregar usuário:', err)
        if (mounted) {
          setState({
            ...initialState,
            isLoading: false,
          })
        }
      }
    }

    loadUser()

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            // MODO EMERGÊNCIA: Extrair dados diretamente da sessão para evitar lock conflict
            if (DISABLE_USUARIOS_TABLE && session.user) {
              const metadata = session.user.user_metadata || {}
              const user: AuthUser = {
                id: session.user.id,
                email: session.user.email || '',
                nomeCompleto: metadata.nome_completo || null,
                telefone: metadata.telefone || null,
                cpfCnpj: metadata.cpf_cnpj || null,
                tipoPessoa: (metadata.tipo_pessoa as 'fisica' | 'juridica') || 'fisica',
                role: 'cliente',
                createdAt: session.user.created_at,
              }
              
              if (mounted) {
                setState({
                  user,
                  session: {
                    accessToken: session.access_token,
                    refreshToken: session.refresh_token,
                  },
                  isLoading: false,
                  isAuthenticated: true,
                })
              }
            } else {
              // MODO NORMAL: Buscar do banco de dados
              const { user, error } = await authService.getCurrentUser()
              if (user && !error && mounted) {
                setState({
                  user,
                  session: {
                    accessToken: session.access_token,
                    refreshToken: session.refresh_token,
                  },
                  isLoading: false,
                  isAuthenticated: true,
                })
              } else {
                if (mounted) {
                  setState({
                    ...initialState,
                    isLoading: false,
                  })
                }
              }
            }
          } catch (err) {
            console.error('Erro no onAuthStateChange:', err)
            if (mounted) {
              setState({
                ...initialState,
                isLoading: false,
              })
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setState({
              ...initialState,
              isLoading: false,
            })
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          if (mounted) {
            setState(prev => ({
              ...prev,
              session: {
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
              },
            }))
          }
        }
      }
    )

    return () => {
      mounted = false
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
