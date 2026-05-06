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
    const { campanha_id, assunto, conteudo_html, segmento, tag_filtro } = await req.json()

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

    // Buscar destinatários conforme segmento
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

    const brevoKey = Deno.env.get('BREVO_API_KEY')!
    const fromEmail = Deno.env.get('BREVO_FROM_EMAIL') ?? 'a2brasil.ti@gmail.com'
    const fromName  = Deno.env.get('BREVO_FROM_NAME')  ?? 'A2 Brasil Supplies'

    let enviados = 0
    const erros: string[] = []

    // Envia em lotes de 10 para não sobrecarregar a API
    const loteSize = 10
    for (let i = 0; i < usuarios.length; i += loteSize) {
      const lote = usuarios.slice(i, i + loteSize)

      await Promise.all(lote.map(async (u) => {
        const html = conteudo_html
          .replace(/{{nome}}/g, u.nome_completo ?? u.email.split('@')[0])
          .replace(/{{email}}/g, u.email)

        const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: fromName, email: fromEmail },
            to: [{ email: u.email, name: u.nome_completo ?? u.email }],
            subject: assunto,
            htmlContent: html,
          }),
        })

        if (resp.ok) {
          enviados++
        } else {
          const err = await resp.text()
          erros.push(`${u.email}: ${err}`)
        }
      }))
    }

    // Atualizar status da campanha se foi salva antes
    if (campanha_id) {
      await supabase
        .from('campanhas_crm')
        .update({
          status: erros.length === 0 ? 'enviada' : 'erro',
          total_enviados: enviados,
          enviada_at: new Date().toISOString(),
          erro_msg: erros.length > 0 ? erros.slice(0, 5).join(' | ') : null,
        } as never)
        .eq('id', campanha_id)
    }

    return new Response(
      JSON.stringify({ success: true, enviados, erros: erros.length }),
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
