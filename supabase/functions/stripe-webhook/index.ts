import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-06-20',
  })

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch (err) {
    console.error('Assinatura inválida:', err)
    return new Response('Webhook inválido', { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response('Ignorado', { status: 200 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const meta = session.metadata!

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Evitar duplicidade — verificar se pedido já existe para essa session
  const { data: existente } = await supabase
    .from('pedidos')
    .select('id')
    .eq('stripe_session_id', session.id)
    .maybeSingle()

  if (existente) {
    return new Response('Já processado', { status: 200 })
  }

  const cartItems: Array<{
    productId: string
    productName: string
    productPrice: number
    quantity: number
  }> = JSON.parse(meta.cart_items)

  const enderecoEntrega = JSON.parse(meta.endereco)
  const freteValor = Number(meta.frete_valor)
  const subtotal = cartItems.reduce((s, i) => s + i.productPrice * i.quantity, 0)
  const total = subtotal + freteValor

  // Criar pedido
  const { data: pedido, error: pedidoErr } = await supabase
    .from('pedidos')
    .insert({
      usuario_id: meta.user_id,
      status: 'pago',
      subtotal,
      frete: freteValor,
      desconto: 0,
      total,
      endereco_entrega: enderecoEntrega,
      stripe_session_id: session.id,
      stripe_payment_intent_id: String(session.payment_intent ?? ''),
    })
    .select('id')
    .single()

  if (pedidoErr || !pedido) {
    console.error('Erro ao criar pedido:', pedidoErr)
    return new Response('Erro interno', { status: 500 })
  }

  // Criar itens do pedido com rastreabilidade de lote
  const shortId = pedido.id.slice(0, 8).toUpperCase()

  for (const item of cartItems) {
    // Ler estoque atual do produto ANTES de qualquer alteração (para movimentação correta)
    const { data: produto } = await supabase
      .from('produtos')
      .select('estoque')
      .eq('id', item.productId)
      .maybeSingle()

    const estoqueAnterior = (produto as { estoque: number } | null)?.estoque ?? 0
    const estoqueNovo = Math.max(0, estoqueAnterior - item.quantity)

    // Buscar lote ativo para rastreabilidade
    let loteId: string | null = null
    let numeroLote: string | null = null
    let fornecedorId: string | null = null

    const { data: loteAtivo } = await supabase
      .from('lotes')
      .select('id, numero_lote, fornecedor_id, estoque_atual')
      .eq('produto_id', item.productId)
      .eq('status', 'ativo')
      .maybeSingle()

    if (loteAtivo) {
      loteId = loteAtivo.id
      numeroLote = loteAtivo.numero_lote
      fornecedorId = loteAtivo.fornecedor_id

      // Decrementar lote — o trigger sync_estoque_on_lote_change cuida de produtos.estoque
      const estoqueNovoLote = Math.max(0, (loteAtivo as { estoque_atual: number }).estoque_atual - item.quantity)
      await (supabase.from('lotes') as any)
        .update({ estoque_atual: estoqueNovoLote })
        .eq('id', loteAtivo.id)
    }

    // Inserir item com referência ao lote
    const { error: itemErr } = await supabase.from('itens_pedido').insert({
      pedido_id: pedido.id,
      produto_id: item.productId,
      quantidade: item.quantity,
      preco_unitario: item.productPrice,
      subtotal: item.productPrice * item.quantity,
      lote_id: loteId,
      fornecedor_id: fornecedorId,
      numero_lote: numeroLote,
    } as never)

    if (itemErr) console.error('Erro ao criar item:', itemErr)

    // Registrar movimentação com valores capturados antes da alteração do lote
    await (supabase.from('movimentacoes_estoque') as any).insert({
      produto_id: item.productId,
      usuario_id: null,
      tipo: 'saida',
      quantidade: item.quantity,
      estoque_anterior: estoqueAnterior,
      estoque_posterior: estoqueNovo,
      motivo: `Venda — Pedido #${shortId}${numeroLote ? ` (Lote: ${numeroLote})` : ''}`,
    })
  }

  // Registrar entrada no fluxo de caixa (idempotente)
  const ref = `pedido:${pedido.id}`
  const { data: lancExistente } = await supabase
    .from('lancamentos_caixa')
    .select('id')
    .like('observacoes', `%${ref}%`)
    .limit(1)

  if (!lancExistente || lancExistente.length === 0) {
    // Buscar nome do cliente (best-effort)
    let clienteNome = 'cliente'
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('nome_completo')
      .eq('id', meta.user_id)
      .maybeSingle()
    if (usuario?.nome_completo) clienteNome = usuario.nome_completo.trim().split(' ')[0]

    const hoje = new Date().toISOString().slice(0, 10)

    await supabase.from('lancamentos_caixa').insert({
      tipo: 'entrada',
      categoria: 'venda',
      descricao: `Pedido #${shortId} — ${clienteNome}`,
      valor: total,
      data_ref: hoje,
      observacoes: ref,
      criado_por: meta.user_id,
    })

    if (freteValor > 0) {
      await supabase.from('lancamentos_caixa').insert({
        tipo: 'saida',
        categoria: 'frete',
        descricao: `Frete Pedido #${shortId} — ${meta.frete_nome || 'Transportadora'}`,
        valor: freteValor,
        data_ref: hoje,
        observacoes: ref,
        criado_por: meta.user_id,
      })
    }
  }

  // Disparar e-mail de confirmação (best-effort)
  try {
    await supabase.functions.invoke('send-order-confirmation', {
      body: { pedido_id: pedido.id },
    })
  } catch (emailErr) {
    console.error('Erro ao enviar e-mail (não crítico):', emailErr)
  }

  return new Response(JSON.stringify({ pedido_id: pedido.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
