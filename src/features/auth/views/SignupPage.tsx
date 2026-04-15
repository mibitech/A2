import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { signUpSchema } from '../models/auth.types'
import { Button, Card } from '@components/ui'

function SignupPage() {
  const navigate = useNavigate()
  const { signUp, isLoading, error: authError } = useAuthContext()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nomeCompleto: '',
    telefone: '',
    tipoPessoa: 'fisica' as 'fisica' | 'juridica',
    cpfCnpj: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage(null)

    // Validar com Zod
    const result = signUpSchema.safeParse(formData)

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

    // Fazer cadastro
    const response = await signUp(result.data)

    if (response.success) {
      setSuccessMessage(
        response.message || 'Conta criada! Verifique seu e-mail.'
      )
      // Limpar formulário
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        nomeCompleto: '',
        telefone: '',
        tipoPessoa: 'fisica',
        cpfCnpj: '',
      })
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate('/auth/login')
      }, 3000)
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
          <p className="mt-2 text-neutral-600">Crie sua conta</p>
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
          {/* Nome Completo */}
          <div>
            <label
              htmlFor="nomeCompleto"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Nome Completo
            </label>
            <input
              type="text"
              id="nomeCompleto"
              name="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.nomeCompleto
                  ? 'border-error focus:ring-error'
                  : 'border-neutral-300 focus:ring-brand'
              }`}
              placeholder="João Silva"
            />
            {errors.nomeCompleto && (
              <p className="mt-1 text-sm text-error">{errors.nomeCompleto}</p>
            )}
          </div>

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

          {/* Telefone */}
          <div>
            <label
              htmlFor="telefone"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Telefone (opcional)
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="(11) 99999-9999"
            />
          </div>

          {/* Tipo Pessoa */}
          <div>
            <label
              htmlFor="tipoPessoa"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Tipo de Pessoa
            </label>
            <select
              id="tipoPessoa"
              name="tipoPessoa"
              value={formData.tipoPessoa}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="fisica">Pessoa Física</option>
              <option value="juridica">Pessoa Jurídica</option>
            </select>
          </div>

          {/* CPF/CNPJ */}
          <div>
            <label
              htmlFor="cpfCnpj"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              {formData.tipoPessoa === 'fisica' ? 'CPF' : 'CNPJ'} (opcional)
            </label>
            <input
              type="text"
              id="cpfCnpj"
              name="cpfCnpj"
              value={formData.cpfCnpj}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder={
                formData.tipoPessoa === 'fisica'
                  ? '000.000.000-00'
                  : '00.000.000/0000-00'
              }
            />
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Confirmar Senha
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
            Criar Conta
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-neutral-300" />
          <span className="px-4 text-sm text-neutral-500">ou</span>
          <div className="flex-1 border-t border-neutral-300" />
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Já tem uma conta?{' '}
            <Link
              to="/auth/login"
              className="font-semibold text-brand hover:underline"
            >
              Faça login
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

export default SignupPage
