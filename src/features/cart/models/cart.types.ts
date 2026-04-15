/**
 * Types e Interfaces - Feature Cart
 */

export interface CartItem {
  productId: string
  productSlug: string
  productName: string
  productImage: string
  productPrice: number
  quantity: number
  maxStock: number
}

export interface CartState {
  items: CartItem[]
  total: number
  itemsCount: number
}

export interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  getItemQuantity: (productId: string) => number
}
