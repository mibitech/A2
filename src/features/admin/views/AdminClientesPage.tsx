import { useState } from 'react'
import { useClientesAdmin } from '../controllers/useClientesAdmin'
import type { ClienteAdmin, PedidoResumo } from '../controllers/useClientesAdmin'
import { enviarCampanha, getCampanhas } from '../services/campanhas.admin.service'
import type { Campanha, SegmentoCampanha } from '../services/campanhas.admin.service'
import Pagination from '@components/ui/Pagination'

const roleLabel: Record<string, string> = {
  cliente: 'Cliente',
  funcionario: 'Funcionário',
  admin: 'Admin',
}

const roleColor: Record<string, string> = {
  cliente: 'bg-neutral-100 text-neutral-600',
  funcionario: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700',
}

const statusLabel: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  processando: 'Processando',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const statusColor: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  pago: 'bg-green-100 text-green-700',
  processando: 'bg-blue-100 text-blue-700',
  enviado: 'bg-indigo-100 text-indigo-700',
  entregue: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-700',
}

// =====================================================
// MODAL DE PERFIL DO CLIENTE
// =====================================================
interface PerfilModalProps {
  cliente: ClienteAdmin
  onClose: () => void
  getPedidos: (id: string) => Promise<PedidoResumo[]>
  onUpdateRole: (id: string, role: 'cliente' | 'funcionario' | 'admin') => Promise<{ success: boolean; error?: string }>
  onUpdateTags: (id: string, tags: string[]) => Promise<{ success: boolean; error?: string }>
}

const TAGS_SUGERIDAS = ['vip', 'atacado', 'recorrente', 'inativo', 'prospect', 'prioritário']

function PerfilModal({ cliente, onClose, getPedidos, onUpdateRole, onUpdateTags }: PerfilModalProps) {
  const [pedidos, setPedidos] = useState<PedidoResumo[] | null>(null)
  const [loadingPedidos, setLoadingPedidos] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'info' | 'pedidos'>('info')
  const [editandoRole, setEditandoRole] = useState(false)
  const [novoRole, setNovoRole] = useState(cliente.role)
  const [salvandoRole, setSalvandoRole] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>(cliente.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [salvandoTags, setSalvandoTags] = useState(false)

  async function carregarPedidos() {
    if (pedidos !== null) return
    setLoadingPedidos(true)
    const data = await getPedidos(cliente.id)
    setPedidos(data)
    setLoadingPedidos(false)
  }

  function handleAba(aba: 'info' | 'pedidos') {
    setAbaAtiva(aba)
    if (aba === 'pedidos') carregarPedidos()
  }

  async function handleSalvarRole() {
    setSalvandoRole(true)
    const result = await onUpdateRole(cliente.id, novoRole)
    setSalvandoRole(false)
    if (result.success) {
      setFeedback('Role atualizado!')
      setEditandoRole(false)
      setTimeout(() => setFeedback(null), 3000)
    } else {
      setFeedback('Erro: ' + result.error)
    }
  }

  function adicionarTag(tag: string) {
    const t = tag.trim().toLowerCase()
    if (!t || tags.includes(t)) return
    setTags(prev => [...prev, t])
    setTagInput('')
  }

  function removerTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  async function handleSalvarTags() {
    setSalvandoTags(true)
    const result = await onUpdateTags(cliente.id, tags)
    setSalvandoTags(false)
    setFeedback(result.success ? 'Tags salvas!' : 'Erro: ' + result.error)
    setTimeout(() => setFeedback(null), 3000)
  }

  const totalGasto = pedidos?.reduce((acc, p) => acc + p.total, 0) ?? 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand font-bold text-lg">
              {(cliente.nomeCompleto || cliente.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-neutral-800">{cliente.nomeCompleto || '—'}</p>
              <p className="text-xs text-neutral-400">{cliente.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-neutral-200">
          {(['info', 'pedidos'] as const).map(aba => (
            <button
              key={aba}
              onClick={() => handleAba(aba)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${abaAtiva === aba ? 'border-b-2 border-brand text-brand' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              {aba === 'info' ? 'Informações' : 'Pedidos'}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {feedback && (
            <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${feedback.startsWith('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {feedback}
            </div>
          )}

          {abaAtiva === 'info' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-400">Telefone</p>
                  <p className="mt-0.5 text-sm font-medium text-neutral-700">{cliente.telefone || '—'}</p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-400">CPF/CNPJ</p>
                  <p className="mt-0.5 text-sm font-medium text-neutral-700">{cliente.cpfCnpj || '—'}</p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-400">Tipo de Pessoa</p>
                  <p className="mt-0.5 text-sm font-medium text-neutral-700 capitalize">{cliente.tipoPessoa}</p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-400">Cliente desde</p>
                  <p className="mt-0.5 text-sm font-medium text-neutral-700">
                    {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="rounded-lg border border-neutral-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400">Nível de Acesso</p>
                    {editandoRole ? (
                      <select
                        value={novoRole}
                        onChange={e => setNovoRole(e.target.value as typeof novoRole)}
                        className="mt-1 rounded border border-neutral-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                      >
                        <option value="cliente">Cliente</option>
                        <option value="funcionario">Funcionário</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleColor[cliente.role]}`}>
                        {roleLabel[cliente.role]}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editandoRole ? (
                      <>
                        <button onClick={() => setEditandoRole(false)} className="text-xs text-neutral-400 hover:text-neutral-600">Cancelar</button>
                        <button onClick={handleSalvarRole} disabled={salvandoRole}
                          className="rounded bg-brand px-2 py-1 text-xs font-medium text-white hover:bg-brand-dark disabled:opacity-50">
                          {salvandoRole ? 'Salvando...' : 'Salvar'}
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setEditandoRole(true)}
                        className="text-xs text-brand hover:underline">
                        Alterar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags de segmentação */}
              <div className="rounded-lg border border-neutral-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-neutral-400">Tags de Segmentação</p>
                  <button
                    onClick={handleSalvarTags}
                    disabled={salvandoTags}
                    className="text-xs text-brand hover:underline disabled:opacity-50"
                  >
                    {salvandoTags ? 'Salvando...' : 'Salvar tags'}
                  </button>
                </div>

                {/* Tags ativas */}
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[24px]">
                  {tags.length === 0 && (
                    <span className="text-xs text-neutral-300">Nenhuma tag adicionada</span>
                  )}
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand">
                      {tag}
                      <button
                        onClick={() => removerTag(tag)}
                        className="ml-0.5 text-brand hover:text-red-500 leading-none"
                        aria-label={`Remover ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input para nova tag */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); adicionarTag(tagInput) } }}
                    placeholder="Nova tag..."
                    className="flex-1 rounded border border-neutral-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <button
                    onClick={() => adicionarTag(tagInput)}
                    className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-200"
                  >
                    +
                  </button>
                </div>

                {/* Sugestões */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {TAGS_SUGERIDAS.filter(t => !tags.includes(t)).map(t => (
                    <button
                      key={t}
                      onClick={() => adicionarTag(t)}
                      className="rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-neutral-400 hover:border-brand hover:text-brand transition-colors"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {abaAtiva === 'pedidos' && (
            <div>
              {loadingPedidos ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
                </div>
              ) : !pedidos || pedidos.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-neutral-400">Nenhum pedido encontrado</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex gap-4">
                    <div className="rounded-lg bg-neutral-50 px-4 py-2 text-center">
                      <p className="text-lg font-bold text-neutral-800">{pedidos.length}</p>
                      <p className="text-xs text-neutral-400">Pedidos</p>
                    </div>
                    <div className="rounded-lg bg-neutral-50 px-4 py-2 text-center">
                      <p className="text-lg font-bold text-neutral-800">
                        {totalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <p className="text-xs text-neutral-400">Total gasto</p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {pedidos.map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2">
                        <div>
                          <p className="text-xs font-mono text-neutral-400">#{p.id.slice(0, 8)}</p>
                          <p className="text-sm font-medium text-neutral-700">
                            {p.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[p.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
                            {statusLabel[p.status] ?? p.status}
                          </span>
                          <p className="mt-0.5 text-xs text-neutral-400">
                            {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =====================================================
// CABEÇALHO ORDENÁVEL
// =====================================================
type SortDir = 'asc' | 'desc'
type SortKeyClientes = 'nome' | 'role' | 'cadastro'

function ThSort({ label, col, current, dir, onSort, align = 'left' }: {
  label: string; col: SortKeyClientes; current: SortKeyClientes
  dir: SortDir; onSort: (c: SortKeyClientes) => void; align?: 'left' | 'right' | 'center'
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
// MODAL DE NOVA CAMPANHA
// =====================================================
const TAGS_CAMPANHA = ['vip', 'atacado', 'recorrente', 'inativo', 'prospect', 'prioritário']

function ModalCampanha({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [assunto, setAssunto] = useState('')
  const [html, setHtml] = useState('<p>Olá {{nome}},</p>\n\n<p>Mensagem aqui.</p>\n\n<p>Atenciosamente,<br>A2 Brasil Supplies</p>')
  const [segmento, setSegmento] = useState<SegmentoCampanha>('todos')
  const [tag, setTag] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{ enviados: number } | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function handleEnviar() {
    if (!titulo.trim() || !assunto.trim() || !html.trim()) { setErro('Preencha todos os campos'); return }
    if (segmento === 'por_tag' && !tag) { setErro('Selecione uma tag'); return }
    setEnviando(true); setErro(null)
    const { enviados, error } = await enviarCampanha({ titulo, assunto, conteudoHtml: html, segmento, tagFiltro: tag || undefined })
    setEnviando(false)
    if (error) { setErro(error); return }
    setResultado({ enviados })
    onSent()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="font-bold text-neutral-900">Nova Campanha de E-mail</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-neutral-100 text-neutral-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="space-y-4 p-6">
          {resultado ? (
            <div className="rounded-xl bg-green-50 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p className="text-lg font-bold text-green-800">Campanha enviada!</p>
              <p className="text-sm text-green-700">{resultado.enviados} e-mail(s) entregues</p>
              <button onClick={onClose} className="mt-4 rounded-lg bg-brand px-6 py-2 text-sm font-semibold text-white hover:bg-brand/90">Fechar</button>
            </div>
          ) : (
            <>
              {erro && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</div>}
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Título interno</label>
                <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Promoção Maio 2026"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"/>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Assunto do e-mail</label>
                <input value={assunto} onChange={e => setAssunto(e.target.value)} placeholder="Ex: Novidades da A2 Brasil Supplies"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"/>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Destinatários
                </label>
                <select value={segmento} onChange={e => setSegmento(e.target.value as SegmentoCampanha)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
                  <option value="todos">Todos os usuários</option>
                  <option value="clientes">Somente clientes</option>
                  <option value="por_tag">Por tag</option>
                </select>
                {segmento === 'por_tag' && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TAGS_CAMPANHA.map(t => (
                      <button key={t} onClick={() => setTag(t)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${tag === t ? 'bg-brand text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Conteúdo HTML <span className="font-normal text-neutral-400">(use {'{{nome}}'} para personalizar)</span>
                </label>
                <textarea value={html} onChange={e => setHtml(e.target.value)} rows={8}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand"/>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={onClose} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50">Cancelar</button>
                <button onClick={handleEnviar} disabled={enviando}
                  className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60">
                  {enviando ? (
                    <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Enviando...</>
                  ) : (
                    <><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>Enviar campanha</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================
export default function AdminClientesPage() {
  const { clientes, isLoading, error, reload, getPedidos, updateRole, updateTags } = useClientesAdmin()

  const [busca, setBusca] = useState('')
  const [filtroRole, setFiltroRole] = useState<'todos' | 'cliente' | 'funcionario' | 'admin'>('todos')
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteAdmin | null>(null)
  const [sortKey, setSortKey] = useState<SortKeyClientes>('cadastro')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [abaAtiva, setAbaAtiva] = useState<'clientes' | 'campanhas'>('clientes')
  const [showCampanha, setShowCampanha] = useState(false)
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [loadingCampanhas, setLoadingCampanhas] = useState(false)

  async function carregarCampanhas() {
    setLoadingCampanhas(true)
    const { campanhas } = await getCampanhas()
    setCampanhas(campanhas)
    setLoadingCampanhas(false)
  }
  const [pageSize, setPageSize] = useState(20)

  function toggleSort(col: SortKeyClientes) {
    if (sortKey === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(col); setSortDir('asc') }
    setPage(1)
  }

  const clientesFiltrados = clientes
    .filter(c => {
      const matchBusca = !busca ||
        c.email.toLowerCase().includes(busca.toLowerCase()) ||
        (c.nomeCompleto ?? '').toLowerCase().includes(busca.toLowerCase())
      const matchRole = filtroRole === 'todos' || c.role === filtroRole
      return matchBusca && matchRole
    })
    .sort((a, b) => {
      const m = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'nome') return m * ((a.nomeCompleto ?? a.email).localeCompare(b.nomeCompleto ?? b.email, 'pt-BR'))
      if (sortKey === 'role') return m * a.role.localeCompare(b.role, 'pt-BR')
      if (sortKey === 'cadastro') return m * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      return 0
    })

  const clientesPaginados = clientesFiltrados.slice((page - 1) * pageSize, page * pageSize)

  const totalClientes = clientes.filter(c => c.role === 'cliente').length
  const totalFuncionarios = clientes.filter(c => c.role === 'funcionario').length
  const totalAdmins = clientes.filter(c => c.role === 'admin').length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">CRM</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {clientes.length} usuários · {totalClientes} clientes · {totalFuncionarios} funcionários · {totalAdmins} admins
          </p>
        </div>
        <div className="flex gap-2">
          {abaAtiva === 'clientes' && (
            <button onClick={() => reload()} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          <button onClick={() => setShowCampanha(true)}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            Nova campanha
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="mb-5 flex gap-1 border-b border-neutral-200">
        {(['clientes', 'campanhas'] as const).map(aba => (
          <button key={aba} onClick={() => { setAbaAtiva(aba); if (aba === 'campanhas') carregarCampanhas() }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
              abaAtiva === aba ? 'border-brand text-brand' : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}>
            {aba === 'clientes' ? 'Clientes' : 'Campanhas enviadas'}
          </button>
        ))}
      </div>

      {/* ABA CAMPANHAS */}
      {abaAtiva === 'campanhas' && (
        <div>
          {loadingCampanhas ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-brand"/></div>
          ) : campanhas.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-neutral-200 p-12 text-center">
              <p className="text-sm text-neutral-400">Nenhuma campanha enviada ainda</p>
              <button onClick={() => setShowCampanha(true)} className="mt-3 text-sm text-brand hover:underline">Criar primeira campanha</button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Título</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Segmento</th>
                    <th className="px-4 py-3 text-center font-medium text-neutral-600">Enviados</th>
                    <th className="px-4 py-3 text-center font-medium text-neutral-600">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-neutral-600">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {campanhas.map(c => (
                    <tr key={c.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-800">{c.titulo}</p>
                        <p className="text-xs text-neutral-400">{c.assunto}</p>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {c.segmento === 'todos' ? 'Todos' : c.segmento === 'clientes' ? 'Clientes' : `Tag: ${c.tagFiltro}`}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-neutral-700">{c.totalEnviados}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.status === 'enviada' ? 'bg-green-100 text-green-700' :
                          c.status === 'erro' ? 'bg-red-100 text-red-700' :
                          c.status === 'enviando' ? 'bg-blue-100 text-blue-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-neutral-400">
                        {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ABA CLIENTES */}
      {abaAtiva === 'clientes' && <>

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={e => { setBusca(e.target.value); setPage(1) }}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <select
          value={filtroRole}
          onChange={e => { setFiltroRole(e.target.value as typeof filtroRole); setPage(1) }}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="todos">Todos</option>
          <option value="cliente">Clientes</option>
          <option value="funcionario">Funcionários</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-neutral-200 p-12 text-center">
          <p className="text-sm text-neutral-400">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <ThSort label="Usuário" col="nome" current={sortKey} dir={sortDir} onSort={toggleSort} align="left" />
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Contato</th>
                <th className="px-4 py-3 text-center font-medium text-neutral-600">Tipo</th>
                <ThSort label="Acesso" col="role" current={sortKey} dir={sortDir} onSort={toggleSort} align="center" />
                <ThSort label="Cadastro" col="cadastro" current={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                <th className="px-4 py-3 text-right font-medium text-neutral-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {clientesPaginados.map(c => (
                <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand text-sm font-bold shrink-0">
                        {(c.nomeCompleto || c.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">{c.nomeCompleto || '—'}</p>
                        <p className="text-xs text-neutral-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {c.telefone || <span className="text-neutral-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-neutral-500 capitalize">{c.tipoPessoa}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleColor[c.role]}`}>
                      {roleLabel[c.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-neutral-400">
                    {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setClienteSelecionado(c)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand-50 transition-colors"
                    >
                      Ver perfil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            total={clientesFiltrados.length}
            page={page}
            pageSize={pageSize}
            onPage={setPage}
            onPageSize={s => { setPageSize(s); setPage(1) }}
          />
        </div>
      )}

      {/* Modal Perfil */}
      {clienteSelecionado && (
        <PerfilModal
          cliente={clienteSelecionado}
          onClose={() => setClienteSelecionado(null)}
          getPedidos={getPedidos}
          onUpdateRole={async (id, role) => {
            const result = await updateRole(id, role)
            if (result.success) {
              setClienteSelecionado(prev => prev ? { ...prev, role } : null)
            }
            return result
          }}
          onUpdateTags={async (id, tags) => {
            const result = await updateTags(id, tags)
            if (result.success) {
              setClienteSelecionado(prev => prev ? { ...prev, tags } : null)
            }
            return result
          }}
        />
      )}
      </> }

      {/* Modal Nova Campanha */}
      {showCampanha && (
        <ModalCampanha
          onClose={() => setShowCampanha(false)}
          onSent={() => { setAbaAtiva('campanhas'); carregarCampanhas() }}
        />
      )}
    </div>
  )
}
