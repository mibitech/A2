import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../controllers/useProducts'
import { useCart } from '@/features/cart/contexts/CartContext'
import ProductCard from './ProductCard'
import { Button } from '@components/ui'
import { Header, Footer } from '@components/layout'

const MAX_PRICE = 5000

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function ProductsPage() {
  const {
    products,
    total,
    page,
    totalPages,
    isLoading,
    error,
    categories,
    filters,
    updateFilters,
    clearFilters,
    goToPage,
  } = useProducts()

  const { itemsCount } = useCart()
  const [openSections, setOpenSections] = useState({ categoria: true, preco: true })
  const [precoMax, setPrecoMax] = useState(MAX_PRICE)

  const toggleSection = (s: 'categoria' | 'preco') =>
    setOpenSections(prev => ({ ...prev, [s]: !prev[s] }))

  const handleCategoryChange = (name: string) => {
    updateFilters({ categoria: filters.categoria === name ? undefined : name })
  }

  const handlePrecoChange = (val: number) => {
    setPrecoMax(val)
    updateFilters({ precoMin: 0, precoMax: val < MAX_PRICE ? val : undefined })
  }

  const hasActiveFilters = !!(filters.categoria || filters.precoMax)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const SORT_OPTIONS = [
    { value: 'relevancia',   label: 'Mais relevantes' },
    { value: 'mais-novo',    label: 'Mais novos' },
    { value: 'menor-preco',  label: 'Menor preço' },
    { value: 'maior-preco',  label: 'Maior preço' },
    { value: 'nome-az',      label: 'Nome A-Z' },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex-1 bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb + título */}
          <div className="mb-4 flex items-center justify-between">
            <nav className="text-sm text-neutral-500">
              <Link to="/" className="hover:text-brand">Início</Link>
              <span className="mx-2">›</span>
              <span className="font-semibold text-neutral-900">Produtos Industriais</span>
            </nav>
            {/* Botão filtros mobile */}
            <button
              onClick={() => setMobileFiltersOpen(v => !v)}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm lg:hidden"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filtros
              {hasActiveFilters && <span className="rounded-full bg-brand px-1.5 py-0.5 text-xs text-white">!</span>}
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            {/* ── Sidebar ── */}
            <aside className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                  <h2 className="font-semibold text-neutral-900">Filtros</h2>
                  {hasActiveFilters && (
                    <button
                      onClick={() => { clearFilters(); setPrecoMax(MAX_PRICE) }}
                      className="text-sm text-brand hover:underline"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>

                {/* Categoria */}
                <div className="border-b border-neutral-100">
                  <button
                    onClick={() => toggleSection('categoria')}
                    className="flex w-full items-center justify-between px-4 py-3 hover:bg-neutral-50"
                  >
                    <span className="text-sm font-semibold text-neutral-800">Categoria</span>
                    <ChevronIcon open={openSections.categoria} />
                  </button>
                  {openSections.categoria && (
                    <div className="space-y-1 px-4 pb-3">
                      {categories.map(cat => (
                        <label key={cat.name} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 hover:bg-neutral-50">
                          <input
                            type="checkbox"
                            checked={filters.categoria === cat.name}
                            onChange={() => handleCategoryChange(cat.name)}
                            className="h-4 w-4 rounded border-neutral-300 accent-brand"
                          />
                          <span className="flex-1 text-sm text-neutral-700">{cat.name}</span>
                          <span className="text-xs text-neutral-400">({cat.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preço */}
                <div>
                  <button
                    onClick={() => toggleSection('preco')}
                    className="flex w-full items-center justify-between px-4 py-3 hover:bg-neutral-50"
                  >
                    <span className="text-sm font-semibold text-neutral-800">Preço</span>
                    <ChevronIcon open={openSections.preco} />
                  </button>
                  {openSections.preco && (
                    <div className="px-4 pb-4">
                      <input
                        type="range"
                        min={0}
                        max={MAX_PRICE}
                        step={50}
                        value={precoMax}
                        onChange={e => handlePrecoChange(Number(e.target.value))}
                        className="w-full accent-brand"
                      />
                      <div className="mt-1 flex justify-between text-xs text-neutral-500">
                        <span>R$ 0</span>
                        <span>R$ {precoMax.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Grid de Produtos */}
            <div>
              {/* ── Toolbar ── */}
              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
                <span className="text-sm text-neutral-500">
                  {isLoading ? '...' : <><strong className="text-neutral-800">{total}</strong> {total === 1 ? 'resultado' : 'resultados'}</>}
                </span>
                <div className="flex items-center gap-3">
                  {/* Ordenação */}
                  <div className="flex items-center gap-2">
                    <span className="hidden text-sm text-neutral-500 sm:inline">Ordenar:</span>
                    <select
                      value={filters.sort ?? 'relevancia'}
                      onChange={e => updateFilters({ sort: e.target.value as any })}
                      className="rounded-lg border border-neutral-200 bg-white py-1.5 pl-2 pr-7 text-sm font-medium text-neutral-700 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    >
                      {SORT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* Toggle grid/lista */}
                  <div className="flex overflow-hidden rounded-lg border border-neutral-200">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-brand text-white' : 'bg-white text-neutral-400 hover:bg-neutral-50'}`}
                      title="Visualização em grade"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-brand text-white' : 'bg-white text-neutral-400 hover:bg-neutral-50'}`}
                      title="Visualização em lista"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-error-light p-4 text-error-dark">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
                    <p className="text-neutral-600">Carregando produtos...</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
                  <p className="text-neutral-600">
                    Nenhum produto encontrado com os filtros aplicados.
                  </p>
                </div>
              ) : (
                <>
                  {/* Grid / Lista de Produtos */}
                  <div className={viewMode === 'grid'
                    ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'flex flex-col gap-4'
                  }>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} listMode={viewMode === 'list'} />
                    ))}
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                      >
                        Anterior
                      </Button>

                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (p) => (
                            <button
                              key={p}
                              onClick={() => goToPage(p)}
                              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                                p === page
                                  ? 'bg-brand text-white'
                                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        Próxima
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProductsPage
