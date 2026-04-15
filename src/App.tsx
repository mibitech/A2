import { Routes, Route } from 'react-router-dom'
import DesignSystemPage from './features/design-system/views/DesignSystemPage'
import LandingPage from './features/landing/views/LandingPage'
import LoginPage from './features/auth/views/LoginPage'
import SignupPage from './features/auth/views/SignupPage'
import ForgotPasswordPage from './features/auth/views/ForgotPasswordPage'
import ResetPasswordPage from './features/auth/views/ResetPasswordPage'
import ProductsPage from './features/products/views/ProductsPage'
import ProductDetailPage from './features/products/views/ProductDetailPage'
import CartPage from './features/cart/views/CartPage'
import { ProtectedRoute } from './features/auth/components/ProtectedRoute'
import AdminLayout from './features/admin/views/AdminLayout'
import AdminDashboard from './features/admin/views/AdminDashboard'
import AdminEstoquePage from './features/admin/views/AdminEstoquePage'
import AdminPedidosPage from './features/admin/views/AdminPedidosPage'
import AdminClientesPage from './features/admin/views/AdminClientesPage'
import AdminFinanceiroPage from './features/admin/views/AdminFinanceiroPage'

function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/cadastro" element={<SignupPage />} />
      <Route path="/auth/recuperar-senha" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

      {/* Products Routes */}
      <Route path="/produtos" element={<ProductsPage />} />
      <Route path="/produtos/:slug" element={<ProductDetailPage />} />

      {/* Cart & Checkout Routes */}
      <Route path="/carrinho" element={<CartPage />} />

      {/* Admin Routes — apenas admin e funcionario */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin', 'funcionario']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="estoque" element={<AdminEstoquePage />} />
        <Route path="pedidos" element={<AdminPedidosPage />} />
        <Route path="clientes" element={<AdminClientesPage />} />
        <Route path="financeiro" element={<AdminFinanceiroPage />} />
      </Route>

      {/* Design System (apenas dev) */}
      <Route path="/design-system" element={<DesignSystemPage />} />
    </Routes>
  )
}

export default App
