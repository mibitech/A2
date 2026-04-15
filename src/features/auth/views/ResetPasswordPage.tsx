import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { updatePasswordSchema } from '../models/auth.types'
import { Button, Card } from '@components/ui'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword, isLoading, error: authError } = useAuthContext()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage(null)

    // Validar
    const result = updatePasswordSchema.safeParse(formData)

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

    // Atualizar senha
    const response = await updatePassword(result.data)

    if (response.success) {
      setSuccessMessage(
        response.message || 'Senha atualizada com sucesso!'
      )
      setTimeout(() => {
        navigate('/auth/login')
      }, 2000)
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
          <p className="mt-2 text-neutral-600">Redefinir senha</p>
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
          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Nova Senha
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
            <p className="mt-1 text-xs text-neutral-500">
              Mínimo de 6 caracteres
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? 'border-error focus:ring-error'
                  : 'border-neutral-300 focus:ring-brand'
              }`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-error">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Atualizar Senha
          </Button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            to="/auth/login"
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            ← Voltar para o login
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default ResetPasswordPage
