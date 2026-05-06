import { Link } from 'react-router-dom'
import { Header, Footer } from '@components/layout'
import { useCart } from '@/features/cart/contexts/CartContext'

export default function CheckoutCancelPage() {
  const { itemsCount } = useCart()

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex flex-1 items-center justify-center bg-neutral-50 py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
            <svg className="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-neutral-900">Pagamento cancelado</h1>
          <p className="mb-8 text-neutral-600">
            Seu pedido não foi concluído. Os itens ainda estão no seu carrinho.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/carrinho"
              className="rounded-lg bg-brand px-6 py-2.5 font-medium text-white hover:bg-brand/90"
            >
              Voltar ao carrinho
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
