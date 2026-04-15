import { supabase } from '@lib/supabase/client'

export interface PerfilUpdate {
  nomeCompleto: string
  telefone: string
  cpfCnpj: string
  tipoPessoa: 'fisica' | 'juridica'
}

export interface PedidoConta {
  id: string
  status: string
  subtotal: number
  frete: number
  desconto: number
  total: number
  createdAt: string
  itensCount: number
}

// ===== ATUALIZAR PERFIL =====
export async function updatePerfil(
  userId: string,
  data: PerfilUpdate
): Promise<{ error: string | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('usuarios') as any)
      .update({
        nome_completo: data.nomeCompleto || null,
        telefone: data.telefone || null,
        cpf_cnpj: data.cpfCnpj || null,
        tipo_pessoa: data.tipoPessoa,
      })
      .eq('id', userId)

    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao salvar perfil' }
  }
}

// ===== BUSCAR PEDIDOS DO USUÁRIO LOGADO =====
export async function getMeusPedidos(
  userId: string
): Promise<{ pedidos: PedidoConta[]; error: string | null }> {
  try {
    const { data, error } = await Promise.race([
      supabase
        .from('pedidos')
        .select('id, status, subtotal, frete, desconto, total, created_at, itens_pedido(id)')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]) as {
      data: {
        id: string
        status: string
        subtotal: number
        frete: number
        desconto: number
        total: number
        created_at: string
        itens_pedido: { id: string }[]
      }[] | null
      error: { message: string } | null
    }

    if (error) return { pedidos: [], error: error.message }

    const pedidos: PedidoConta[] = (data ?? []).map(p => ({
      id: p.id,
      status: p.status,
      subtotal: p.subtotal,
      frete: p.frete,
      desconto: p.desconto,
      total: p.total,
      createdAt: p.created_at,
      itensCount: p.itens_pedido?.length ?? 0,
    }))

    return { pedidos, error: null }
  } catch {
    return { pedidos: [], error: 'Erro ao buscar pedidos' }
  }
}
