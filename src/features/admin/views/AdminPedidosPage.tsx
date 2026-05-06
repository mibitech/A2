import { useState } from 'react'
import { usePedidosAdmin } from '../controllers/usePedidosAdmin'
import type { PedidoAdmin, ItemPedidoAdmin, StatusPedido } from '../controllers/usePedidosAdmin'
import { reenviarEmailConfirmacao } from '../services/pedidos.admin.service'
import Pagination from '@components/ui/Pagination'

const STATUS_LABEL: Record<StatusPedido, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  processando: 'Processando',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const STATUS_COLOR: Record<StatusPedido, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  pago: 'bg-green-100 text-green-700',
  processando: 'bg-blue-100 text-blue-700',
  enviado: 'bg-indigo-100 text-indigo-700',
  entregue: 'bg-emerald-100 text-emerald-800',
  cancelado: 'bg-red-100 text-red-700',
}

const STATUS_CARD: Record<StatusPedido, { card: string; count: string; label: string }> = {
  pendente:    { card: 'border-yellow-200 bg-yellow-50',  count: 'text-yellow-700',  label: 'text-yellow-600' },
  pago:        { card: 'border-green-200 bg-green-50',    count: 'text-green-700',   label: 'text-green-600' },
  processando: { card: 'border-blue-200 bg-blue-50',      count: 'text-blue-700',    label: 'text-blue-600' },
  enviado:     { card: 'border-indigo-200 bg-indigo-50',  count: 'text-indigo-700',  label: 'text-indigo-600' },
  entregue:    { card: 'border-emerald-200 bg-emerald-50',count: 'text-emerald-700', label: 'text-emerald-600' },
  cancelado:   { card: 'border-red-200 bg-red-50',        count: 'text-red-700',     label: 'text-red-600' },
}

// Fluxo lógico de transição de status
const PROXIMOS_STATUS: Record<StatusPedido, StatusPedido[]> = {
  pendente: ['pago', 'cancelado'],
  pago: ['processando', 'cancelado'],
  processando: ['enviado', 'cancelado'],
  enviado: ['entregue'],
  entregue: [],
  cancelado: [],
}

// =====================================================
// MODAL DE DETALHES DO PEDIDO
// =====================================================
interface DetalheModalProps {
  pedido: PedidoAdmin
  onClose: () => void
  getItens: (id: string) => Promise<ItemPedidoAdmin[]>
  onUpdateStatus: (id: string, status: StatusPedido) => Promise<{ success: boolean; error?: string }>
  onUpdateObservacoes: (id: string, obs: string) => Promise<{ success: boolean; error?: string }>
}

function DetalheModal({ pedido, onClose, getItens, onUpdateStatus, onUpdateObservacoes }: DetalheModalProps) {
  const [itens, setItens] = useState<ItemPedidoAdmin[] | null>(null)
  const [loadingItens, setLoadingItens] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'itens' | 'entrega' | 'obs'>('itens')
  const [salvandoStatus, setSalvandoStatus] = useState(false)
  const [observacoes, setObservacoes] = useState(pedido.observacoes ?? '')
  const [salvandoObs, setSalvandoObs] = useState(false)
  const [enviandoEmail, setEnviandoEmail] = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string; tipo: 'ok' | 'erro' } | null>(null)
  const [statusAtual, setStatusAtual] = useState(pedido.status)

  function showFeedback(msg: string, tipo: 'ok' | 'erro') {
    setFeedback({ msg, tipo })
    setTimeout(() => setFeedback(null), 3000)
  }

  async function carregarItens() {
    if (itens !== null) return
    setLoadingItens(true)
    const data = await getItens(pedido.id)
    setItens(data)
    setLoadingItens(false)
  }

  function handleAba(aba: typeof abaAtiva) {
    setAbaAtiva(aba)
    if (aba === 'itens') carregarItens()
  }

  async function handleStatus(novoStatus: StatusPedido) {
    setSalvandoStatus(true)
    const result = await onUpdateStatus(pedido.id, novoStatus)
    setSalvandoStatus(false)
    if (result.success) {
      setStatusAtual(novoStatus)
      showFeedback('Status atualizado!', 'ok')
    } else {
      showFeedback('Erro: ' + result.error, 'erro')
    }
  }

  async function handleSalvarObs() {
    setSalvandoObs(true)
    const result = await onUpdateObservacoes(pedido.id, observacoes)
    setSalvandoObs(false)
    if (result.success) {
      showFeedback('Observação salva!', 'ok')
    } else {
      showFeedback('Erro: ' + result.error, 'erro')
    }
  }

  async function handleReenviarEmail() {
    setEnviandoEmail(true)
    const { error } = await reenviarEmailConfirmacao(pedido.id)
    setEnviandoEmail(false)
    if (error) {
      showFeedback('Erro ao enviar e-mail: ' + error, 'erro')
    } else {
      showFeedback('E-mail de confirmação reenviado!', 'ok')
    }
  }

  const proximos = PROXIMOS_STATUS[statusAtual]
  const end = pedido.enderecoEntrega

  // Carrega itens ao abrir
  useState(() => { carregarItens() })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-4 shrink-0">
          <div>
            <p className="text-xs text-neutral-400 font-mono">#{pedido.id.slice(0, 8).toUpperCase()}</p>
            <p className="font-semibold text-neutral-800 mt-0.5">
              {pedido.usuario?.nomeCompleto || pedido.usuario?.email || '—'}
            </p>
            <p className="text-xs text-neutral-400">{pedido.usuario?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[statusAtual]}`}>
              {STATUS_LABEL[statusAtual]}
            </span>
            <button
              onClick={handleReenviarEmail}
              disabled={enviandoEmail}
              title="Reenviar e-mail de confirmação ao cliente"
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-brand transition-colors disabled:opacity-50"
            >
              {enviandoEmail ? (
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="flex border-b border-neutral-200 shrink-0">
          {(['itens', 'entrega', 'obs'] as const).map(aba => (
            <button
              key={aba}
              onClick={() => handleAba(aba)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${abaAtiva === aba ? 'border-b-2 border-brand text-brand' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              {aba === 'itens' ? 'Itens' : aba === 'entrega' ? 'Entrega' : 'Observações'}
            </button>
          ))}
        </div>

        {/* Conteúdo scrollável */}
        <div className="overflow-y-auto flex-1 p-6">
          {feedback && (
            <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${feedback.tipo === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {feedback.msg}
            </div>
          )}

          {/* Aba Itens */}
          {abaAtiva === 'itens' && (
            <div>
              {loadingItens ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
                </div>
              ) : !itens || itens.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-400">Nenhum item encontrado</p>
              ) : (
                <div className="space-y-2">
                  {itens.map(item => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3">
                      {item.produto?.imagens?.[0] ? (
                        <img src={item.produto.imagens[0]} alt={item.produto.nome} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-neutral-100 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">{item.produto?.nome ?? '—'}</p>
                        {item.produto?.sku && <p className="text-xs text-neutral-400">SKU: {item.produto.sku}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-neutral-800">
                          {item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {item.quantidade}x {item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Totais */}
                  <div className="mt-3 rounded-lg bg-neutral-50 p-3 space-y-1.5">
                    <div className="flex justify-between text-sm text-neutral-600">
                      <span>Subtotal</span>
                      <span>{pedido.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-600">
                      <span>Frete</span>
                      <span>{pedido.frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    {pedido.desconto > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto</span>
                        <span>-{pedido.desconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold text-neutral-800 border-t border-neutral-200 pt-1.5">
                      <span>Total</span>
                      <span>{pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Aba Entrega */}
          {abaAtiva === 'entrega' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Destinatário', value: end.nome },
                  { label: 'CEP', value: end.cep },
                  { label: 'Logradouro', value: end.logradouro && end.numero ? `${end.logradouro}, ${end.numero}` : end.logradouro },
                  { label: 'Complemento', value: end.complemento || '—' },
                  { label: 'Bairro', value: end.bairro },
                  { label: 'Cidade / UF', value: end.cidade && end.estado ? `${end.cidade} / ${end.estado}` : end.cidade },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-neutral-50 p-3">
                    <p className="text-xs text-neutral-400">{label}</p>
                    <p className="mt-0.5 text-sm font-medium text-neutral-700">{value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Telefone do cliente */}
              {pedido.usuario?.telefone && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-400">Telefone de contato</p>
                  <p className="mt-0.5 text-sm font-medium text-neutral-700">{pedido.usuario.telefone}</p>
                </div>
              )}
            </div>
          )}

          {/* Aba Observações */}
          {abaAtiva === 'obs' && (
            <div className="space-y-3">
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                rows={5}
                placeholder="Adicione observações internas sobre este pedido..."
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
              <button
                onClick={handleSalvarObs}
                disabled={salvandoObs}
                className="w-full rounded-lg bg-brand py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
              >
                {salvandoObs ? 'Salvando...' : 'Salvar observação'}
              </button>
            </div>
          )}
        </div>

        {/* Footer — ações de status */}
        {proximos.length > 0 && (
          <div className="border-t border-neutral-200 px-6 py-4 shrink-0">
            <p className="text-xs text-neutral-400 mb-2">Avançar status para:</p>
            <div className="flex gap-2 flex-wrap">
              {proximos.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatus(s)}
                  disabled={salvandoStatus}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                    s === 'cancelado'
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-brand text-white hover:bg-brand-dark'
                  }`}
                >
                  {salvandoStatus ? '...' : STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// =====================================================
// CABEÇALHO ORDENÁVEL
// =====================================================
type SortDir = 'asc' | 'desc'
type SortKeyPedidos = 'data' | 'cliente' | 'status' | 'total'

function ThSort({ label, col, current, dir, onSort, align = 'left' }: {
  label: string; col: SortKeyPedidos; current: SortKeyPedidos
  dir: SortDir; onSort: (c: SortKeyPedidos) => void; align?: 'left' | 'right' | 'center'
}) {
  const active = current === col
  return (
    <th
      onClick={() => onSort(col)}
      className={`cursor-pointer select-none px-4 py-3 text-${align} font-medium text-neutral-600 hover:text-neutral-900`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`text-xs ${active ? 'text-brand' : 'text-neutral-300'}`}>
          {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </span>
    </th>
  )
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================
export default function AdminPedidosPage() {
  const { pedidos, isLoading, error, reload, getItens, updateStatus, updateObservacoes } = usePedidosAdmin()

  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<StatusPedido | 'todos'>('todos')
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoAdmin | null>(null)
  const [sortKey, setSortKey] = useState<SortKeyPedidos>('data')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  function toggleSort(col: SortKeyPedidos) {
    if (sortKey === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(col); setSortDir('asc') }
    setPage(1)
  }

  const pedidosFiltrados = pedidos
    .filter(p => {
      const matchBusca = !busca ||
        p.id.toLowerCase().includes(busca.toLowerCase()) ||
        (p.usuario?.email ?? '').toLowerCase().includes(busca.toLowerCase()) ||
        (p.usuario?.nomeCompleto ?? '').toLowerCase().includes(busca.toLowerCase())
      const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus
      return matchBusca && matchStatus
    })
    .sort((a, b) => {
      const m = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'data') return m * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      if (sortKey === 'cliente') return m * ((a.usuario?.nomeCompleto ?? '').localeCompare(b.usuario?.nomeCompleto ?? '', 'pt-BR'))
      if (sortKey === 'status') return m * a.status.localeCompare(b.status, 'pt-BR')
      if (sortKey === 'total') return m * (a.total - b.total)
      return 0
    })

  const pedidosPaginados = pedidosFiltrados.slice((page - 1) * pageSize, page * pageSize)

  const receitaTotal = pedidos
    .filter(p => p.status !== 'cancelado')
    .reduce((acc, p) => acc + p.total, 0)

  const countPorStatus = (s: StatusPedido) => pedidos.filter(p => p.status === s).length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Pedidos</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {pedidos.length} pedidos · receita {receitaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <button
          onClick={reload}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Cards de status */}
      <div className="grid grid-cols-3 gap-3 mb-5 sm:grid-cols-6">
        {(Object.keys(STATUS_LABEL) as StatusPedido[]).map(s => (
          <button
            key={s}
            onClick={() => setFiltroStatus(filtroStatus === s ? 'todos' : s)}
            className={`rounded-xl border p-3 text-left transition-all ${
              filtroStatus === s
                ? `${STATUS_CARD[s].card} ring-2 ring-offset-1 ring-current ${STATUS_CARD[s].count}`
                : `${STATUS_CARD[s].card} opacity-70 hover:opacity-100`
            }`}
          >
            <p className={`text-lg font-bold ${STATUS_CARD[s].count}`}>
              {countPorStatus(s)}
            </p>
            <p className={`text-xs mt-0.5 font-medium ${STATUS_CARD[s].label}`}>{STATUS_LABEL[s]}</p>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por cliente ou nº do pedido..."
          value={busca}
          onChange={e => { setBusca(e.target.value); setPage(1) }}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <select
          value={filtroStatus}
          onChange={e => { setFiltroStatus(e.target.value as typeof filtroStatus); setPage(1) }}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="todos">Todos os status</option>
          {(Object.keys(STATUS_LABEL) as StatusPedido[]).map(s => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-neutral-200 p-12 text-center">
          <p className="text-sm text-neutral-400">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Pedido</th>
                <ThSort label="Cliente" col="cliente" current={sortKey} dir={sortDir} onSort={toggleSort} align="left" />
                <ThSort label="Status" col="status" current={sortKey} dir={sortDir} onSort={toggleSort} align="center" />
                <ThSort label="Total" col="total" current={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                <ThSort label="Data" col="data" current={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                <th className="px-4 py-3 text-right font-medium text-neutral-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {pedidosPaginados.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-neutral-500">#{p.id.slice(0, 8).toUpperCase()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-800">{p.usuario?.nomeCompleto || '—'}</p>
                    <p className="text-xs text-neutral-400">{p.usuario?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[p.status]}`}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-800">
                    {p.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-neutral-400">
                    {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setPedidoSelecionado(p)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand-50 transition-colors"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            total={pedidosFiltrados.length}
            page={page}
            pageSize={pageSize}
            onPage={setPage}
            onPageSize={s => { setPageSize(s); setPage(1) }}
          />
        </div>
      )}

      {/* Modal Detalhes */}
      {pedidoSelecionado && (
        <DetalheModal
          pedido={pedidoSelecionado}
          onClose={() => setPedidoSelecionado(null)}
          getItens={getItens}
          onUpdateStatus={async (id, status) => {
            const result = await updateStatus(id, status)
            if (result.success) {
              setPedidoSelecionado(prev => prev ? { ...prev, status } : null)
            }
            return result
          }}
          onUpdateObservacoes={async (id, obs) => {
            const result = await updateObservacoes(id, obs)
            if (result.success) {
              setPedidoSelecionado(prev => prev ? { ...prev, observacoes: obs } : null)
            }
            return result
          }}
        />
      )}
    </div>
  )
}
