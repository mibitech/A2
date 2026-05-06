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

  // Criar itens do pedido
  const itensPedido = cartItems.map((item) => ({
    pedido_id: pedido.id,
    produto_id: item.productId,
    quantidade: item.quantity,
    preco_unitario: item.productPrice,
    subtotal: item.productPrice * item.quantity,
  }))

  const { error: itensErr } = await supabase.from('itens_pedido').insert(itensPedido)

  if (itensErr) {
    console.error('Erro ao criar itens:', itensErr)
  }

  // Atualizar estoque para cada item vendido
  for (const item of cartItems) {
    const { data: produto, error: prodErr } = await supabase
      .from('produtos')
      .select('estoque')
      .eq('id', item.productId)
      .single()

    if (prodErr || !produto) {
      console.error(`Produto não encontrado: ${item.productId}`, prodErr)
      continue
    }

    const estoqueAnterior = (produto as { estoque: number }).estoque
    const estoqueNovo = Math.max(0, estoqueAnterior - item.quantity)

    const { error: updateErr } = await supabase
      .from('produtos')
      .update({ estoque: estoqueNovo } as never)
      .eq('id', item.productId)

    if (updateErr) {
      console.error(`Erro ao atualizar estoque de ${item.productId}:`, updateErr)
    }

    // usuario_id = null para evitar FK error (cliente pode não estar na tabela usuarios)
    const { error: movErr } = await supabase
      .from('movimentacoes_estoque')
      .insert({
        produto_id: item.productId,
        usuario_id: null,
        tipo: 'saida',
        quantidade: item.quantity,
        estoque_anterior: estoqueAnterior,
        estoque_posterior: estoqueNovo,
        motivo: `Venda — Pedido #${pedido.id.split('-')[0].toUpperCase()}`,
      } as never)

    if (movErr) {
      console.error(`Erro ao registrar movimentação de ${item.productId}:`, movErr)
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
