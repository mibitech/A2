import { useState, useEffect, useCallback } from 'react'
import * as svc from '../services/fornecedores.admin.service'
import type { Fornecedor, FornecedorInput } from '../services/fornecedores.admin.service'

export type { Fornecedor, FornecedorInput }

export function useFornecedoresAdmin() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await svc.listarFornecedores()
    setFornecedores(data)
    setError(error)
    setIsLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const criar = useCallback(async (input: FornecedorInput) => {
    const { data, error } = await svc.criarFornecedor(input)
    if (error) return { success: false, error }
    if (data) setFornecedores(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
    return { success: true, error: null }
  }, [])

  const atualizar = useCallback(async (id: string, input: Partial<FornecedorInput>) => {
    const { error } = await svc.atualizarFornecedor(id, input)
    if (error) return { success: false, error }
    await carregar()
    return { success: true, error: null }
  }, [carregar])

  const alternarAtivo = useCallback(async (id: string, ativo: boolean) => {
    const { error } = await svc.alternarAtivo(id, ativo)
    if (error) return { success: false, error }
    setFornecedores(prev => prev.map(f => f.id === id ? { ...f, ativo } : f))
    return { success: true, error: null }
  }, [])

  return { fornecedores, isLoading, error, carregar, criar, atualizar, alternarAtivo }
}
