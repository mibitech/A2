import { supabase } from '@lib/supabase/client'

export type TipoLancamento = 'entrada' | 'saida'
export type TipoCategoria = 'entrada' | 'saida' | 'ambos'

export interface CategoriaCaixa {
  id: string
  nome: string
  tipo: TipoCategoria
  ativo: boolean
  createdAt: string
}

export interface LancamentoCaixa {
  id: string
  tipo: TipoLancamento
  categoria: string
  descricao: string
  valor: number
  dataRef: string
  observacoes: string | null
  criadoPor: string | null
  createdAt: string
}

export interface ResumoFinanceiro {
  totalEntradas: number
  totalSaidas: number
  saldo: number
}

// =====================================================
// CATEGORIAS
// =====================================================

export async function getCategorias(): Promise<{ categorias: CategoriaCaixa[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('categorias_caixa')
      .select('*')
      .order('tipo')
      .order('nome')

    if (error) return { categorias: [], error: error.message }

    const categorias: CategoriaCaixa[] = (data ?? []).map(c => ({
      id: c.id,
      nome: c.nome,
      tipo: c.tipo,
      ativo: c.ativo,
      createdAt: c.created_at,
    }))

    return { categorias, error: null }
  } catch {
    return { categorias: [], error: 'Erro ao buscar categorias' }
  }
}

export async function criarCategoria(payload: {
  nome: string
  tipo: TipoCategoria
}): Promise<{ categoria: CategoriaCaixa | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('categorias_caixa')
      // @ts-ignore — tabela não está no tipo gerado do Supabase
      .insert({ nome: payload.nome.trim().toLowerCase(), tipo: payload.tipo })
      .select()
      .single()

    if (error) {
      const msg = error.code === '23505' ? 'Já existe uma categoria com esse nome e tipo' : error.message
      return { categoria: null, error: msg }
    }

    return {
      categoria: { id: data.id, nome: data.nome, tipo: data.tipo, ativo: data.ativo, createdAt: data.created_at },
      error: null,
    }
  } catch {
    return { categoria: null, error: 'Erro ao criar categoria' }
  }
}

export async function toggleCategoria(id: string, ativo: boolean): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('categorias_caixa').update({ ativo }).eq('id', id)
    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao atualizar categoria' }
  }
}

export async function excluirCategoria(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('categorias_caixa').delete().eq('id', id)
    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao excluir categoria' }
  }
}

// =====================================================
// LANÇAMENTOS
// =====================================================

export async function getLancamentos(filtros?: {
  tipo?: TipoLancamento
  dataInicio?: string
  dataFim?: string
}): Promise<{ lancamentos: LancamentoCaixa[]; error: string | null }> {
  try {
    let query = supabase
      .from('lancamentos_caixa')
      .select('*')
      .order('data_ref', { ascending: false })
      .order('created_at', { ascending: false })

    if (filtros?.tipo) query = query.eq('tipo', filtros.tipo)
    if (filtros?.dataInicio) query = query.gte('data_ref', filtros.dataInicio)
    if (filtros?.dataFim) query = query.lte('data_ref', filtros.dataFim)

    const { data, error } = await Promise.race([
      query,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 15_000)),
    ]) as { data: any[] | null; error: { message: string } | null }

    if (error) return { lancamentos: [], error: error.message }

    const lancamentos: LancamentoCaixa[] = (data ?? []).map(l => ({
      id: l.id,
      tipo: l.tipo,
      categoria: l.categoria,
      descricao: l.descricao,
      valor: Number(l.valor),
      dataRef: l.data_ref,
      observacoes: l.observacoes,
      criadoPor: l.criado_por,
      createdAt: l.created_at,
    }))

    return { lancamentos, error: null }
  } catch (err) {
    const msg = err instanceof Error && err.message === 'timeout'
      ? 'Banco de dados demorando a responder. Tente novamente em instantes.'
      : 'Erro ao buscar lançamentos'
    return { lancamentos: [], error: msg }
  }
}

export async function criarLancamento(payload: {
  tipo: TipoLancamento
  categoria: string
  descricao: string
  valor: number
  dataRef: string
  observacoes?: string
  criadoPor?: string
}): Promise<{ error: string | null }> {
  try {
    // @ts-ignore — tabela não está no tipo gerado do Supabase
    const { error } = await supabase.from('lancamentos_caixa').insert({
      tipo: payload.tipo,
      categoria: payload.categoria,
      descricao: payload.descricao,
      valor: payload.valor,
      data_ref: payload.dataRef,
      observacoes: payload.observacoes ?? null,
      criado_por: payload.criadoPor ?? null,
    })

    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao criar lançamento' }
  }
}

export async function excluirLancamento(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('lancamentos_caixa').delete().eq('id', id)
    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao excluir lançamento' }
  }
}

export function calcularResumo(lancamentos: LancamentoCaixa[]): ResumoFinanceiro {
  const totalEntradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
  const totalSaidas = lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)
  return { totalEntradas, totalSaidas, saldo: totalEntradas - totalSaidas }
}
