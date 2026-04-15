import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../controllers/useAuth'
import type { AuthUser } from '../models/auth.types'

interface AuthContextType {
  user: AuthUser | null
  session: { accessToken: string; refreshToken: string } | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  signUp: (data: any) => Promise<any>
  signIn: (data: any) => Promise<any>
  signOut: () => Promise<any>
  resetPassword: (data: any) => Promise<any>
  updatePassword: (data: any) => Promise<any>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
