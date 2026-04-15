/**
 * Types e Interfaces - Feature Products
 * Camada [M] do MVC
 */

export interface Product {
  id: string
  fornecedorId: string
  fornecedorNome?: string
  nome: string
  slug: string
  descricao: string | null
  preco: number
  precoPromocional: number | null
  estoque: number
  imagens: string[]
  categoria: string
  subcategoria: string | null
  sku: string | null
  peso: number | null
  dimensoes: Dimensoes | null
  caracteristicas: Record<string, unknown> | null
  ativo: boolean
  destaque: boolean
  createdAt: string
  updatedAt: string
}

export interface Dimensoes {
  altura: number
  largura: number
  comprimento: number
  unidade: 'cm' | 'm'
}

export type ProductSortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'mais-novo' | 'nome-az'

export interface ProductFilters {
  categoria?: string
  fornecedorId?: string
  busca?: string
  precoMin?: number
  precoMax?: number
  destaque?: boolean
  sort?: ProductSortOption
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface ProductsError {
  message: string
  code?: string
}

export interface CategoryWithCount {
  name: string
  count: number
}
