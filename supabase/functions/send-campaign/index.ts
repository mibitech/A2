import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { campanha_id, assunto, conteudo_html, segmento, tag_filtro, destinatarios } = await req.json()

    if (!assunto || !conteudo_html || !segmento) {
      return new Response(
        JSON.stringify({ error: 'assunto, conteudo_html e segmento são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    type Destinatario = { email: string; nome: string }
    let lista: Destinatario[] = []

    if (segmento === 'lista_manual') {
      // Usa a lista passada diretamente na request
      const emails: string[] = Array.isArray(destinatarios) ? destinatarios : []
      if (emails.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Nenhum e-mail informado na lista manual' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      lista = emails.map(e => ({ email: e.trim(), nome: e.split('@')[0] }))
    } else {
      // Busca destinatários cadastrados conforme segmento
      let query = supabase
        .from('usuarios')
        .select('id, email, nome_completo, tags')
        .not('email', 'is', null)

      if (segmento === 'clientes') {
        query = query.eq('role', 'cliente')
      } else if (segmento === 'por_tag' && tag_filtro) {
        query = query.contains('tags', [tag_filtro])
      }

      const { data: usuarios, error: usersErr } = await query

      if (usersErr || !usuarios?.length) {
        return new Response(
          JSON.stringify({ error: usersErr?.message ?? 'Nenhum destinatário encontrado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      lista = usuarios.map(u => ({
        email: u.email,
        nome: u.nome_completo ?? u.email.split('@')[0],
      }))
    }

    const brevoKey = Deno.env.get('BREVO_API_KEY')!
    const fromEmail = Deno.env.get('BREVO_FROM_EMAIL') ?? 'a2brasil.ti@gmail.com'
    const fromName  = Deno.env.get('BREVO_FROM_NAME')  ?? 'A2 Brasil Supplies'

    let enviados = 0
    const erros: string[] = []

    console.log(`[send-campaign] Iniciando envio para ${lista.length} destinatário(s). Segmento: ${segmento}`)

    // Envia individualmente para capturar erros por e-mail
    for (const u of lista) {
      const html = conteudo_html
        .replace(/{{nome}}/g, u.nome)
        .replace(/{{email}}/g, u.email)

      const emailCtrl = new AbortController()
      const emailTimer = setTimeout(() => emailCtrl.abort(), 15_000)

      try {
        const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          signal: emailCtrl.signal,
          headers: {
            'api-key': brevoKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: fromName, email: fromEmail },
            to: [{ email: u.email, name: u.nome }],
            subject: assunto,
            htmlContent: html,
          }),
        })
        clearTimeout(emailTimer)

        const respBody = await resp.text()

        if (resp.ok) {
          enviados++
          console.log(`[send-campaign] ✓ Enviado: ${u.email}`)
        } else {
          const msg = `${u.email} → HTTP ${resp.status}: ${respBody}`
          erros.push(msg)
          console.error(`[send-campaign] ✗ Falhou: ${msg}`)
        }
      } catch (sendErr) {
        clearTimeout(emailTimer)
        const isTimeout = sendErr instanceof Error && sendErr.name === 'AbortError'
        const msg = `${u.email} → ${isTimeout ? 'Timeout (15s)' : sendErr instanceof Error ? sendErr.message : String(sendErr)}`
        erros.push(msg)
        console.error(`[send-campaign] ✗ ${msg}`)
      }
    }

    console.log(`[send-campaign] Concluído: ${enviados} enviados, ${erros.length} erros`)

    // Atualizar status da campanha se foi salva antes
    if (campanha_id) {
      await supabase
        .from('campanhas_crm')
        .update({
          status: erros.length === 0 ? 'enviada' : (enviados > 0 ? 'enviada' : 'erro'),
          total_enviados: enviados,
          enviada_at: new Date().toISOString(),
          erro_msg: erros.length > 0 ? erros.slice(0, 5).join(' | ') : null,
        } as never)
        .eq('id', campanha_id)
    }

    return new Response(
      JSON.stringify({ success: true, enviados, erros: erros.length, detalhes_erros: erros }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Erro ao enviar campanha:', msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
