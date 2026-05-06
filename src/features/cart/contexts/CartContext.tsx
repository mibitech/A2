import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { CartItem, CartContextType } from '../models/cart.types'

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'a2tech_cart'

// Calcular totais do carrinho
function calculateCartTotals(items: CartItem[]): { total: number; itemsCount: number } {
  const total = items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0)
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)
  return { total, itemsCount }
}

// Carregar carrinho do localStorage
function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Erro ao carregar carrinho do localStorage:', error)
  }
  return []
}

// Salvar carrinho no localStorage
function saveCartToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Erro ao salvar carrinho no localStorage:', error)
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Inicializador lazy: lê do localStorage uma única vez na montagem,
  // evitando que o efeito de salvamento sobrescreva os dados antes de carregá-los
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage())
  const [total, setTotal] = useState(() => calculateCartTotals(loadCartFromStorage()).total)
  const [itemsCount, setItemsCount] = useState(() => calculateCartTotals(loadCartFromStorage()).itemsCount)

  // Salvar no localStorage e recalcular totais quando items mudar
  useEffect(() => {
    saveCartToStorage(items)
    const totals = calculateCartTotals(items)
    setTotal(totals.total)
    setItemsCount(totals.itemsCount)
  }, [items])

  // Adicionar item ao carrinho
  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === newItem.productId)

      if (existingItem) {
        // Incrementar quantidade (respeitando estoque)
        return prevItems.map((item) =>
          item.productId === newItem.productId
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, item.maxStock),
              }
            : item
        )
      } else {
        // Adicionar novo item
        return [...prevItems, { ...newItem, quantity: 1 }]
      }
    })
  }

  // Remover item do carrinho
  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId))
  }

  // Atualizar quantidade
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.min(quantity, item.maxStock),
            }
          : item
      )
    )
  }

  // Limpar carrinho
  const clearCart = () => {
    setItems([])
    saveCartToStorage([]) // limpa localStorage imediatamente, sem esperar o efeito
  }

  // Verificar se produto está no carrinho
  const isInCart = (productId: string): boolean => {
    return items.some((item) => item.productId === productId)
  }

  // Obter quantidade de um produto
  const getItemQuantity = (productId: string): number => {
    const item = items.find((item) => item.productId === productId)
    return item?.quantity || 0
  }

  const value: CartContextType = {
    items,
    total,
    itemsCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
