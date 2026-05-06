import { supabase } from '@lib/supabase/client'

export type StatusCampanha = 'rascunho' | 'enviando' | 'enviada' | 'erro'
export type SegmentoCampanha = 'todos' | 'clientes' | 'por_tag'

export interface Campanha {
  id: string
  titulo: string
  assunto: string
  conteudoHtml: string
  segmento: SegmentoCampanha
  tagFiltro: string | null
  totalEnviados: number
  status: StatusCampanha
  erroMsg: string | null
  createdAt: string
  enviadaAt: string | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _env = (import.meta as any).env
const _FUNCTION_URL = `${_env.VITE_SUPABASE_URL}/functions/v1/send-campaign`
const _ANON_KEY: string = _env.VITE_SUPABASE_ANON_KEY

export async function getCampanhas(): Promise<{ campanhas: Campanha[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('campanhas_crm')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return { campanhas: [], error: error.message }

    const campanhas: Campanha[] = (data ?? []).map((c: any) => ({
      id: c.id,
      titulo: c.titulo,
      assunto: c.assunto,
      conteudoHtml: c.conteudo_html,
      segmento: c.segmento,
      tagFiltro: c.tag_filtro,
      totalEnviados: c.total_enviados,
      status: c.status,
      erroMsg: c.erro_msg,
      createdAt: c.created_at,
      enviadaAt: c.enviada_at,
    }))

    return { campanhas, error: null }
  } catch {
    return { campanhas: [], error: 'Erro ao buscar campanhas' }
  }
}

export async function enviarCampanha(params: {
  titulo: string
  assunto: string
  conteudoHtml: string
  segmento: SegmentoCampanha
  tagFiltro?: string
}): Promise<{ enviados: number; error: string | null }> {
  try {
    // Salvar rascunho primeiro
    const { data: campanha } = await supabase
      .from('campanhas_crm')
      .insert({
        titulo: params.titulo,
        assunto: params.assunto,
        conteudo_html: params.conteudoHtml,
        segmento: params.segmento,
        tag_filtro: params.tagFiltro || null,
        status: 'enviando',
      } as never)
      .select('id')
      .single()

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 60_000) // campanhas podem demorar

    const response = await fetch(_FUNCTION_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${_ANON_KEY}`,
        'apikey': _ANON_KEY,
      },
      body: JSON.stringify({
        campanha_id: (campanha as any)?.id ?? null,
        assunto: params.assunto,
        conteudo_html: params.conteudoHtml,
        segmento: params.segmento,
        tag_filtro: params.tagFiltro ?? null,
      }),
    })

    clearTimeout(timer)
    const data = await response.json()

    if (!response.ok) return { enviados: 0, error: data?.error ?? `Erro ${response.status}` }
    return { enviados: data.enviados ?? 0, error: null }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { enviados: 0, error: 'Tempo limite ao enviar campanha' }
    }
    return { enviados: 0, error: 'Erro ao enviar campanha' }
  }
}
