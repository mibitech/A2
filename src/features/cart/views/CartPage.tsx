import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { Button, Card } from '@components/ui'
import { Header, Footer } from '@components/layout'

function CartPage() {
  const { items, total, itemsCount, removeItem, updateQuantity, clearCart } = useCart()

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header cartItemsCount={itemsCount} />
        <main className="flex flex-1 items-center justify-center bg-neutral-50 py-12">
          <Card padding="lg" className="max-w-md text-center">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="mb-2 text-xl font-bold text-neutral-900">
              Seu carrinho está vazio
            </h2>
            <p className="mb-6 text-neutral-600">
              Adicione produtos para continuar comprando
            </p>
            <Link to="/produtos" className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-hover hover:shadow-md">
              Ver Produtos
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex-1 bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          {/* Cabeçalho */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Carrinho</h1>
              <p className="mt-2 text-neutral-600">
                {itemsCount} {itemsCount === 1 ? 'item' : 'itens'} no carrinho
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={clearCart}>
              Limpar Carrinho
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Lista de Itens */}
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.productId} padding="lg">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* Imagem */}
                    <Link
                      to={`/produtos/${item.productSlug}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-20 w-20 rounded-lg object-cover sm:h-24 sm:w-24"
                      />
                    </Link>

                    {/* Informações */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/produtos/${item.productSlug}`}
                          className="font-medium text-neutral-900 hover:text-brand"
                        >
                          {item.productName}
                        </Link>
                        {/* Subtotal mobile */}
                        <div className="text-right sm:hidden">
                          <p className="text-base font-bold text-neutral-900">
                            {formatarPreco(item.productPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-1 text-base font-bold text-brand">
                        {formatarPreco(item.productPrice)}
                      </p>

                      {/* Controles de Quantidade */}
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="rounded-l-lg border border-neutral-300 px-2.5 py-1.5 hover:bg-neutral-100 sm:px-3 sm:py-2"
                          >
                            -
                          </button>
                          <span className="border-b border-t border-neutral-300 px-3 py-1.5 text-center font-medium sm:px-4 sm:py-2">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.maxStock}
                            className="rounded-r-lg border border-neutral-300 px-2.5 py-1.5 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-2"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-sm text-error hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    </div>

                    {/* Subtotal desktop */}
                    <div className="hidden text-right sm:block">
                      <p className="text-sm text-neutral-600">Subtotal</p>
                      <p className="text-xl font-bold text-neutral-900">
                        {formatarPreco(item.productPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Resumo do Pedido */}
            <div>
              <Card padding="lg" className="sticky top-4">
                <h2 className="mb-4 text-xl font-bold text-neutral-900">
                  Resumo do Pedido
                </h2>

                <div className="space-y-3 border-b border-neutral-200 pb-4">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal ({itemsCount} itens)</span>
                    <span className="font-medium">{formatarPreco(total)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Frete</span>
                    <span className="font-medium">Calculado no checkout</span>
                  </div>
                </div>

                <div className="my-4 flex justify-between">
                  <span className="text-lg font-bold text-neutral-900">Total</span>
                  <span className="text-2xl font-bold text-brand">
                    {formatarPreco(total)}
                  </span>
                </div>

                <Button variant="primary" size="lg" fullWidth disabled>
                  Finalizar Compra
                </Button>

                <p className="mt-4 text-center text-xs text-neutral-500">
                  O frete será calculado na próxima etapa
                </p>

                <div className="mt-6 border-t border-neutral-200 pt-6">
                  <Link
                    to="/produtos"
                    className="inline-flex w-full items-center justify-center rounded-lg border-2 border-brand bg-white px-3 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-50 active:bg-brand-100"
                  >
                    Continuar Comprando
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default CartPage
