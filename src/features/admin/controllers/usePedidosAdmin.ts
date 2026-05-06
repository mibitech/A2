import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@features/auth/contexts/AuthContext'
import * as service from '../services/pedidos.admin.service'
import type { PedidoAdmin, ItemPedidoAdmin, StatusPedido } from '../services/pedidos.admin.service'

export type { PedidoAdmin, ItemPedidoAdmin, StatusPedido }

export function usePedidosAdmin() {
  const { isLoading: authLoading } = useAuthContext()
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { pedidos: data, error: err } = await service.getAllPedidos()
    setPedidos(data)
    if (err) setError(err)
    setIsLoading(false)
  }, [])

  useEffect(() => { if (!authLoading) load() }, [load, authLoading])

  const getItens = useCallback(async (pedidoId: string): Promise<ItemPedidoAdmin[]> => {
    const { itens } = await service.getItensPedido(pedidoId)
    return itens
  }, [])

  const updateStatus = useCallback(async (id: string, status: StatusPedido) => {
    const { error: err } = await service.updateStatusPedido(id, status)
    if (err) return { success: false, error: err }
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    return { success: true }
  }, [])

  const updateObservacoes = useCallback(async (id: string, observacoes: string) => {
    const { error: err } = await service.updateObservacoes(id, observacoes)
    if (err) return { success: false, error: err }
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, observacoes } : p))
    return { success: true }
  }, [])

  return {
    pedidos,
    isLoading,
    error,
    reload: load,
    getItens,
    updateStatus,
    updateObservacoes,
  }
}
