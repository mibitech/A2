import { useState, useCallback } from 'react'
import * as svc from '../services/lotes.admin.service'
import type { Lote, LoteInput, LoteStatus } from '../services/lotes.admin.service'

export type { Lote, LoteInput, LoteStatus }

export function useLotesAdmin(produtoId: string | null) {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loteAtivo, setLoteAtivo] = useState<Lote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    if (!produtoId) return
    setIsLoading(true)
    const [historico, ativo] = await Promise.all([
      svc.listarLotesPorProduto(produtoId),
      svc.buscarLoteAtivo(produtoId),
    ])
    setLotes(historico.data)
    setLoteAtivo(ativo.data)
    setError(historico.error ?? ativo.error)
    setIsLoading(false)
  }, [produtoId])

  const criar = useCallback(async (input: LoteInput) => {
    const { data, error } = await svc.criarLote(input)
    if (error) return { success: false, error }
    await carregar()
    return { success: true, data, error: null }
  }, [carregar])

  const ativar = useCallback(async (id: string) => {
    if (!produtoId) return { success: false, error: 'Produto não definido' }
    const { error } = await svc.ativarLote(id, produtoId)
    if (error) return { success: false, error }
    await carregar()
    return { success: true, error: null }
  }, [produtoId, carregar])

  const encerrar = useCallback(async (id: string) => {
    const { error } = await svc.encerrarLote(id)
    if (error) return { success: false, error }
    await carregar()
    return { success: true, error: null }
  }, [carregar])

  const atualizar = useCallback(async (
    id: string,
    campos: Partial<Pick<LoteInput, 'numero_lote' | 'fornecedor_id' | 'observacoes'>>
  ) => {
    const { error } = await svc.atualizarLote(id, campos)
    if (error) return { success: false, error }
    await carregar()
    return { success: true, error: null }
  }, [carregar])

  const lotesAtivos     = lotes.filter(l => l.status === 'ativo')
  const lotesAguardando = lotes.filter(l => l.status === 'aguardando')
  const lotesEncerrados = lotes.filter(l => l.status === 'encerrado')

  return {
    lotes, loteAtivo, lotesAtivos, lotesAguardando, lotesEncerrados,
    isLoading, error,
    carregar, criar, ativar, encerrar, atualizar,
  }
}
