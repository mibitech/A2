import { supabase } from '@lib/supabase/client'

export type LoteStatus = 'ativo' | 'aguardando' | 'encerrado'

export interface Lote {
  id: string
  produto_id: string
  fornecedor_id: string
  numero_lote: string
  quantidade_inicial: number
  estoque_atual: number
  status: LoteStatus
  observacoes: string | null
  created_at: string
  fornecedor?: { nome: string }
}

export interface LoteInput {
  produto_id: string
  fornecedor_id: string
  numero_lote: string
  quantidade_inicial: number
  estoque_atual: number
  observacoes?: string
}

export async function listarLotesPorProduto(produtoId: string): Promise<{ data: Lote[]; error: string | null }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    const { data, error } = await supabase
      .from('lotes')
      .select('*, fornecedor:fornecedores(nome)')
      .eq('produto_id', produtoId)
      .order('created_at', { ascending: false })
      .abortSignal(controller.signal)
      .then(r => { clearTimeout(timeoutId); return r })

    if (error) return { data: [], error: error.message }
    return { data: (data ?? []) as unknown as Lote[], error: null }
  } catch {
    clearTimeout(timeoutId)
    return { data: [], error: 'Tempo limite excedido' }
  }
}

export async function buscarLoteAtivo(produtoId: string): Promise<{ data: Lote | null; error: string | null }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    const query = supabase
      .from('lotes')
      .select('*, fornecedor:fornecedores(nome)')
      .eq('produto_id', produtoId)
      .eq('status', 'ativo')
      .abortSignal(controller.signal)
      .maybeSingle()

    const { data, error } = await query.then(r => { clearTimeout(timeoutId); return r })

    if (error) return { data: null, error: error.message }
    return { data: data as unknown as Lote | null, error: null }
  } catch {
    clearTimeout(timeoutId)
    return { data: null, error: 'Tempo limite excedido' }
  }
}

export async function criarLote(input: LoteInput): Promise<{ data: Lote | null; error: string | null }> {
  // Novo lote sempre começa como 'aguardando' — admin ativa explicitamente
  const { data, error } = await supabase
    .from('lotes')
    .insert({ ...input, status: 'aguardando' } as never)
    .select('*, fornecedor:fornecedores(nome)')
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as unknown as Lote, error: null }
}

export async function ativarLote(id: string, produtoId: string): Promise<{ error: string | null }> {
  // Move o lote ativo atual para 'aguardando'
  const { error: desativErr } = await (supabase.from('lotes') as any)
    .update({ status: 'aguardando' })
    .eq('produto_id', produtoId)
    .eq('status', 'ativo')

  if (desativErr) return { error: desativErr.message }

  // Ativa o lote solicitado
  const { error } = await (supabase.from('lotes') as any)
    .update({ status: 'ativo' })
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}

export async function encerrarLote(id: string): Promise<{ error: string | null }> {
  const { error } = await (supabase.from('lotes') as any)
    .update({ status: 'encerrado' })
    .eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}

export async function atualizarLote(
  id: string,
  campos: Partial<Pick<LoteInput, 'numero_lote' | 'fornecedor_id' | 'observacoes'>>
): Promise<{ error: string | null }> {
  const { error } = await (supabase.from('lotes') as any).update(campos).eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}

export async function atualizarEstoqueLote(
  loteId: string,
  novoEstoque: number
): Promise<{ error: string | null }> {
  const { error } = await (supabase.from('lotes') as any)
    .update({ estoque_atual: novoEstoque })
    .eq('id', loteId)
  if (error) return { error: error.message }
  return { error: null }
}
