import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header, Footer } from '@components/layout'
import { useAuthContext } from '@features/auth/contexts/AuthContext'
import { getMeusPedidos } from '@features/conta/services/conta.service'
import type { PedidoConta } from '@features/conta/services/conta.service'

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Aguardando pagamento',
  pago: 'Pago',
  processando: 'Em preparação',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  pago: 'bg-blue-100 text-blue-700',
  processando: 'bg-indigo-100 text-indigo-700',
  enviado: 'bg-purple-100 text-purple-700',
  entregue: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
}

const STATUS_STEPS = ['pendente', 'pago', 'processando', 'enviado', 'entregue']

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtData = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

function ProgressoStatus({ status }: { status: string }) {
  if (status === 'cancelado') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
        <svg className="h-4 w-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span className="text-sm text-red-700">Pedido cancelado</span>
      </div>
    )
  }

  const currentIndex = STATUS_STEPS.indexOf(status)

  return (
    <div className="flex items-center gap-1">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIndex
        const active = i === currentIndex
        return (
          <div key={step} className="flex items-center gap-1">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              done ? 'bg-brand text-white' : 'bg-neutral-100 text-neutral-400'
            } ${active ? 'ring-2 ring-brand ring-offset-1' : ''}`}>
              {done && i < currentIndex ? (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 w-4 sm:w-8 rounded ${i < currentIndex ? 'bg-brand' : 'bg-neutral-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function CartaoPedido({ pedido }: { pedido: PedidoConta }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs text-neutral-400 font-mono">
            Pedido #{pedido.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">{fmtData(pedido.createdAt)}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[pedido.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
          {STATUS_LABEL[pedido.status] ?? pedido.status}
        </span>
      </div>

      {pedido.status !== 'cancelado' && (
        <div className="mb-4 overflow-x-auto">
          <ProgressoStatus status={pedido.status} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3">
        <div className="flex gap-4 text-sm text-neutral-500">
          <span>{pedido.itensCount} {pedido.itensCount === 1 ? 'item' : 'itens'}</span>
          <span className="font-semibold text-neutral-800">{fmtBRL(pedido.total)}</span>
        </div>
        <Link
          to="/conta"
          className="text-xs font-medium text-brand hover:underline"
        >
          Ver detalhes →
        </Link>
      </div>
    </div>
  )
}

export default function AcompanhePedidoPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext()
  const [pedidos, setPedidos] = useState<PedidoConta[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !user) return
    setLoading(true)
    getMeusPedidos(user.id).then(({ pedidos: p, error }) => {
      if (error) setErro(error)
      else setPedidos(p)
      setLoading(false)
    })
  }, [isAuthenticated, user])

  const pedidosFiltrados = busca.trim()
    ? (pedidos ?? []).filter(p => p.id.toUpperCase().startsWith(busca.trim().toUpperCase()))
    : (pedidos ?? [])

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />

      {/* Hero */}
      <div className="bg-brand py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <svg className="mx-auto h-10 w-10 text-white/80 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h1 className="text-2xl font-bold text-white mb-1">Acompanhe seu Pedido</h1>
          <p className="text-white/70 text-sm">Consulte o status e o andamento dos seus pedidos</p>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

        {/* Não autenticado */}
        {!authLoading && !isAuthenticated && (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
            <svg className="mx-auto h-12 w-12 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 className="text-lg font-semibold text-neutral-800 mb-2">Entre na sua conta</h2>
            <p className="text-sm text-neutral-500 mb-6">
              Para acompanhar seus pedidos, faça login com o e-mail usado na compra.
            </p>
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
            >
              Entrar na conta
            </Link>
            <p className="mt-4 text-xs text-neutral-400">
              Ainda não tem conta?{' '}
              <Link to="/auth/cadastro" className="text-brand hover:underline">Cadastre-se</Link>
            </p>
          </div>
        )}

        {/* Carregando auth */}
        {authLoading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
          </div>
        )}

        {/* Autenticado */}
        {!authLoading && isAuthenticated && (
          <>
            {/* Filtro por número */}
            {pedidos && pedidos.length > 1 && (
              <div className="mb-5">
                <input
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Filtrar por número do pedido..."
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
              </div>
            )}

            {erro && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{erro}</div>
            )}

            {!loading && !erro && pedidos?.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-white p-12 text-center">
                <svg className="mx-auto h-10 w-10 text-neutral-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm text-neutral-500 mb-4">Você ainda não fez nenhum pedido.</p>
                <Link
                  to="/produtos"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
                >
                  Ver produtos
                </Link>
              </div>
            )}

            {!loading && !erro && pedidosFiltrados.length > 0 && (
              <div className="space-y-4">
                {pedidosFiltrados.map(p => (
                  <CartaoPedido key={p.id} pedido={p} />
                ))}
              </div>
            )}

            {!loading && !erro && busca && pedidosFiltrados.length === 0 && (pedidos?.length ?? 0) > 0 && (
              <p className="text-center text-sm text-neutral-400 py-8">
                Nenhum pedido encontrado com esse número.
              </p>
            )}
          </>
        )}
      </main>

      <div className="pb-20 lg:pb-0">
        <Footer />
      </div>
    </div>
  )
}
