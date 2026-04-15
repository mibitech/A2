import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { resetPasswordSchema } from '../models/auth.types'
import { Button, Card } from '@components/ui'

function ForgotPasswordPage() {
  const { resetPassword, isLoading, error: authError } = useAuthContext()

  const [formData, setFormData] = useState({
    email: '',
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
    const result = resetPasswordSchema.safeParse(formData)

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

    // Solicitar reset
    const response = await resetPassword(result.data)

    if (response.success) {
      setSuccessMessage(
        response.message ||
          'Link de recuperação enviado para seu e-mail. Verifique sua caixa de entrada.'
      )
      setFormData({ email: '' })
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
          <p className="mt-2 text-neutral-600">Recuperar senha</p>
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

        {/* Info */}
        <div className="mb-6 rounded-lg bg-info-light p-4 text-sm text-info-dark">
          <p>
            Digite seu e-mail cadastrado. Você receberá um link para redefinir
            sua senha.
          </p>
        </div>

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

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Enviar Link de Recuperação
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

export default ForgotPasswordPage
