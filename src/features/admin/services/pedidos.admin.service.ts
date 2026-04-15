import { supabase } from '@lib/supabase/client'

export type StatusPedido =
  | 'pendente'
  | 'pago'
  | 'processando'
  | 'enviado'
  | 'entregue'
  | 'cancelado'

export interface PedidoAdmin {
  id: string
  status: StatusPedido
  subtotal: number
  frete: number
  desconto: number
  total: number
  observacoes: string | null
  enderecoEntrega: {
    nome?: string
    logradouro?: string
    numero?: string
    complemento?: string | null
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
  }
  createdAt: string
  updatedAt: string
  usuario: {
    id: string
    email: string
    nomeCompleto: string | null
    telefone: string | null
  } | null
}

export interface ItemPedidoAdmin {
  id: string
  quantidade: number
  precoUnitario: number
  subtotal: number
  produto: {
    id: string
    nome: string
    sku: string | null
    imagens: string[]
  } | null
}

// ===== LISTAR TODOS OS PEDIDOS =====
export async function getAllPedidos(): Promise<{ pedidos: PedidoAdmin[]; error: string | null }> {
  try {
    const { data, error } = await Promise.race([
      supabase
        .from('pedidos')
        .select(`
          id, status, subtotal, frete, desconto, total,
          observacoes, endereco_entrega, created_at, updated_at,
          usuario:usuarios(id, email, nome_completo, telefone)
        `)
        .order('created_at', { ascending: false }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]) as {
      data: {
        id: string
        status: StatusPedido
        subtotal: number
        frete: number
        desconto: number
        total: number
        observacoes: string | null
        endereco_entrega: Record<string, unknown>
        created_at: string
        updated_at: string
        usuario: { id: string; email: string; nome_completo: string | null; telefone: string | null } | null
      }[] | null
      error: { message: string } | null
    }

    if (error) return { pedidos: [], error: error.message }

    const pedidos: PedidoAdmin[] = (data ?? []).map(p => ({
      id: p.id,
      status: p.status,
      subtotal: p.subtotal,
      frete: p.frete,
      desconto: p.desconto,
      total: p.total,
      observacoes: p.observacoes,
      enderecoEntrega: (p.endereco_entrega ?? {}) as PedidoAdmin['enderecoEntrega'],
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      usuario: p.usuario
        ? {
            id: p.usuario.id,
            email: p.usuario.email,
            nomeCompleto: p.usuario.nome_completo,
            telefone: p.usuario.telefone,
          }
        : null,
    }))

    return { pedidos, error: null }
  } catch (err) {
    const msg = err instanceof Error && err.message === 'timeout'
      ? 'Timeout ao buscar pedidos. Verifique as permissões RLS.'
      : 'Erro ao buscar pedidos'
    return { pedidos: [], error: msg }
  }
}

// ===== BUSCAR ITENS DE UM PEDIDO =====
export async function getItensPedido(
  pedidoId: string
): Promise<{ itens: ItemPedidoAdmin[]; error: string | null }> {
  try {
    const { data, error } = await Promise.race([
      supabase
        .from('itens_pedido')
        .select(`
          id, quantidade, preco_unitario, subtotal,
          produto:produtos(id, nome, sku, imagens)
        `)
        .eq('pedido_id', pedidoId),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]) as {
      data: {
        id: string
        quantidade: number
        preco_unitario: number
        subtotal: number
        produto: { id: string; nome: string; sku: string | null; imagens: string[] } | null
      }[] | null
      error: { message: string } | null
    }

    if (error) return { itens: [], error: error.message }

    const itens: ItemPedidoAdmin[] = (data ?? []).map(i => ({
      id: i.id,
      quantidade: i.quantidade,
      precoUnitario: i.preco_unitario,
      subtotal: i.subtotal,
      produto: i.produto,
    }))

    return { itens, error: null }
  } catch {
    return { itens: [], error: 'Erro ao buscar itens do pedido' }
  }
}

// ===== ATUALIZAR STATUS =====
export async function updateStatusPedido(
  id: string,
  status: StatusPedido
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('pedidos')
      .update({ status })
      .eq('id', id)

    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao atualizar status' }
  }
}

// ===== SALVAR OBSERVAÇÃO =====
export async function updateObservacoes(
  id: string,
  observacoes: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('pedidos')
      .update({ observacoes })
      .eq('id', id)

    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao salvar observação' }
  }
}
