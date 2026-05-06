import { supabase } from '@lib/supabase/client'

export interface ClienteAdmin {
  id: string
  email: string
  nomeCompleto: string | null
  telefone: string | null
  cpfCnpj: string | null
  tipoPessoa: 'fisica' | 'juridica'
  role: 'cliente' | 'funcionario' | 'admin'
  tags: string[]
  createdAt: string
  totalPedidos: number
  totalGasto: number
}

// ===== LISTAR TODOS OS USUÁRIOS =====
export async function getAllClientes(): Promise<{ clientes: ClienteAdmin[]; error: string | null }> {
  try {
    const { data, error } = await Promise.race([
      supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 15_000)),
    ]) as { data: { id: string; email: string; nome_completo: string | null; telefone: string | null; cpf_cnpj: string | null; tipo_pessoa: 'fisica' | 'juridica'; role: 'cliente' | 'funcionario' | 'admin'; tags: string[] | null; created_at: string }[] | null; error: { message: string } | null }

    if (error) return { clientes: [], error: error.message }

    const clientes: ClienteAdmin[] = (data ?? []).map(u => ({
      id: u.id,
      email: u.email,
      nomeCompleto: u.nome_completo,
      telefone: u.telefone,
      cpfCnpj: u.cpf_cnpj,
      tipoPessoa: u.tipo_pessoa,
      role: u.role,
      tags: u.tags ?? [],
      createdAt: u.created_at,
      totalPedidos: 0,
      totalGasto: 0,
    }))

    return { clientes, error: null }
  } catch (err) {
    const msg = err instanceof Error && err.message === 'timeout'
      ? 'Banco de dados demorando a responder. Tente novamente em instantes.'
      : 'Erro ao buscar clientes'
    return { clientes: [], error: msg }
  }
}

// ===== BUSCAR PEDIDOS DE UM CLIENTE =====
export interface PedidoResumo {
  id: string
  status: string
  total: number
  createdAt: string
}

export async function getPedidosCliente(
  usuarioId: string
): Promise<{ pedidos: PedidoResumo[]; error: string | null }> {
  try {
    const { data, error } = await Promise.race([
      supabase
        .from('pedidos')
        .select('id, status, total, created_at')
        .eq('usuario_id', usuarioId)
        .order('created_at', { ascending: false }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 15_000)),
    ]) as { data: { id: string; status: string; total: number; created_at: string }[] | null; error: { message: string } | null }

    if (error) return { pedidos: [], error: error.message }

    const pedidos: PedidoResumo[] = (data ?? []).map(p => ({
      id: p.id,
      status: p.status,
      total: p.total,
      createdAt: p.created_at,
    }))

    return { pedidos, error: null }
  } catch {
    return { pedidos: [], error: 'Erro ao buscar pedidos' }
  }
}

// ===== ATUALIZAR TAGS DO USUÁRIO =====
export async function updateTagsCliente(
  id: string,
  tags: string[]
): Promise<{ error: string | null }> {
  try {
    const { error, count } = await (supabase.from('usuarios') as any)
      .update({ tags })
      .eq('id', id)
      .select('id', { count: 'exact', head: true })

    if (error) return { error: error.message }
    if (count === 0) return { error: 'Sem permissão para atualizar este perfil' }
    return { error: null }
  } catch {
    return { error: 'Erro ao atualizar tags' }
  }
}

// ===== BUSCAR TAGS ÚNICAS DE TODOS OS USUÁRIOS =====
export async function getTagsUnicas(): Promise<string[]> {
  try {
    const { data } = await (supabase.from('usuarios') as any)
      .select('tags')
      .not('tags', 'is', null)
    if (!data) return []
    const todas = (data as { tags: string[] | null }[])
      .flatMap(u => u.tags ?? [])
    return [...new Set(todas)].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  } catch {
    return []
  }
}

// ===== ATUALIZAR PERFIL DO USUÁRIO =====
export async function updatePerfilCliente(
  id: string,
  dados: { nomeCompleto?: string; telefone?: string; cpfCnpj?: string; tipoPessoa?: 'fisica' | 'juridica' }
): Promise<{ error: string | null }> {
  try {
    const payload: Record<string, unknown> = {}
    if (dados.nomeCompleto !== undefined) payload.nome_completo = dados.nomeCompleto || null
    if (dados.telefone !== undefined) payload.telefone = dados.telefone || null
    if (dados.cpfCnpj !== undefined) payload.cpf_cnpj = dados.cpfCnpj || null
    if (dados.tipoPessoa !== undefined) payload.tipo_pessoa = dados.tipoPessoa

    const { error, count } = await (supabase.from('usuarios') as any)
      .update(payload)
      .eq('id', id)
      .select('id', { count: 'exact', head: true })

    if (error) return { error: error.message }
    if (count === 0) return { error: 'Sem permissão para atualizar este perfil' }
    return { error: null }
  } catch {
    return { error: 'Erro ao atualizar perfil' }
  }
}

// ===== ATUALIZAR ROLE DO USUÁRIO =====
export async function updateRoleCliente(
  id: string,
  role: 'cliente' | 'funcionario' | 'admin'
): Promise<{ error: string | null }> {
  try {
    const { error, count } = await (supabase.from('usuarios') as any)
      .update({ role })
      .eq('id', id)
      .select('id', { count: 'exact', head: true })

    if (error) return { error: error.message }
    if (count === 0) return { error: 'Sem permissão para atualizar este perfil' }
    return { error: null }
  } catch {
    return { error: 'Erro ao atualizar role' }
  }
}
