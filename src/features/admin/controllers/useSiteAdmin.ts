import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@features/auth/contexts/AuthContext'
import * as service from '../services/site.admin.service'
import type {
  HeroSlide,
  ConteudoItem,
  ConteudoMap,
  SobreImagem,
  SecaoConteudo,
} from '../services/site.admin.service'

export type { HeroSlide, ConteudoItem, ConteudoMap, SobreImagem, SecaoConteudo }
export { uploadSiteImagem } from '../services/site.admin.service'

// =====================================================
// Hook: Hero Slides
// =====================================================
export function useHeroSlides() {
  const { isLoading: authLoading } = useAuthContext()
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    const { slides: data, error: err } = await service.getHeroSlides()
    setSlides(data)
    setError(err)
    setIsLoading(false)
  }, [])

  useEffect(() => { if (!authLoading) load() }, [load, authLoading])

  const criar = useCallback(async (payload: Parameters<typeof service.criarHeroSlide>[0]) => {
    const { error: err } = await service.criarHeroSlide(payload)
    if (err) return { success: false, error: err }
    await load()
    return { success: true }
  }, [load])

  const atualizar = useCallback(async (
    id: string,
    payload: Parameters<typeof service.atualizarHeroSlide>[1]
  ) => {
    const { error: err } = await service.atualizarHeroSlide(id, payload)
    if (err) return { success: false, error: err }
    await load()
    return { success: true }
  }, [load])

  const excluir = useCallback(async (id: string) => {
    const { error: err } = await service.excluirHeroSlide(id)
    if (err) return { success: false, error: err }
    setSlides(prev => prev.filter(s => s.id !== id))
    return { success: true }
  }, [])

  return { slides, isLoading, error, reload: load, criar, atualizar, excluir }
}

// =====================================================
// Hook: Conteúdo por seção
// =====================================================
export function useConteudoSecao(secao: SecaoConteudo) {
  const { isLoading: authLoading } = useAuthContext()
  const [itens, setItens] = useState<ConteudoItem[]>([])
  const [mapa, setMapa] = useState<ConteudoMap>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    const { itens: data, mapa: m, error: err } = await service.getConteudoPorSecao(secao)
    setItens(data)
    setMapa(m)
    setError(err)
    setIsLoading(false)
  }, [secao])

  useEffect(() => { if (!authLoading) load() }, [load, authLoading])

  const salvar = useCallback(async (updates: { chave: string; valor: string }[]) => {
    const { error: err } = await service.salvarConteudoLote(updates)
    if (err) return { success: false, error: err }
    await load()
    return { success: true }
  }, [load])

  return { itens, mapa, isLoading, error, reload: load, salvar }
}

// =====================================================
// Hook: Galeria Sobre Nós
// =====================================================
export function useSobreGaleria() {
  const { isLoading: authLoading } = useAuthContext()
  const [imagens, setImagens] = useState<SobreImagem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    const { imagens: data, error: err } = await service.getSobreGaleria()
    setImagens(data)
    setError(err)
    setIsLoading(false)
  }, [])

  useEffect(() => { if (!authLoading) load() }, [load, authLoading])

  const adicionar = useCallback(async (url: string, alt: string) => {
    const ordem = imagens.length
    const { error: err } = await service.adicionarSobreImagem(url, alt, ordem)
    if (err) return { success: false, error: err }
    await load()
    return { success: true }
  }, [imagens.length, load])

  const excluir = useCallback(async (id: string, url: string) => {
    const { error: err } = await service.excluirSobreImagem(id, url)
    if (err) return { success: false, error: err }
    setImagens(prev => prev.filter(i => i.id !== id))
    return { success: true }
  }, [])

  return { imagens, isLoading, error, reload: load, adicionar, excluir }
}
