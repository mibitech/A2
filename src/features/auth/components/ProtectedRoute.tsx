import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'

type Role = 'cliente' | 'funcionario' | 'admin'

interface ProtectedRouteProps {
  children: ReactNode
  /** Se informado, redireciona para '/' caso o role do usuário não esteja na lista */
  roles?: Role[]
}

/**
 * ProtectedRoute
 *
 * Guarda rotas que exigem autenticação e/ou um role específico.
 *
 * Uso:
 *   <Route path="/admin" element={
 *     <ProtectedRoute roles={['admin', 'funcionario']}>
 *       <AdminLayout />
 *     </ProtectedRoute>
 *   } />
 */
export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthContext()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-brand-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
