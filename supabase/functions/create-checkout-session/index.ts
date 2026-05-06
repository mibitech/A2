import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'npm:stripe@14'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
    })

    const { items, frete, enderecoEntrega, userId } = await req.json()

    if (!items?.length || !userId) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:3000'

    const lineItems = items.map((item: {
      productName: string
      productPrice: number
      quantity: number
      productImage?: string
    }) => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name: item.productName,
          // encodeURI garante que acentos e caracteres especiais não quebrem a URL no Stripe
          ...(item.productImage ? { images: [encodeURI(item.productImage)] } : {}),
        },
        unit_amount: Math.round(item.productPrice * 100),
      },
      quantity: item.quantity,
    }))

    // Frete como item separado (se > 0)
    if (frete?.valor > 0) {
      lineItems.push({
        price_data: {
          currency: 'brl',
          product_data: { name: `Frete — ${frete.nome}` },
          unit_amount: Math.round(frete.valor * 100),
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancelado`,
      metadata: {
        user_id: userId,
        frete_valor: String(frete?.valor ?? 0),
        frete_nome: frete?.nome ?? '',
        frete_prazo: frete?.prazo ?? '',
        endereco: JSON.stringify(enderecoEntrega),
        // Guarda os itens para criar o pedido no webhook
        cart_items: JSON.stringify(
          items.map((i: any) => ({
            productId: i.productId,
            productName: i.productName,
            productPrice: i.productPrice,
            quantity: i.quantity,
          }))
        ),
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Erro ao criar sessão Stripe:', msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
