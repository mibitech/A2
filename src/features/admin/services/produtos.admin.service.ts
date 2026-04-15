import { supabase } from '@lib/supabase/client'
import type { Database } from '@/types/supabase'

type ProdutoRow = Database['public']['Tables']['produtos']['Row']
type ProdutoInsert = Database['public']['Tables']['produtos']['Insert']
type ProdutoUpdate = Database['public']['Tables']['produtos']['Update']

export interface ProdutoAdmin {
  id: string
  fornecedorId: string
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
  ativo: boolean
  destaque: boolean
  createdAt: string
  updatedAt: string
}

export interface MovimentacaoEstoque {
  id: string
  produtoId: string
  usuarioId: string | null
  tipo: 'entrada' | 'saida' | 'ajuste'
  quantidade: number
  estoqueAnterior: number
  estoquePosterior: number
  motivo: string | null
  createdAt: string
}

function mapProduto(row: ProdutoRow): ProdutoAdmin {
  return {
    id: row.id,
    fornecedorId: row.fornecedor_id,
    nome: row.nome,
    slug: row.slug,
    descricao: row.descricao,
    preco: row.preco,
    precoPromocional: row.preco_promocional,
    estoque: row.estoque,
    imagens: row.imagens ?? [],
    categoria: row.categoria,
    subcategoria: row.subcategoria,
    sku: row.sku,
    peso: row.peso,
    ativo: row.ativo,
    destaque: row.destaque,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ===== LISTAR TODOS OS PRODUTOS (inclusive inativos) =====
export async function getAllProdutos(): Promise<{ produtos: ProdutoAdmin[]; error: string | null }> {
  try {
    const { data, error } = await Promise.race([
      supabase.from('produtos').select('*').order('nome', { ascending: true }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]) as { data: ProdutoRow[] | null; error: { message: string } | null }

    if (error) return { produtos: [], error: error.message }
    return { produtos: (data ?? []).map(mapProduto), error: null }
  } catch (err) {
    const msg = err instanceof Error && err.message === 'timeout'
      ? 'Timeout ao buscar produtos. Verifique as permissões RLS no Supabase.'
      : 'Erro ao buscar produtos'
    return { produtos: [], error: msg }
  }
}

// ===== CRIAR PRODUTO =====
export async function createProduto(
  data: Omit<ProdutoInsert, 'id' | 'created_at' | 'updated_at'>
): Promise<{ produto: ProdutoAdmin | null; error: string | null }> {
  try {
    const { data: row, error } = await supabase
      .from('produtos')
      .insert(data)
      .select()
      .single()

    if (error) return { produto: null, error: error.message }
    return { produto: mapProduto(row), error: null }
  } catch {
    return { produto: null, error: 'Erro ao criar produto' }
  }
}

// ===== ATUALIZAR PRODUTO =====
export async function updateProduto(
  id: string,
  data: ProdutoUpdate
): Promise<{ produto: ProdutoAdmin | null; error: string | null }> {
  try {
    const { data: row, error } = await supabase
      .from('produtos')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) return { produto: null, error: error.message }
    return { produto: mapProduto(row), error: null }
  } catch {
    return { produto: null, error: 'Erro ao atualizar produto' }
  }
}

// ===== DELETAR PRODUTO (soft delete — ativo = false) =====
export async function deleteProduto(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('produtos')
      .update({ ativo: false })
      .eq('id', id)

    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao desativar produto' }
  }
}

// ===== UPLOAD DE IMAGEM =====
export async function uploadImagemProduto(
  file: File,
  produtoId: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const ext = file.name.split('.').pop()
    const path = `${produtoId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('produtos')
      .upload(path, file, { upsert: false })

    if (uploadError) return { url: null, error: uploadError.message }

    const { data } = supabase.storage.from('produtos').getPublicUrl(path)
    return { url: data.publicUrl, error: null }
  } catch {
    return { url: null, error: 'Erro ao fazer upload da imagem' }
  }
}

// ===== REMOVER IMAGEM DO STORAGE =====
export async function removeImagemProduto(url: string): Promise<{ error: string | null }> {
  try {
    // Extrai o path da URL pública
    const path = url.split('/storage/v1/object/public/produtos/')[1]
    if (!path) return { error: 'URL inválida' }

    const { error } = await supabase.storage.from('produtos').remove([path])
    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao remover imagem' }
  }
}

// ===== REGISTRAR MOVIMENTAÇÃO DE ESTOQUE =====
export async function registrarMovimentacao(data: {
  produtoId: string
  usuarioId: string
  tipo: 'entrada' | 'saida' | 'ajuste'
  quantidade: number
  estoqueAnterior: number
  motivo?: string
}): Promise<{ error: string | null }> {
  const estoquePosterior =
    data.tipo === 'entrada'
      ? data.estoqueAnterior + data.quantidade
      : data.tipo === 'saida'
        ? data.estoqueAnterior - data.quantidade
        : data.estoqueAnterior + data.quantidade // ajuste pode ser + ou -

  try {
    const { error } = await supabase.from('movimentacoes_estoque').insert({
      produto_id: data.produtoId,
      usuario_id: data.usuarioId,
      tipo: data.tipo,
      quantidade: data.quantidade,
      estoque_anterior: data.estoqueAnterior,
      estoque_posterior: estoquePosterior,
      motivo: data.motivo ?? null,
    })

    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao registrar movimentação' }
  }
}

// ===== BUSCAR MOVIMENTAÇÕES DE UM PRODUTO =====
export async function getMovimentacoes(
  produtoId: string
): Promise<{ movimentacoes: MovimentacaoEstoque[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .select('*')
      .eq('produto_id', produtoId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return { movimentacoes: [], error: error.message }

    const movimentacoes: MovimentacaoEstoque[] = (data ?? []).map(row => ({
      id: row.id,
      produtoId: row.produto_id,
      usuarioId: row.usuario_id,
      tipo: row.tipo as 'entrada' | 'saida' | 'ajuste',
      quantidade: row.quantidade,
      estoqueAnterior: row.estoque_anterior,
      estoquePosterior: row.estoque_posterior,
      motivo: row.motivo,
      createdAt: row.created_at,
    }))

    return { movimentacoes, error: null }
  } catch {
    return { movimentacoes: [], error: 'Erro ao buscar movimentações' }
  }
}
