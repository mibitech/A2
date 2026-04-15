import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@features/auth/contexts/AuthContext'
import * as service from '../services/produtos.admin.service'
import type { ProdutoAdmin, MovimentacaoEstoque } from '../services/produtos.admin.service'
import type { Database } from '@/types/supabase'

type ProdutoInsert = Database['public']['Tables']['produtos']['Insert']
type ProdutoUpdate = Database['public']['Tables']['produtos']['Update']

export type { ProdutoAdmin, MovimentacaoEstoque }

export function useProdutosAdmin() {
  const { user } = useAuthContext()
  const [produtos, setProdutos] = useState<ProdutoAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { produtos: data, error: err } = await service.getAllProdutos()
    setProdutos(data)
    if (err) setError(err)
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (
    data: Omit<ProdutoInsert, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const { produto, error: err } = await service.createProduto(data)
    if (err) return { success: false, error: err }
    if (produto) setProdutos(prev => [...prev, produto].sort((a, b) => a.nome.localeCompare(b.nome)))
    return { success: true, produto }
  }, [])

  const update = useCallback(async (id: string, data: ProdutoUpdate) => {
    const { produto, error: err } = await service.updateProduto(id, data)
    if (err) return { success: false, error: err }
    if (produto) setProdutos(prev => prev.map(p => p.id === id ? produto : p))
    return { success: true, produto }
  }, [])

  const remove = useCallback(async (id: string) => {
    const { error: err } = await service.deleteProduto(id)
    if (err) return { success: false, error: err }
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ativo: false } : p))
    return { success: true }
  }, [])

  const uploadImagem = useCallback(async (file: File, produtoId: string) => {
    return service.uploadImagemProduto(file, produtoId)
  }, [])

  const removeImagem = useCallback(async (url: string) => {
    return service.removeImagemProduto(url)
  }, [])

  const ajustarEstoque = useCallback(async (
    produto: ProdutoAdmin,
    tipo: 'entrada' | 'saida' | 'ajuste',
    quantidade: number,
    motivo?: string
  ) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    const novoEstoque =
      tipo === 'entrada' ? produto.estoque + quantidade
      : tipo === 'saida' ? produto.estoque - quantidade
      : produto.estoque + quantidade

    // Atualiza estoque no produto
    const { error: errUpdate } = await service.updateProduto(produto.id, { estoque: novoEstoque })
    if (errUpdate) return { success: false, error: errUpdate }

    // Registra movimentação
    const { error: errMov } = await service.registrarMovimentacao({
      produtoId: produto.id,
      usuarioId: user.id,
      tipo,
      quantidade,
      estoqueAnterior: produto.estoque,
      motivo,
    })
    if (errMov) return { success: false, error: errMov }

    setProdutos(prev => prev.map(p => p.id === produto.id ? { ...p, estoque: novoEstoque } : p))
    return { success: true }
  }, [user])

  const getMovimentacoes = useCallback(async (produtoId: string) => {
    return service.getMovimentacoes(produtoId)
  }, [])

  return {
    produtos,
    isLoading,
    error,
    reload: load,
    create,
    update,
    remove,
    uploadImagem,
    removeImagem,
    ajustarEstoque,
    getMovimentacoes,
  }
}
