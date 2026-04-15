import { useState, useEffect, useCallback } from 'react'
import * as service from '../services/clientes.admin.service'
import type { ClienteAdmin, PedidoResumo } from '../services/clientes.admin.service'

export type { ClienteAdmin, PedidoResumo }

export function useClientesAdmin() {
  const [clientes, setClientes] = useState<ClienteAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { clientes: data, error: err } = await service.getAllClientes()
    setClientes(data)
    if (err) setError(err)
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

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

  return {
    clientes,
    isLoading,
    error,
    reload: load,
    getPedidos,
    updateRole,
  }
}
