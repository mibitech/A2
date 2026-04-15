import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useProduct } from '../controllers/useProducts'
import { useCart } from '../../cart/contexts/CartContext'
import { Button, Card } from '@components/ui'
import { Header, Footer } from '@components/layout'

function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { product, isLoading, error } = useProduct(slug!)
  const { addItem, isInCart, getItemQuantity, itemsCount } = useCart()
  const [showAddedMessage, setShowAddedMessage] = useState(false)

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.nome,
      productImage: product.imagens[0] || '/placeholder-product.jpg',
      productPrice: product.precoPromocional || product.preco,
      maxStock: product.estoque,
    })

    setShowAddedMessage(true)
    setTimeout(() => setShowAddedMessage(false), 3000)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/carrinho')
  }

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header cartItemsCount={itemsCount} />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
            <p className="text-neutral-600">Carregando produto...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header cartItemsCount={itemsCount} />
        <main className="flex flex-1 items-center justify-center py-12">
          <Card padding="lg" className="max-w-md text-center">
            <p className="mb-4 text-error">{error || 'Produto não encontrado'}</p>
            <Link to="/produtos" className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-hover hover:shadow-md">
              Voltar para Produtos
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const precoFinal = product.precoPromocional || product.preco
  const temDesconto = product.precoPromocional !== null

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex-1 bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <Link to="/" className="text-brand hover:underline">
              Início
            </Link>
            <span className="mx-2 text-neutral-400">/</span>
            <Link to="/produtos" className="text-brand hover:underline">
              Produtos
            </Link>
            <span className="mx-2 text-neutral-400">/</span>
            <span className="text-neutral-600">{product.nome}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Galeria de Imagens */}
            <div>
              <Card className="overflow-hidden">
                <div className="aspect-square bg-neutral-100">
                  <img
                    src={product.imagens[0] || '/placeholder-product.jpg'}
                    alt={product.nome}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Card>

              {/* Thumbnails */}
              {product.imagens.length > 1 && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {product.imagens.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square overflow-hidden rounded-lg border-2 border-neutral-200"
                    >
                      <img
                        src={img}
                        alt={`${product.nome} - ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do Produto */}
            <div>
              <Card padding="lg">
                {/* Categoria */}
                <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
                  {product.categoria}
                  {product.subcategoria && ` / ${product.subcategoria}`}
                </p>

                {/* Nome */}
                <h1 className="mb-4 text-2xl font-bold text-neutral-900 sm:text-3xl">
                  {product.nome}
                </h1>

                {/* Fornecedor */}
                {product.fornecedorNome && (
                  <p className="mb-4 text-sm text-neutral-600">
                    Fornecedor:{' '}
                    <span className="font-medium">{product.fornecedorNome}</span>
                  </p>
                )}

                {/* Preço */}
                <div className="mb-6">
                  {temDesconto && (
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-lg text-neutral-500 line-through">
                        {formatarPreco(product.preco)}
                      </span>
                      <span className="rounded bg-error px-2 py-1 text-sm font-bold text-white">
                        {Math.round(
                          ((product.preco - precoFinal) / product.preco) * 100
                        )}
                        % OFF
                      </span>
                    </div>
                  )}
                  <p className="text-4xl font-bold text-brand">
                    {formatarPreco(precoFinal)}
                  </p>
                </div>

                {/* Estoque */}
                <div className="mb-6">
                  {product.estoque > 0 ? (
                    <p className="text-success">
                      ✓ {product.estoque}{' '}
                      {product.estoque === 1 ? 'unidade disponível' : 'unidades disponíveis'}
                    </p>
                  ) : (
                    <p className="text-error">✗ Fora de estoque</p>
                  )}
                </div>

                {/* Ações */}
                <div className="mb-6 space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={product.estoque === 0}
                    onClick={handleAddToCart}
                  >
                    {product.estoque > 0
                      ? 'Adicionar ao Carrinho'
                      : 'Produto Indisponível'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    disabled={product.estoque === 0}
                    onClick={handleBuyNow}
                  >
                    Comprar Agora
                  </Button>
                  <Link
                    to="/produtos"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-3 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Continuar Comprando
                  </Link>
                </div>

                {/* Mensagem de Sucesso */}
                {showAddedMessage && (
                  <div className="mb-6 rounded-lg bg-success/10 px-4 py-3 text-success">
                    ✓ Produto adicionado ao carrinho!
                  </div>
                )}

                {/* Descrição */}
                {product.descricao && (
                  <div className="border-t border-neutral-200 pt-6">
                    <h2 className="mb-3 text-lg font-semibold">Descrição</h2>
                    <p className="whitespace-pre-line text-neutral-600">
                      {product.descricao}
                    </p>
                  </div>
                )}

                {/* Características */}
                {product.caracteristicas && (
                  <div className="mt-6 border-t border-neutral-200 pt-6">
                    <h2 className="mb-3 text-lg font-semibold">
                      Características
                    </h2>
                    <dl className="space-y-2 text-sm">
                      {Object.entries(product.caracteristicas).map(
                        ([key, value]) => (
                          <div key={key} className="flex">
                            <dt className="w-1/3 font-medium text-neutral-700">
                              {key}:
                            </dt>
                            <dd className="w-2/3 text-neutral-600">{String(value)}</dd>
                          </div>
                        )
                      )}
                    </dl>
                  </div>
                )}

                {/* Informações Adicionais */}
                <div className="mt-6 border-t border-neutral-200 pt-6">
                  <h2 className="mb-3 text-lg font-semibold">
                    Informações Adicionais
                  </h2>
                  <dl className="space-y-2 text-sm">
                    {product.sku && (
                      <div className="flex">
                        <dt className="w-1/3 font-medium text-neutral-700">
                          SKU:
                        </dt>
                        <dd className="w-2/3 text-neutral-600">{product.sku}</dd>
                      </div>
                    )}
                    {product.peso && (
                      <div className="flex">
                        <dt className="w-1/3 font-medium text-neutral-700">
                          Peso:
                        </dt>
                        <dd className="w-2/3 text-neutral-600">
                          {product.peso} kg
                        </dd>
                      </div>
                    )}
                    {product.dimensoes && (
                      <div className="flex">
                        <dt className="w-1/3 font-medium text-neutral-700">
                          Dimensões:
                        </dt>
                        <dd className="w-2/3 text-neutral-600">
                          {product.dimensoes.altura} x {product.dimensoes.largura} x{' '}
                          {product.dimensoes.comprimento}{' '}
                          {product.dimensoes.unidade}
                        </dd>
                      </div>
                    )}
                  </dl>
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

export default ProductDetailPage
