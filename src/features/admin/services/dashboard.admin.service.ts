import { supabase } from '@lib/supabase/client'

export interface DashboardStats {
  pedidosHoje: number
  receitaMes: number
  produtosAtivos: number
  totalClientes: number
}

export interface PedidoRecente {
  id: string
  status: string
  total: number
  createdAt: string
  nomeCliente: string | null
  emailCliente: string | null
}

export interface ProdutoEstoqueBaixo {
  id: string
  nome: string
  sku: string | null
  estoque: number
}

// ===== MÉTRICAS GERAIS =====
export async function getDashboardStats(): Promise<{ stats: DashboardStats; error: string | null }> {
  try {
    const hoje = new Date()
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()

    const [pedidosHoje, receitaMes, produtos, clientes] = await Promise.all([
      supabase
        .from('pedidos')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', inicioHoje),

      supabase
        .from('pedidos')
        .select('total')
        .gte('created_at', inicioMes)
        .not('status', 'in', '(pendente,cancelado)'),

      supabase
        .from('produtos')
        .select('id', { count: 'exact', head: true })
        .eq('ativo', true),

      supabase
        .from('usuarios')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'cliente'),
    ])

    const receita = ((receitaMes.data ?? []) as { total: number }[]).reduce((acc, p) => acc + (p.total ?? 0), 0)

    return {
      stats: {
        pedidosHoje: pedidosHoje.count ?? 0,
        receitaMes: receita,
        produtosAtivos: produtos.count ?? 0,
        totalClientes: clientes.count ?? 0,
      },
      error: null,
    }
  } catch {
    return {
      stats: { pedidosHoje: 0, receitaMes: 0, produtosAtivos: 0, totalClientes: 0 },
      error: 'Erro ao buscar métricas',
    }
  }
}

// ===== ÚLTIMOS 5 PEDIDOS =====
export async function getPedidosRecentes(): Promise<{ pedidos: PedidoRecente[]; error: string | null }> {
  try {
    const { data, error } = await Promise.race([
      supabase
        .from('pedidos')
        .select('id, status, total, created_at, usuario:usuarios(nome_completo, email)')
        .order('created_at', { ascending: false })
        .limit(5),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]) as {
      data: {
        id: string
        status: string
        total: number
        created_at: string
        usuario: { nome_completo: string | null; email: string } | null
      }[] | null
      error: { message: string } | null
    }

    if (error) return { pedidos: [], error: error.message }

    const pedidos: PedidoRecente[] = (data ?? []).map(p => ({
      id: p.id,
      status: p.status,
      total: p.total,
      createdAt: p.created_at,
      nomeCliente: p.usuario?.nome_completo ?? null,
      emailCliente: p.usuario?.email ?? null,
    }))

    return { pedidos, error: null }
  } catch {
    return { pedidos: [], error: 'Erro ao buscar pedidos recentes' }
  }
}

// ===== PRODUTOS COM ESTOQUE BAIXO (≤ 5) =====
export async function getProdutosEstoqueBaixo(): Promise<{ produtos: ProdutoEstoqueBaixo[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('id, nome, sku, estoque')
      .eq('ativo', true)
      .lte('estoque', 5)
      .order('estoque', { ascending: true })
      .limit(5)

    if (error) return { produtos: [], error: error.message }

    return { produtos: data ?? [], error: null }
  } catch {
    return { produtos: [], error: 'Erro ao buscar estoque baixo' }
  }
}
