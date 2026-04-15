import { supabase } from '@lib/supabase/client'
import type {
  Product,
  ProductFilters,
  ProductsResponse,
  ProductsError,
  CategoryWithCount,
} from '../models/products.types'

/**
 * Service de Produtos
 * Camada [M] do MVC - Acesso ao Supabase
 */

const ITEMS_PER_PAGE = 20

// Helper para mapear dados do banco para o tipo Product
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProductFromDB(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    fornecedorId: dbProduct.fornecedor_id,
    fornecedorNome: dbProduct.fornecedores?.nome,
    nome: dbProduct.nome,
    slug: dbProduct.slug,
    descricao: dbProduct.descricao,
    preco: Number(dbProduct.preco),
    precoPromocional: dbProduct.preco_promocional
      ? Number(dbProduct.preco_promocional)
      : null,
    estoque: dbProduct.estoque,
    imagens: dbProduct.imagens || [],
    categoria: dbProduct.categoria,
    subcategoria: dbProduct.subcategoria,
    sku: dbProduct.sku,
    peso: dbProduct.peso ? Number(dbProduct.peso) : null,
    dimensoes: dbProduct.dimensoes,
    caracteristicas: dbProduct.caracteristicas,
    ativo: dbProduct.ativo,
    destaque: dbProduct.destaque,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  }
}

// ===== LISTAR PRODUTOS =====
export async function getProducts(
  filters: ProductFilters = {},
  page: number = 1
): Promise<{
  data: ProductsResponse | null
  error: ProductsError | null
}> {
  try {
    // Calcular offset para paginação
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    // Construir query base
    let query = supabase
      .from('produtos')
      .select(
        `
        *,
        fornecedores (
          nome
        )
      `,
        { count: 'exact' }
      )
      .eq('ativo', true) // Apenas produtos ativos

    // Aplicar filtros dinâmicos
    if (filters.categoria) {
      query = query.eq('categoria', filters.categoria)
    }

    if (filters.fornecedorId) {
      query = query.eq('fornecedor_id', filters.fornecedorId)
    }

    if (filters.destaque !== undefined) {
      query = query.eq('destaque', filters.destaque)
    }

    if (filters.precoMin !== undefined) {
      query = query.gte('preco', filters.precoMin)
    }

    if (filters.precoMax !== undefined) {
      query = query.lte('preco', filters.precoMax)
    }

    // Busca por texto (nome ou descrição)
    if (filters.busca) {
      query = query.or(
        `nome.ilike.%${filters.busca}%,descricao.ilike.%${filters.busca}%`
      )
    }

    // Ordenação e paginação
    switch (filters.sort) {
      case 'menor-preco': query = query.order('preco', { ascending: true }); break
      case 'maior-preco': query = query.order('preco', { ascending: false }); break
      case 'nome-az':     query = query.order('nome',  { ascending: true });  break
      case 'mais-novo':
      default:            query = query.order('created_at', { ascending: false }); break
    }
    query = query.range(from, to)

    // Executar query
    const { data, error, count } = await query

    if (error) {
      console.error('Erro ao buscar produtos:', error)
      return {
        data: null,
        error: { message: error.message, code: error.code },
      }
    }

    if (!data) {
      return {
        data: {
          products: [],
          total: 0,
          page,
          perPage: ITEMS_PER_PAGE,
          totalPages: 0,
        },
        error: null,
      }
    }

    // Mapear produtos
    const products = data.map(mapProductFromDB)
    const total = count || 0
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

    return {
      data: {
        products,
        total,
        page,
        perPage: ITEMS_PER_PAGE,
        totalPages,
      },
      error: null,
    }
  } catch (error) {
    console.error('Erro inesperado ao buscar produtos:', error)
    return {
      data: null,
      error: { message: 'Erro inesperado ao buscar produtos' },
    }
  }
}

// ===== BUSCAR PRODUTO POR SLUG =====
export async function getProductBySlug(slug: string): Promise<{
  data: Product | null
  error: ProductsError | null
}> {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select(
        `
        *,
        fornecedores (
          nome
        )
      `
      )
      .eq('slug', slug)
      .eq('ativo', true)
      .single()

    if (error) {
      console.error('Erro ao buscar produto:', error)
      return {
        data: null,
        error: { message: error.message, code: error.code },
      }
    }

    if (!data) {
      return {
        data: null,
        error: { message: 'Produto não encontrado' },
      }
    }

    return {
      data: mapProductFromDB(data),
      error: null,
    }
  } catch (error) {
    console.error('Erro inesperado ao buscar produto:', error)
    return {
      data: null,
      error: { message: 'Erro inesperado ao buscar produto' },
    }
  }
}

// ===== BUSCAR CATEGORIAS COM CONTAGEM =====
export async function getCategories(): Promise<{
  data: CategoryWithCount[] | null
  error: ProductsError | null
}> {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('categoria')
      .eq('ativo', true)

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return {
        data: null,
        error: { message: error.message, code: error.code },
      }
    }

    const counts = data.reduce((acc: Record<string, number>, { categoria }) => {
      acc[categoria] = (acc[categoria] || 0) + 1
      return acc
    }, {})

    const categories = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return { data: categories, error: null }
  } catch (error) {
    console.error('Erro inesperado ao buscar categorias:', error)
    return {
      data: null,
      error: { message: 'Erro inesperado ao buscar categorias' },
    }
  }
}
