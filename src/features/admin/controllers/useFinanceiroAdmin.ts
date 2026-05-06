import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@features/auth/contexts/AuthContext'
import * as service from '../services/financeiro.admin.service'
import type {
  LancamentoCaixa,
  TipoLancamento,
  ResumoFinanceiro,
  CategoriaCaixa,
  TipoCategoria,
} from '../services/financeiro.admin.service'

export type { LancamentoCaixa, TipoLancamento, ResumoFinanceiro, CategoriaCaixa, TipoCategoria }

export function useFinanceiroAdmin() {
  const { isLoading: authLoading } = useAuthContext()
  const [lancamentos, setLancamentos] = useState<LancamentoCaixa[]>([])
  const [categorias, setCategorias] = useState<CategoriaCaixa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<TipoLancamento | 'todos'>('todos')

  const loadLancamentos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { lancamentos: data, error: err } = await service.getLancamentos(
      filtroTipo !== 'todos' ? { tipo: filtroTipo } : undefined
    )
    setLancamentos(data)
    if (err) setError(err)
    setIsLoading(false)
  }, [filtroTipo])

  const loadCategorias = useCallback(async () => {
    setIsLoadingCategorias(true)
    const { categorias: data } = await service.getCategorias()
    setCategorias(data)
    setIsLoadingCategorias(false)
  }, [])

  useEffect(() => { if (!authLoading) loadLancamentos() }, [loadLancamentos, authLoading])
  useEffect(() => { if (!authLoading) loadCategorias() }, [loadCategorias, authLoading])

  // Categorias filtradas por tipo de lançamento (inclui "ambos")
  function categoriasPorTipo(tipo: TipoLancamento): CategoriaCaixa[] {
    return categorias.filter(c => c.ativo && (c.tipo === tipo || c.tipo === 'ambos'))
  }

  const criar = useCallback(async (
    payload: Parameters<typeof service.criarLancamento>[0]
  ) => {
    const { error: err } = await service.criarLancamento(payload)
    if (err) return { success: false, error: err }
    await loadLancamentos()
    return { success: true }
  }, [loadLancamentos])

  const excluir = useCallback(async (id: string) => {
    const { error: err } = await service.excluirLancamento(id)
    if (err) return { success: false, error: err }
    setLancamentos(prev => prev.filter(l => l.id !== id))
    return { success: true }
  }, [])

  const criarCategoria = useCallback(async (payload: { nome: string; tipo: TipoCategoria }) => {
    const { categoria, error: err } = await service.criarCategoria(payload)
    if (err || !categoria) return { success: false, error: err ?? 'Erro desconhecido' }
    setCategorias(prev => [...prev, categoria].sort((a, b) => a.nome.localeCompare(b.nome)))
    return { success: true }
  }, [])

  const toggleCategoria = useCallback(async (id: string, ativo: boolean) => {
    const { error: err } = await service.toggleCategoria(id, ativo)
    if (err) return { success: false, error: err }
    setCategorias(prev => prev.map(c => c.id === id ? { ...c, ativo } : c))
    return { success: true }
  }, [])

  const excluirCategoria = useCallback(async (id: string) => {
    const { error: err } = await service.excluirCategoria(id)
    if (err) return { success: false, error: err }
    setCategorias(prev => prev.filter(c => c.id !== id))
    return { success: true }
  }, [])

  const resumo: ResumoFinanceiro = service.calcularResumo(lancamentos)

  return {
    lancamentos,
    categorias,
    isLoading,
    isLoadingCategorias,
    error,
    resumo,
    filtroTipo,
    setFiltroTipo,
    categoriasPorTipo,
    reloadLancamentos: loadLancamentos,
    reloadCategorias: loadCategorias,
    criar,
    excluir,
    criarCategoria,
    toggleCategoria,
    excluirCategoria,
  }
}
