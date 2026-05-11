import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@lib/supabase/client'

type Estado = 'carregando' | 'sucesso' | 'erro_expirado' | 'erro_generico'

function parseHashParams(): Record<string, string> {
  const hash = window.location.hash.replace('#', '')
  return Object.fromEntries(new URLSearchParams(hash))
}

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [estado, setEstado] = useState<Estado>('carregando')
  const [email, setEmail] = useState('')
  const [reenviando, setReenviando] = useState(false)
  const [reenviado, setReenviado] = useState(false)

  useEffect(() => {
    const params = parseHashParams()

    // Supabase enviou erro direto na URL
    if (params.error) {
      const expirado =
        params.error_code === 'otp_expired' || params.error === 'access_denied'
      setEstado(expirado ? 'erro_expirado' : 'erro_generico')
      return
    }

    // Tenta pegar sessão (Supabase processa o hash automaticamente)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setEstado('sucesso')
        setTimeout(() => navigate('/', { replace: true }), 1500)
        return
      }

      const { data: listener } = supabase.auth.onAuthStateChange((event, sess) => {
        if (event === 'SIGNED_IN' && sess) {
          listener.subscription.unsubscribe()
          setEstado('sucesso')
          setTimeout(() => navigate('/', { replace: true }), 1500)
        }
      })

      const timeout = setTimeout(() => {
        listener.subscription.unsubscribe()
        setEstado('erro_generico')
      }, 6000)

      return () => {
        clearTimeout(timeout)
        listener.subscription.unsubscribe()
      }
    })
  }, [navigate])

  async function reenviarEmail() {
    if (!email) return
    setReenviando(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setReenviando(false)
    if (!error) setReenviado(true)
  }

  if (estado === 'carregando') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Confirmando seu e-mail...</p>
        </div>
      </div>
    )
  }

  if (estado === 'sucesso') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">E-mail confirmado!</h2>
          <p className="text-gray-500">Redirecionando para o site...</p>
        </div>
      </div>
    )
  }

  // erro_expirado ou erro_generico
  const expirado = estado === 'erro_expirado'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-8 text-center">

        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {expirado ? 'Link expirado' : 'Link inválido'}
        </h2>

        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {expirado
            ? 'O link de confirmação expirou (válido por 1 hora). Informe seu e-mail abaixo para receber um novo link.'
            : 'Este link de confirmação não é válido ou já foi utilizado. Tente fazer login ou solicite um novo link.'}
        </p>

        {expirado && !reenviado && (
          <div className="mb-4">
            <input
              type="email"
              placeholder="Seu e-mail de cadastro"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />
            <button
              onClick={reenviarEmail}
              disabled={reenviando || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {reenviando ? 'Enviando...' : 'Reenviar link de confirmação'}
            </button>
          </div>
        )}

        {reenviado && (
          <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 mb-4 text-sm text-green-700">
            Novo link enviado! Verifique sua caixa de entrada.
          </div>
        )}

        <button
          onClick={() => navigate('/auth/login')}
          className="text-sm text-blue-600 hover:underline"
        >
          Ir para o login
        </button>

      </div>
    </div>
  )
}
