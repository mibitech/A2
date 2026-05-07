import { supabase } from '@lib/supabase/client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _env = (import.meta as any).env
const _FUNCTION_URL = `${_env.VITE_SUPABASE_URL}/functions/v1/send-campaign`
const _ANON_KEY: string = _env.VITE_SUPABASE_ANON_KEY

export type StatusCampanha = 'enviando' | 'enviada' | 'erro' | 'arquivada' | 'cancelada'
export type SegmentoCampanha = 'todos' | 'clientes' | 'por_tag' | 'lista_manual'

// =====================================================
// TIPOS
// =====================================================

export interface CampanhaTemplate {
  id: string
  titulo: string
  descricao: string | null
  assunto: string
  conteudoHtml: string
  segmento: SegmentoCampanha
  tagFiltro: string | null
  ativo: boolean
  createdAt: string
}

export interface Campanha {
  id: string
  titulo: string
  assunto: string
  conteudoHtml: string
  segmento: SegmentoCampanha
  tagFiltro: string | null
  destinatariosManual: string[] | null
  totalEnviados: number
  status: StatusCampanha
  erroMsg: string | null
  templateId: string | null
  templateTitulo: string | null
  createdAt: string
  enviadaAt: string | null
}

// =====================================================
// TEMPLATES — CRUD
// =====================================================

export async function getCampanhasTemplates(): Promise<{ templates: CampanhaTemplate[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('campanhas_templates' as never)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return { templates: [], error: (error as any).message }

    const templates: CampanhaTemplate[] = ((data ?? []) as any[]).map(t => ({
      id: t.id,
      titulo: t.titulo,
      descricao: t.descricao,
      assunto: t.assunto,
      conteudoHtml: t.conteudo_html,
      segmento: t.segmento,
      tagFiltro: t.tag_filtro,
      ativo: t.ativo,
      createdAt: t.created_at,
    }))

    return { templates, error: null }
  } catch {
    return { templates: [], error: 'Erro ao buscar templates' }
  }
}

export async function criarTemplate(payload: {
  titulo: string
  descricao?: string
  assunto: string
  conteudoHtml: string
  segmento: SegmentoCampanha
  tagFiltro?: string
  criadoPor?: string
}): Promise<{ template: CampanhaTemplate | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('campanhas_templates' as never)
      .insert({
        titulo: payload.titulo.trim(),
        descricao: payload.descricao?.trim() || null,
        assunto: payload.assunto.trim(),
        conteudo_html: payload.conteudoHtml,
        segmento: payload.segmento,
        tag_filtro: payload.tagFiltro || null,
        criado_por: payload.criadoPor || null,
      } as never)
      .select()
      .single()

    if (error) return { template: null, error: (error as any).message }

    const t = data as any
    return {
      template: {
        id: t.id, titulo: t.titulo, descricao: t.descricao, assunto: t.assunto,
        conteudoHtml: t.conteudo_html, segmento: t.segmento, tagFiltro: t.tag_filtro,
        ativo: t.ativo, createdAt: t.created_at,
      },
      error: null,
    }
  } catch {
    return { template: null, error: 'Erro ao criar template' }
  }
}

export async function editarTemplate(id: string, payload: {
  titulo: string
  descricao?: string
  assunto: string
  conteudoHtml: string
  segmento: SegmentoCampanha
  tagFiltro?: string
}): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('campanhas_templates' as never)
      .update({
        titulo: payload.titulo.trim(),
        descricao: payload.descricao?.trim() || null,
        assunto: payload.assunto.trim(),
        conteudo_html: payload.conteudoHtml,
        segmento: payload.segmento,
        tag_filtro: payload.tagFiltro || null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id)

    if (error) return { error: (error as any).message }
    return { error: null }
  } catch {
    return { error: 'Erro ao editar template' }
  }
}

export async function excluirTemplate(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('campanhas_templates' as never)
      .delete()
      .eq('id', id)

    if (error) return { error: (error as any).message }
    return { error: null }
  } catch {
    return { error: 'Erro ao excluir template' }
  }
}

// =====================================================
// CAMPANHAS
// =====================================================

export async function getCampanhas(): Promise<{ campanhas: Campanha[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('campanhas_crm')
      .select('*, campanhas_templates:template_id(titulo)')
      .order('created_at', { ascending: false })

    if (error) return { campanhas: [], error: error.message }

    const campanhas: Campanha[] = ((data ?? []) as any[]).map(c => ({
      id: c.id,
      titulo: c.titulo,
      assunto: c.assunto,
      conteudoHtml: c.conteudo_html,
      segmento: c.segmento,
      tagFiltro: c.tag_filtro,
      destinatariosManual: c.destinatarios_manual ?? null,
      totalEnviados: c.total_enviados,
      status: c.status,
      erroMsg: c.erro_msg,
      templateId: c.template_id,
      templateTitulo: c.campanhas_templates?.titulo ?? null,
      createdAt: c.created_at,
      enviadaAt: c.enviada_at,
    }))

    return { campanhas, error: null }
  } catch {
    return { campanhas: [], error: 'Erro ao buscar campanhas' }
  }
}

export async function salvarRascunho(params: {
  titulo: string
  assunto: string
  conteudoHtml: string
  segmento: SegmentoCampanha
  tagFiltro?: string
  destinatariosManual?: string[]
  templateId?: string
  criadoPor?: string
}): Promise<{ id: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('campanhas_crm')
      .insert({
        titulo: params.titulo,
        assunto: params.assunto,
        conteudo_html: params.conteudoHtml,
        segmento: params.segmento,
        tag_filtro: params.tagFiltro || null,
        destinatarios_manual: params.destinatariosManual?.length ? params.destinatariosManual : null,
        template_id: params.templateId || null,
        status: 'rascunho',
        criado_por: params.criadoPor || null,
      } as never)
      .select('id')
      .single()

    if (error) return { id: null, error: error.message }
    return { id: (data as any).id, error: null }
  } catch {
    return { id: null, error: 'Erro ao salvar rascunho' }
  }
}

export async function enviarCampanha(params: {
  titulo: string
  assunto: string
  conteudoHtml: string
  segmento: SegmentoCampanha
  tagFiltro?: string
  destinatariosManual?: string[]
  templateId?: string
  criadoPor?: string
}): Promise<{ enviados: number; error: string | null }> {
  try {
    const { data: campanha, error: insertErr } = await supabase
      .from('campanhas_crm')
      .insert({
        titulo: params.titulo,
        assunto: params.assunto,
        conteudo_html: params.conteudoHtml,
        segmento: params.segmento,
        tag_filtro: params.tagFiltro || null,
        destinatarios_manual: params.destinatariosManual?.length ? params.destinatariosManual : null,
        template_id: params.templateId || null,
        status: 'enviando',
        criado_por: params.criadoPor || null,
      } as never)
      .select('id')
      .single()

    if (insertErr) return { enviados: 0, error: insertErr.message }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 60_000)

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
        destinatarios: params.destinatariosManual ?? null,
      }),
    })

    clearTimeout(timer)
    const data = await response.json()

    if (!response.ok) return { enviados: 0, error: data?.error ?? `Erro ${response.status}` }

    const detalhes: string[] = data.detalhes_erros ?? []
    const erroMsg = detalhes.length > 0
      ? `${data.enviados} enviado(s). Falhas: ${detalhes.join(' | ')}`
      : null

    return { enviados: data.enviados ?? 0, error: erroMsg }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { enviados: 0, error: 'Tempo limite ao enviar campanha' }
    }
    return { enviados: 0, error: 'Erro ao enviar campanha' }
  }
}

export async function enviarRascunho(campanhaId: string): Promise<{ enviados: number; error: string | null }> {
  try {
    const { data: c } = await supabase
      .from('campanhas_crm')
      .select('titulo, assunto, conteudo_html, segmento, tag_filtro, destinatarios_manual')
      .eq('id', campanhaId)
      .single()

    if (!c) return { enviados: 0, error: 'Campanha não encontrada' }

    await supabase.from('campanhas_crm').update({ status: 'enviando' } as never).eq('id', campanhaId)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 60_000)

    const response = await fetch(_FUNCTION_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${_ANON_KEY}`,
        'apikey': _ANON_KEY,
      },
      body: JSON.stringify({
        campanha_id: campanhaId,
        assunto: (c as any).assunto,
        conteudo_html: (c as any).conteudo_html,
        segmento: (c as any).segmento,
        tag_filtro: (c as any).tag_filtro ?? null,
        destinatarios: (c as any).destinatarios_manual ?? null,
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

export async function arquivarCampanha(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('campanhas_crm')
      .update({ status: 'arquivada' } as never)
      .eq('id', id)
    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao arquivar campanha' }
  }
}

export async function cancelarCampanha(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('campanhas_crm')
      .update({ status: 'cancelada' } as never)
      .eq('id', id)
    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao cancelar campanha' }
  }
}

export async function deleteCampanha(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('campanhas_crm').delete().eq('id', id)
    if (error) return { error: error.message }
    return { error: null }
  } catch {
    return { error: 'Erro ao excluir campanha' }
  }
}
