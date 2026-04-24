import { Link } from 'react-router-dom'
import { Card, Button } from '@components/ui'
import type { Product } from '../models/products.types'

interface ProductCardProps {
  product: Product
  listMode?: boolean
}

function ProductCard({ product, listMode = false }: ProductCardProps) {
  const precoFinal = product.precoPromocional || product.preco
  const temDesconto = product.precoPromocional !== null

  // Primeira imagem ou placeholder
  const imagem = product.imagens[0] || '/placeholder-product.jpg'

  // Formatar preço
  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  if (listMode) {
    return (
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="flex gap-4">
          <Link to={`/produtos/${product.slug}`} className="flex-shrink-0">
            <div className="relative h-28 w-28 overflow-hidden rounded-lg bg-neutral-100 sm:h-32 sm:w-32">
              <img src={imagem} alt={product.nome} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              {temDesconto && (
                <span className="absolute right-1 top-1 rounded bg-error px-1.5 py-0.5 text-xs font-bold text-white">
                  {Math.round(((product.preco - precoFinal) / product.preco) * 100)}%
                </span>
              )}
            </div>
          </Link>
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{product.categoria}</p>
            <Link to={`/produtos/${product.slug}`} className="font-medium text-neutral-900 hover:text-brand line-clamp-2">
              {product.nome}
            </Link>
            {product.fornecedorNome && (
              <p className="text-xs text-neutral-500">por {product.fornecedorNome}</p>
            )}
            {product.descricao && (
              <p className="hidden text-sm text-neutral-500 line-clamp-2 sm:block">{product.descricao}</p>
            )}
            <div className="mt-auto pt-2">
              <div className="mb-2">
                {temDesconto && <p className="text-xs text-neutral-400 line-through">{formatarPreco(product.preco)}</p>}
                <p className="text-lg font-bold text-brand">{formatarPreco(precoFinal)}</p>
              </div>
              <div className="flex justify-center">
                <Link
                  to={`/produtos/${product.slug}`}
                  className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-hover hover:shadow-md active:bg-brand-dark"
                >
                  Ver Detalhes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card padding="none" className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {/* Imagem do Produto */}
      <Link to={`/produtos/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          <img
            src={imagem}
            alt={product.nome}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {temDesconto && (
            <div className="absolute right-2 top-2">
              <span className="rounded-lg bg-error px-2 py-1 text-xs font-bold text-white">
                {Math.round(
                  ((product.preco - precoFinal) / product.preco) * 100
                )}
                % OFF
              </span>
            </div>
          )}
          {product.destaque && (
            <div className="absolute left-2 top-2">
              <span className="rounded-lg bg-brand px-2 py-1 text-xs font-bold text-white">
                Destaque
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Informações do Produto */}
      <div className="flex flex-1 flex-col px-4 pt-3 pb-4">
        <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">
          {product.categoria}
        </p>

        <Link
          to={`/produtos/${product.slug}`}
          className="mb-2 line-clamp-2 text-sm font-medium text-neutral-900 hover:text-brand"
        >
          {product.nome}
        </Link>

        {product.fornecedorNome && (
          <p className="mb-2 text-xs text-neutral-500">
            por {product.fornecedorNome}
          </p>
        )}

        <div className="mb-2">
          {temDesconto && (
            <p className="text-xs text-neutral-500 line-through">
              {formatarPreco(product.preco)}
            </p>
          )}
          <p className="text-lg font-bold text-brand">
            {formatarPreco(precoFinal)}
          </p>
        </div>

        <p className="mb-3 text-xs text-neutral-600">
          {product.estoque > 0 ? (
            <span className="text-success">
              {product.estoque} {product.estoque === 1 ? 'unidade' : 'unidades'} disponível{product.estoque === 1 ? '' : 'is'}
            </span>
          ) : (
            <span className="text-error">Fora de estoque</span>
          )}
        </p>

        <div className="mt-auto flex justify-center">
          <Link
            to={`/produtos/${product.slug}`}
            className="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-hover hover:shadow-md active:bg-brand-dark"
          >
            Ver Produto
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default ProductCard
