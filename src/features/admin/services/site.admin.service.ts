import { supabase } from '@lib/supabase/client'

// =====================================================
// TYPES
// =====================================================

export interface HeroSlide {
  id: string
  titulo: string
  subtitulo: string
  badge: string | null
  ctaTexto: string
  ctaUrl: string
  imagemUrl: string
  ordem: number
  ativo: boolean
  createdAt: string
}

export type SecaoConteudo = 'contatos' | 'sobre' | 'institucional' | 'whatsapp'
export type TipoConteudo = 'texto' | 'texto_longo' | 'email' | 'telefone' | 'url' | 'numero'

export interface ConteudoItem {
  id: string
  chave: string
  valor: string
  tipo: TipoConteudo
  secao: SecaoConteudo
  rotulo: string
}

export type ConteudoMap = Record<string, string>

export interface SobreImagem {
  id: string
  url: string
  alt: string
  ordem: number
  ativo: boolean
}

// =====================================================
// HERO SLIDES
// =====================================================

export async function getHeroSlides(): Promise<{ slides: HeroSlide[]; error: string | null }> {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('ordem')

  if (error) return { slides: [], error: error.message }

  const slides: HeroSlide[] = (data ?? []).map(s => ({
    id: s.id,
    titulo: s.titulo,
    subtitulo: s.subtitulo,
    badge: s.badge,
    ctaTexto: s.cta_texto,
    ctaUrl: s.cta_url,
    imagemUrl: s.imagem_url,
    ordem: s.ordem,
    ativo: s.ativo,
    createdAt: s.created_at,
  }))

  return { slides, error: null }
}

export async function criarHeroSlide(payload: {
  titulo: string
  subtitulo: string
  badge?: string
  ctaTexto: string
  ctaUrl: string
  imagemUrl: string
  ordem: number
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('hero_slides').insert({
    titulo: payload.titulo,
    subtitulo: payload.subtitulo,
    badge: payload.badge || null,
    cta_texto: payload.ctaTexto,
    cta_url: payload.ctaUrl,
    imagem_url: payload.imagemUrl,
    ordem: payload.ordem,
  })
  return { error: error?.message ?? null }
}

export async function atualizarHeroSlide(
  id: string,
  payload: Partial<{
    titulo: string
    subtitulo: string
    badge: string | null
    ctaTexto: string
    ctaUrl: string
    imagemUrl: string
    ordem: number
    ativo: boolean
  }>
): Promise<{ error: string | null }> {
  const update: Record<string, unknown> = {}
  if (payload.titulo !== undefined) update.titulo = payload.titulo
  if (payload.subtitulo !== undefined) update.subtitulo = payload.subtitulo
  if (payload.badge !== undefined) update.badge = payload.badge
  if (payload.ctaTexto !== undefined) update.cta_texto = payload.ctaTexto
  if (payload.ctaUrl !== undefined) update.cta_url = payload.ctaUrl
  if (payload.imagemUrl !== undefined) update.imagem_url = payload.imagemUrl
  if (payload.ordem !== undefined) update.ordem = payload.ordem
  if (payload.ativo !== undefined) update.ativo = payload.ativo
  update.updated_at = new Date().toISOString()

  const { error } = await (supabase.from('hero_slides') as any).update(update).eq('id', id)
  return { error: error?.message ?? null }
}

export async function excluirHeroSlide(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('hero_slides').delete().eq('id', id)
  return { error: error?.message ?? null }
}

// =====================================================
// UPLOAD DE IMAGEM (bucket: site)
// =====================================================

export async function uploadSiteImagem(
  file: File,
  pasta: 'hero' | 'sobre'
): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop()
  const nome = `${pasta}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('site')
    .upload(nome, file, { upsert: false })

  if (uploadError) return { url: null, error: uploadError.message }

  const { data } = supabase.storage.from('site').getPublicUrl(nome)
  return { url: data.publicUrl, error: null }
}

export async function excluirSiteImagem(url: string): Promise<void> {
  const path = url.split('/site/')[1]
  if (path) await supabase.storage.from('site').remove([path])
}

// =====================================================
// CONTEÚDO DO SITE (chave-valor)
// =====================================================

export async function getConteudoPorSecao(
  secao: SecaoConteudo
): Promise<{ itens: ConteudoItem[]; mapa: ConteudoMap; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('conteudo_site')
      .select('*')
      .eq('secao', secao)
      .order('chave')

    if (error) return { itens: [], mapa: {}, error: error.message }

    const itens: ConteudoItem[] = (data ?? []).map(c => ({
      id: c.id,
      chave: c.chave,
      valor: c.valor,
      tipo: c.tipo,
      secao: c.secao,
      rotulo: c.rotulo,
    }))

    const mapa: ConteudoMap = {}
    itens.forEach(i => { mapa[i.chave] = i.valor })

    return { itens, mapa, error: null }
  } catch {
    return { itens: [], mapa: {}, error: null }
  }
}

export async function salvarConteudoLote(
  items: { chave: string; valor: string }[]
): Promise<{ error: string | null }> {
  const updates = items.map(i => ({
    chave: i.chave,
    valor: i.valor,
    updated_at: new Date().toISOString(),
  }))

  for (const u of updates) {
    const { error } = await (supabase.from('conteudo_site') as any)
      .update({ valor: u.valor, updated_at: u.updated_at })
      .eq('chave', u.chave)
    if (error) return { error: error.message }
  }

  return { error: null }
}

// =====================================================
// GALERIA SOBRE NÓS
// =====================================================

export async function getSobreGaleria(): Promise<{ imagens: SobreImagem[]; error: string | null }> {
  const { data, error } = await supabase
    .from('sobre_galeria')
    .select('*')
    .order('ordem')

  if (error) return { imagens: [], error: error.message }

  const imagens: SobreImagem[] = (data ?? []).map(i => ({
    id: i.id,
    url: i.url,
    alt: i.alt,
    ordem: i.ordem,
    ativo: i.ativo,
  }))

  return { imagens, error: null }
}

export async function adicionarSobreImagem(
  url: string,
  alt: string,
  ordem: number
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('sobre_galeria')
    .insert({ url, alt, ordem })
  return { error: error?.message ?? null }
}

export async function excluirSobreImagem(
  id: string,
  url: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('sobre_galeria').delete().eq('id', id)
  if (!error) await excluirSiteImagem(url)
  return { error: error?.message ?? null }
}
