import { supabase } from '@lib/supabase/client'

export interface ClienteAdmin {
  id: string
  email: string
  nomeCompleto: string | null
  telefone: string | null
  cpfCnpj: string | null
  tipoPessoa: 'fisica' | 'juridica'
  role: 'cliente' | 'funcionario' | 'admin'
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
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]) as { data: { id: string; email: string; nome_completo: string | null; telefone: string | null; cpf_cnpj: string | null; tipo_pessoa: 'fisica' | 'juridica'; role: 'cliente' | 'funcionario' | 'admin'; created_at: string }[] | null; error: { message: string } | null }

    if (error) return { clientes: [], error: error.message }

    const clientes: ClienteAdmin[] = (data ?? []).map(u => ({
      id: u.id,
      email: u.email,
      nomeCompleto: u.nome_completo,
      telefone: u.telefone,
      cpfCnpj: u.cpf_cnpj,
      tipoPessoa: u.tipo_pessoa,
      role: u.role,
      createdAt: u.created_at,
      totalPedidos: 0,
      totalGasto: 0,
    }))

    return { clientes, error: null }
  } catch (err) {
    const msg = err instanceof Error && err.message === 'timeout'
      ? 'Timeout ao buscar clientes. Verifique as permissões RLS.'
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
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
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

// ===== ATUALIZAR ROLE DO USUÁRIO =====
export async function updateRoleCliente(
  id: string,
  role: 'cliente' | 'funcionario' | 'admin'
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ role })
      .eq('id', id)

    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao atualizar role' }
  }
}
