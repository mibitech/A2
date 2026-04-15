import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../auth/contexts/AuthContext'
import {
  getDashboardStats,
  getPedidosRecentes,
  getProdutosEstoqueBaixo,
} from '../services/dashboard.admin.service'
import type {
  DashboardStats,
  PedidoRecente,
  ProdutoEstoqueBaixo,
} from '../services/dashboard.admin.service'

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  processando: 'Processando',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  pago: 'bg-green-100 text-green-700',
  processando: 'bg-blue-100 text-blue-700',
  enviado: 'bg-indigo-100 text-indigo-700',
  entregue: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-700',
}

const modules = [
  {
    name: 'Estoque',
    href: '/admin/estoque',
    descricao: 'CRUD de produtos, upload de imagens e histórico de movimentações',
    ativo: true,
  },
  {
    name: 'Pedidos',
    href: '/admin/pedidos',
    descricao: 'Listagem, detalhes e atualização de status dos pedidos',
    ativo: true,
  },
  {
    name: 'Clientes',
    href: '/admin/clientes',
    descricao: 'Perfis de clientes, histórico de compras e gerenciamento de roles',
    ativo: true,
  },
  {
    name: 'Financeiro',
    href: '/admin/financeiro',
    descricao: 'Conciliação Stripe e fluxo de caixa (aguardando configuração do Stripe)',
    ativo: false,
  },
]

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-neutral-200 ${className}`} />
}

export default function AdminDashboard() {
  const { user } = useAuthContext()
  const firstName = user?.nomeCompleto?.split(' ')[0] || user?.email?.split('@')[0] || 'usuário'

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pedidos, setPedidos] = useState<PedidoRecente[] | null>(null)
  const [estoqueBaixo, setEstoqueBaixo] = useState<ProdutoEstoqueBaixo[] | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingPedidos, setLoadingPedidos] = useState(true)
  const [loadingEstoque, setLoadingEstoque] = useState(true)

  useEffect(() => {
    getDashboardStats().then(({ stats: s }) => {
      setStats(s)
      setLoadingStats(false)
    })
    getPedidosRecentes().then(({ pedidos: p }) => {
      setPedidos(p)
      setLoadingPedidos(false)
    })
    getProdutosEstoqueBaixo().then(({ produtos: p }) => {
      setEstoqueBaixo(p)
      setLoadingEstoque(false)
    })
  }, [])

  const statCards = [
    {
      label: 'Pedidos hoje',
      value: stats ? String(stats.pedidosHoje) : null,
      icon: (
        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      bg: 'bg-blue-50',
      valueColor: 'text-blue-700',
    },
    {
      label: 'Receita do mês',
      value: stats ? stats.receitaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : null,
      icon: (
        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-green-50',
      valueColor: 'text-green-700',
    },
    {
      label: 'Produtos ativos',
      value: stats ? String(stats.produtosAtivos) : null,
      icon: (
        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bg: 'bg-purple-50',
      valueColor: 'text-purple-700',
    },
    {
      label: 'Clientes',
      value: stats ? String(stats.totalClientes) : null,
      icon: (
        <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      bg: 'bg-orange-50',
      valueColor: 'text-orange-700',
    },
  ]

  return (
    <div className="p-6 max-w-6xl">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Olá, {firstName}</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Bem-vindo ao painel administrativo da A2Tech.
        </p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.bg} mb-3`}>
              {card.icon}
            </div>
            <p className="text-xs text-neutral-500">{card.label}</p>
            {loadingStats ? (
              <Skeleton className="mt-1 h-7 w-20" />
            ) : (
              <p className={`mt-1 text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Linha: Pedidos recentes + Estoque baixo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Últimos pedidos */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-800">Últimos pedidos</h2>
            <Link to="/admin/pedidos" className="text-xs text-brand hover:underline">
              Ver todos →
            </Link>
          </div>

          {loadingPedidos ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !pedidos || pedidos.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-400">Nenhum pedido ainda</p>
          ) : (
            <div className="space-y-2">
              {pedidos.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">
                      {p.nomeCliente || p.emailCliente || '—'}
                    </p>
                    <p className="text-xs text-neutral-400 font-mono">
                      #{p.id.slice(0, 8).toUpperCase()} · {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="ml-3 flex flex-col items-end shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[p.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                    <p className="mt-0.5 text-xs font-medium text-neutral-700">
                      {p.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estoque baixo */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-800">Estoque baixo</h2>
            <Link to="/admin/estoque" className="text-xs text-brand hover:underline">
              Ver estoque →
            </Link>
          </div>

          {loadingEstoque ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !estoqueBaixo || estoqueBaixo.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-neutral-400">Nenhum produto com estoque crítico</p>
            </div>
          ) : (
            <div className="space-y-2">
              {estoqueBaixo.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{p.nome}</p>
                    {p.sku && <p className="text-xs text-neutral-400">SKU: {p.sku}</p>}
                  </div>
                  <span className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${p.estoque === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {p.estoque === 0 ? 'Sem estoque' : `${p.estoque} un`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Módulos do sistema */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-800 mb-1">Módulos do sistema</h2>
        <p className="text-xs text-neutral-500 mb-4">Acesso rápido aos módulos do painel admin.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modules.map((mod) => (
            mod.ativo ? (
              <Link
                key={mod.name}
                to={mod.href}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 hover:border-brand hover:bg-brand-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-neutral-800 group-hover:text-brand">{mod.name}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ativo</span>
                  </div>
                  <p className="text-xs text-neutral-500">{mod.descricao}</p>
                </div>
                <svg className="h-4 w-4 text-neutral-300 group-hover:text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div
                key={mod.name}
                className="flex items-center gap-3 rounded-lg border border-dashed border-neutral-200 p-4 opacity-60"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-neutral-500">{mod.name}</span>
                    <span className="text-xs bg-neutral-100 text-neutral-400 px-2 py-0.5 rounded-full">Aguardando</span>
                  </div>
                  <p className="text-xs text-neutral-400">{mod.descricao}</p>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )
}
