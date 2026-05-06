import { useState, useEffect, useCallback } from 'react'
import * as productsService from '../services/products.service'
import type {
  Product,
  ProductFilters,
  CategoryWithCount,
} from '../models/products.types'

/**
 * Hook useProducts - Controller de Produtos
 * Camada [C] do MVC - Orquestra estado e services
 */

interface UseProductsState {
  products: Product[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  isRetrying: boolean
  error: string | null
  categories: CategoryWithCount[]
}

const initialState: UseProductsState = {
  products: [],
  total: 0,
  page: 1,
  totalPages: 0,
  isLoading: false,
  isRetrying: false,
  error: null,
  categories: [] as CategoryWithCount[],
}

export function useProducts(initialFilters: ProductFilters = {}) {
  const [state, setState] = useState<UseProductsState>(initialState)
  const [filters, setFilters] = useState<ProductFilters>(initialFilters)

  // Carregar produtos com retry automático (trata conexão ociosa)
  const loadProducts = useCallback(
    async (page: number = 1, tentativa = 1) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isRetrying: tentativa > 1,
        error: null,
      }))

      const { data, error } = await productsService.getProducts(filters, page)

      if (error) {
        // Se falhou na 1ª tentativa, aguarda 1s e tenta novamente automaticamente
        if (tentativa === 1) {
          await new Promise((r) => setTimeout(r, 1_000))
          return loadProducts(page, 2)
        }
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRetrying: false,
          error: error.message,
        }))
        return
      }

      if (data) {
        setState((prev) => ({
          ...prev,
          products: data.products,
          total: data.total,
          page: data.page,
          totalPages: data.totalPages,
          isLoading: false,
          isRetrying: false,
          error: null,
        }))
      }
    },
    [filters]
  )

  // Carregar categorias
  const loadCategories = useCallback(async () => {
    const { data } = await productsService.getCategories()
    if (data) {
      setState((prev) => ({ ...prev, categories: data }))
    }
  }, [])

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: ProductFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Ir para página
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= state.totalPages) {
        loadProducts(page)
      }
    },
    [loadProducts, state.totalPages]
  )

  // Carregar produtos quando filtros mudarem
  useEffect(() => {
    loadProducts(1)
  }, [loadProducts])

  // Carregar categorias no mount
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    // Estado
    products: state.products,
    total: state.total,
    page: state.page,
    totalPages: state.totalPages,
    isLoading: state.isLoading,
    isRetrying: state.isRetrying,
    error: state.error,
    categories: state.categories,
    filters,

    // Ações
    updateFilters,
    clearFilters,
    goToPage,
    refresh: () => loadProducts(state.page),
  }
}

// Hook para produto individual
export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true)
      setError(null)

      const { data, error: err } = await productsService.getProductBySlug(slug)

      if (err) {
        setError(err.message)
        setProduct(null)
      } else {
        setProduct(data)
      }

      setIsLoading(false)
    }

    loadProduct()
  }, [slug])

  return {
    product,
    isLoading,
    error,
  }
}
