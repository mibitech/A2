import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@features/auth/contexts/AuthContext'
import * as service from '../services/clientes.admin.service'
import type { ClienteAdmin, PedidoResumo } from '../services/clientes.admin.service'

export type { ClienteAdmin, PedidoResumo }

export function useClientesAdmin() {
  const { isLoading: authLoading } = useAuthContext()
  const [clientes, setClientes] = useState<ClienteAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (tentativa = 1) => {
    setIsLoading(true)
    setError(null)
    const { clientes: data, error: err } = await service.getAllClientes()
    if (err && tentativa === 1) {
      await new Promise(r => setTimeout(r, 2_000))
      return load(2)
    }
    setClientes(data)
    if (err) setError(err)
    setIsLoading(false)
  }, [])

  useEffect(() => { if (!authLoading) load() }, [load, authLoading])

  const getPedidos = useCallback(async (usuarioId: string): Promise<PedidoResumo[]> => {
    const { pedidos } = await service.getPedidosCliente(usuarioId)
    return pedidos
  }, [])

  const updateRole = useCallback(async (
    id: string,
    role: 'cliente' | 'funcionario' | 'admin'
  ) => {
    const { error: err } = await service.updateRoleCliente(id, role)
    if (err) return { success: false, error: err }
    setClientes(prev => prev.map(c => c.id === id ? { ...c, role } : c))
    return { success: true }
  }, [])

  const updateTags = useCallback(async (id: string, tags: string[]) => {
    const { error: err } = await service.updateTagsCliente(id, tags)
    if (err) return { success: false, error: err }
    setClientes(prev => prev.map(c => c.id === id ? { ...c, tags } : c))
    return { success: true }
  }, [])

  return {
    clientes,
    isLoading,
    error,
    reload: load,
    getPedidos,
    updateRole,
    updateTags,
  }
}
