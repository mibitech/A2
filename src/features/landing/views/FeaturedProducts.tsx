import { Link } from 'react-router-dom'
import { Card, Badge, Button } from '@components/ui'
import { useProducts } from '@features/products/controllers/useProducts'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-sm font-semibold text-neutral-800">{rating.toFixed(1)}</span>
    </div>
  )
}

function FeaturedProducts() {
  const { products, isLoading } = useProducts({ destaque: true })
  const featured = products.slice(0, 4)

  return (
    <section className="bg-neutral-50 py-14">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-brand">Destaques</p>
            <h2 className="text-neutral-900">Produtos em Destaque</h2>
            <p className="mt-1 text-neutral-500">Seleção especial com os melhores preços</p>
          </div>
          <Link
            to="/produtos"
            className="hidden items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand-50 sm:flex"
          >
            Ver todos →
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse rounded-lg bg-neutral-200 h-80" />
            ))}
          </div>
        )}

        {/* Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map(product => {
              const precoFinal = product.precoPromocional ?? product.preco
              const temDesconto = product.precoPromocional !== null
              const imagem = product.imagens[0] || '/placeholder-product.jpg'

              return (
                <Card
                  key={product.id}
                  padding="none"
                  hover
                  className="group overflow-hidden"
                >
                  {/* Image */}
                  <Link to={`/produtos/${product.slug}`} className="block overflow-hidden">
                    <img
                      src={imagem}
                      alt={product.nome}
                      className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex flex-col gap-3 p-4">
                    {product.destaque && (
                      <Badge variant="primary" size="sm" className="self-start">
                        DESTAQUE
                      </Badge>
                    )}

                    <Link
                      to={`/produtos/${product.slug}`}
                      className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-800 hover:text-brand"
                    >
                      {product.nome}
                    </Link>

                    {/* Price */}
                    <div>
                      {temDesconto && (
                        <div className="mb-0.5 flex items-center gap-2">
                          <span className="text-xs text-neutral-400 line-through">
                            R$ {product.preco.toFixed(2)}
                          </span>
                          <span className="rounded bg-success-light px-1.5 py-0.5 text-xs font-bold text-success-dark">
                            {Math.round(((product.preco - precoFinal) / product.preco) * 100)}% OFF
                          </span>
                        </div>
                      )}
                      <div className="text-xl font-bold text-neutral-900">
                        R$ {precoFinal.toFixed(2).replace('.', ',')}
                      </div>
                    </div>

                    <StarRating rating={4.5} />

                    <Link
                      to={`/produtos/${product.slug}`}
                      className="mt-auto block w-full rounded-lg bg-brand py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-600 active:bg-brand-700"
                    >
                      Ver Produto
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Sem produtos em destaque */}
        {!isLoading && featured.length === 0 && (
          <p className="text-center text-neutral-500">Nenhum produto em destaque no momento.</p>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/produtos"
            className="inline-flex items-center justify-center rounded-lg border-2 border-brand bg-white px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand-50 active:bg-brand-100"
          >
            Ver todos os produtos
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
