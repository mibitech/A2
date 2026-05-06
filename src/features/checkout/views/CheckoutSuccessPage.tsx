import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/features/cart/contexts/CartContext'
import { Header, Footer } from '@components/layout'

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    clearCart()
    sessionStorage.removeItem('a2tech_frete')
  }, []) // intencional: limpa uma vez ao montar a página de sucesso

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={0} />

      <main className="flex flex-1 items-center justify-center bg-neutral-50 py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-neutral-900">Pedido confirmado!</h1>
          <p className="mb-1 text-neutral-600">
            Seu pagamento foi processado com sucesso.
          </p>
          <p className="mb-8 text-neutral-500 text-sm">
            Você receberá um e-mail de confirmação em breve.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/conta"
              className="rounded-lg bg-brand px-6 py-2.5 font-medium text-white hover:bg-brand/90"
            >
              Ver meus pedidos
            </Link>
            <Link
              to="/produtos"
              className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
