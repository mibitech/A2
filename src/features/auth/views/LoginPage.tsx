import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { signInSchema } from '../models/auth.types'
import { Button, Card } from '@components/ui'

function LoginPage() {
  const navigate = useNavigate()
  const { signIn, error: authError } = useAuthContext()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage(null)

    // Validar com Zod
    const result = signInSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    // Fazer login
    setIsSubmitting(true)
    const response = await signIn(result.data)
    setIsSubmitting(false)

    if (response.success) {
      const role = (response as { success: true; role: string }).role
      navigate(role === 'admin' || role === 'funcionario' ? '/admin' : '/')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-12">
      <Card className="w-full max-w-md" padding="lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-brand">A2TECH</h1>
          </Link>
          <p className="mt-2 text-neutral-600">Faça login em sua conta</p>
        </div>

        {/* Messages */}
        {authError && (
          <div className="mb-4 rounded-lg bg-error-light p-3 text-sm text-error-dark">
            {authError}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-lg bg-success-light p-3 text-sm text-success-dark">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-error focus:ring-error'
                  : 'border-neutral-300 focus:ring-brand'
              }`}
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-error focus:ring-error'
                  : 'border-neutral-300 focus:ring-brand'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-error">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              to="/auth/recuperar-senha"
              className="text-sm text-brand hover:underline"
            >
              Esqueceu sua senha?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Entrar
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-neutral-300" />
          <span className="px-4 text-sm text-neutral-500">ou</span>
          <div className="flex-1 border-t border-neutral-300" />
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Ainda não tem uma conta?{' '}
            <Link to="/auth/cadastro" className="font-semibold text-brand hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-700">
            ← Voltar para o início
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
