import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createTransporter, FROM_EMAIL, FROM_NAME } from '../_shared/mailer.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pedido_id } = await req.json()

    if (!pedido_id) {
      return new Response(
        JSON.stringify({ error: 'pedido_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Usar service_role para bypassar RLS e buscar todos os dados do pedido
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Buscar pedido + usuário
    const { data: pedido, error: pedidoErr } = await supabase
      .from('pedidos')
      .select(`
        id,
        status,
        subtotal,
        frete,
        desconto,
        total,
        endereco_entrega,
        observacoes,
        created_at,
        usuarios (
          nome_completo,
          email
        ),
        itens_pedido (
          quantidade,
          preco_unitario,
          subtotal,
          produtos (
            nome,
            sku
          )
        )
      `)
      .eq('id', pedido_id)
      .single()

    if (pedidoErr || !pedido) {
      return new Response(
        JSON.stringify({ error: 'Pedido não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const usuario = pedido.usuarios as { nome_completo: string | null; email: string }
    const enderecoRaw = pedido.endereco_entrega as Record<string, string>
    const itens = pedido.itens_pedido as Array<{
      quantidade: number
      preco_unitario: number
      subtotal: number
      produtos: { nome: string; sku: string | null }
    }>

    const fmt = (v: number) =>
      v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    const idCurto = pedido.id.split('-')[0].toUpperCase()

    const itensHtml = itens
      .map(
        (item) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">
            <strong>${item.produtos?.nome ?? '—'}</strong>
            ${item.produtos?.sku ? `<br><small style="color:#888;">SKU: ${item.produtos.sku}</small>` : ''}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantidade}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${fmt(item.preco_unitario)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${fmt(item.subtotal)}</td>
        </tr>`
      )
      .join('')

    const enderecoHtml = enderecoRaw
      ? `${enderecoRaw.logradouro ?? ''}, ${enderecoRaw.numero ?? ''} ${enderecoRaw.complemento ? '- ' + enderecoRaw.complemento : ''}<br>
         ${enderecoRaw.bairro ?? ''} — ${enderecoRaw.cidade ?? ''}/${enderecoRaw.estado ?? ''}<br>
         CEP: ${enderecoRaw.cep ?? ''}`
      : '—'

    const dataFormatada = new Date(pedido.created_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#6d28d9;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">A2 <span style="font-weight:300">Brasil Supplies</span></h1>
          </td>
        </tr>

        <!-- Saudação -->
        <tr>
          <td style="padding:32px 32px 16px;">
            <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;">Pedido confirmado! 🎉</h2>
            <p style="margin:0;color:#555;font-size:15px;">
              Olá, <strong>${usuario.nome_completo ?? usuario.email}</strong>! Recebemos seu pedido e ele está em processamento.
            </p>
          </td>
        </tr>

        <!-- Número e data -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table cellpadding="0" cellspacing="0" style="background:#f9f7ff;border-left:4px solid #6d28d9;border-radius:4px;padding:16px;width:100%;">
              <tr>
                <td>
                  <span style="color:#6d28d9;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Número do pedido</span><br>
                  <strong style="font-size:18px;color:#1a1a1a;">#${idCurto}</strong>
                </td>
                <td align="right">
                  <span style="color:#888;font-size:13px;">${dataFormatada}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Itens -->
        <tr>
          <td style="padding:0 32px 24px;">
            <h3 style="margin:0 0 12px;color:#1a1a1a;font-size:15px;text-transform:uppercase;letter-spacing:.5px;">Itens do pedido</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5;border-radius:6px;overflow:hidden;">
              <thead>
                <tr style="background:#f8f8f8;">
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Produto</th>
                  <th style="padding:10px 12px;text-align:center;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Qtd</th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Unitário</th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Total</th>
                </tr>
              </thead>
              <tbody>${itensHtml}</tbody>
            </table>
          </td>
        </tr>

        <!-- Totais -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:4px 0;color:#555;font-size:14px;">Subtotal</td>
                <td style="padding:4px 0;text-align:right;color:#555;font-size:14px;">${fmt(pedido.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#555;font-size:14px;">Frete</td>
                <td style="padding:4px 0;text-align:right;color:#555;font-size:14px;">${pedido.frete > 0 ? fmt(pedido.frete) : 'A calcular'}</td>
              </tr>
              ${pedido.desconto > 0 ? `
              <tr>
                <td style="padding:4px 0;color:#16a34a;font-size:14px;">Desconto</td>
                <td style="padding:4px 0;text-align:right;color:#16a34a;font-size:14px;">-${fmt(pedido.desconto)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:12px 0 0;border-top:2px solid #e5e5e5;font-size:16px;font-weight:700;color:#1a1a1a;">Total</td>
                <td style="padding:12px 0 0;border-top:2px solid #e5e5e5;text-align:right;font-size:16px;font-weight:700;color:#6d28d9;">${fmt(pedido.total)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Endereço -->
        <tr>
          <td style="padding:0 32px 32px;">
            <h3 style="margin:0 0 8px;color:#1a1a1a;font-size:15px;text-transform:uppercase;letter-spacing:.5px;">Endereço de entrega</h3>
            <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">${enderecoHtml}</p>
          </td>
        </tr>

        ${pedido.observacoes ? `
        <tr>
          <td style="padding:0 32px 32px;">
            <h3 style="margin:0 0 8px;color:#1a1a1a;font-size:15px;text-transform:uppercase;letter-spacing:.5px;">Observações</h3>
            <p style="margin:0;color:#555;font-size:14px;">${pedido.observacoes}</p>
          </td>
        </tr>` : ''}

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f8;padding:24px 32px;text-align:center;border-top:1px solid #e5e5e5;">
            <p style="margin:0;color:#888;font-size:12px;line-height:1.6;">
              Dúvidas? Entre em contato: <a href="mailto:${FROM_EMAIL}" style="color:#6d28d9;">${FROM_EMAIL}</a><br>
              © ${new Date().getFullYear()} A2 Brasil Supplies LTDA. Todos os direitos reservados.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    const transporter = createTransporter()

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: `"${usuario.nome_completo ?? usuario.email}" <${usuario.email}>`,
      subject: `Pedido #${idCurto} confirmado — A2 Brasil Supplies`,
      html,
    })

    return new Response(
      JSON.stringify({ success: true, message: `E-mail enviado para ${usuario.email}` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err)
    return new Response(
      JSON.stringify({ error: 'Erro interno ao enviar e-mail' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
