import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../auth/contexts/AuthContext'

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    end: true,
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Estoque',
    href: '/admin/estoque',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: 'Pedidos',
    href: '/admin/pedidos',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Clientes',
    href: '/admin/clientes',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Financeiro',
    href: '/admin/financeiro',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Conteúdo do Site',
    href: '/admin/site',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Design System',
    href: '/admin/design-system',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
]

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  funcionario: 'Funcionário',
  cliente: 'Cliente',
}

function getInitial(user: { nomeCompleto?: string | null; email?: string | null } | null) {
  return ((user?.nomeCompleto || user?.email) ?? '?').charAt(0).toUpperCase()
}

export default function AdminLayout() {
  const { user, signOut } = useAuthContext()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (window.innerWidth < 1024) return true
    return localStorage.getItem('admin_sidebar_collapsed') === 'true'
  })

  function toggleCollapsed() {
    setCollapsed(prev => {
      const next = !prev
      if (window.innerWidth >= 1024) localStorage.setItem('admin_sidebar_collapsed', String(next))
      return next
    })
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-brand-900 text-white flex flex-col shrink-0 transition-all duration-200`}>

        {/* Logo + toggle */}
        <div className={`flex items-center border-b border-brand-800 ${collapsed ? 'justify-center px-0 py-4' : 'justify-between px-5 py-4'}`}>
          {!collapsed && (
            <div>
              <span className="text-base font-bold text-white">A2</span>
              <span className="text-xs text-brand-300 block leading-none">Brasil Supplies LTDA</span>
              <span className="text-xs text-brand-400 block mt-1">Painel Admin</span>
            </div>
          )}
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className="rounded-lg p-1.5 text-brand-300 hover:bg-brand-800 hover:text-white transition-colors"
          >
            {collapsed ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* Voltar ao site */}
        <div className={`pt-3 ${collapsed ? 'px-2' : 'px-3'}`}>
          <div className="relative group/back">
            <Link
              to="/"
              className={`flex items-center rounded-lg text-xs text-brand-300 hover:text-white hover:bg-brand-800 transition-colors ${collapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2'}`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {!collapsed && 'Voltar para o site'}
            </Link>
            {collapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover/back:opacity-100 z-50">
                Voltar para o site
              </span>
            )}
          </div>
        </div>

        {/* Navegação */}
        <nav className={`flex-1 py-4 space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => (
            <div key={item.href} className="relative group/nav">
              <NavLink
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center rounded-lg text-sm font-medium transition-colors ${
                    collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-brand-700 text-white'
                      : 'text-brand-200 hover:bg-brand-800 hover:text-white'
                  }`
                }
              >
                {item.icon}
                {!collapsed && item.label}
              </NavLink>
              {collapsed && (
                <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover/nav:opacity-100 z-50">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Usuário + logout */}
        <div className={`border-t border-brand-800 ${collapsed ? 'px-2 py-3' : 'px-4 py-4'}`}>
          {collapsed ? (
            <div className="relative group/user flex flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                {getInitial(user)}
              </div>
              <span className="pointer-events-none absolute left-full top-0 ml-2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover/user:opacity-100 z-50">
                {user?.nomeCompleto || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                title="Sair da conta"
                className="rounded-lg p-1.5 text-brand-300 hover:bg-brand-800 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-brand-200 font-medium truncate">{user?.nomeCompleto || user?.email}</p>
              <p className="text-xs text-brand-400 mt-0.5 mb-3">
                {roleLabel[user?.role ?? ''] ?? user?.role}
              </p>
              <button
                onClick={handleSignOut}
                className="text-xs text-brand-300 hover:text-white transition-colors"
              >
                Sair da conta
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
