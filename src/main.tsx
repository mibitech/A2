import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './features/auth/contexts/AuthContext'
import { CartProvider } from './features/cart/contexts/CartContext'
import App from './App'
import './index.css'
import { initTheme } from './lib/theme'

// Aplica a cor salva ANTES do React renderizar → sem flash de cor errada
initTheme()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
)
