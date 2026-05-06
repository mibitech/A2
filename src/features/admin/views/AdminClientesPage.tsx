import { useState, useEffect } from 'react'
import { useClientesAdmin } from '../controllers/useClientesAdmin'
import type { ClienteAdmin, PedidoResumo } from '../controllers/useClientesAdmin'
import { enviarCampanha, getCampanhas, deleteCampanha } from '../services/campanhas.admin.service'
import type { Campanha, SegmentoCampanha } from '../services/campanhas.admin.service'
import { getTagsUnicas } from '../services/clientes.admin.service'
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
  onUpdatePerfil: (id: string, dados: { nomeCompleto?: string; telefone?: string; cpfCnpj?: string; tipoPessoa?: 'fisica' | 'juridica' }) => Promise<{ success: boolean; error?: string }>
}

const TAGS_SUGERIDAS = ['vip', 'atacado', 'recorrente', 'inativo', 'prospect', 'prioritário']

function PerfilModal({ cliente, onClose, getPedidos, onUpdateRole, onUpdateTags, onUpdatePerfil }: PerfilModalProps) {
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
  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const [nomeEdit, setNomeEdit] = useState(cliente.nomeCompleto ?? '')
  const [telefoneEdit, setTelefoneEdit] = useState(cliente.telefone ?? '')
  const [cpfEdit, setCpfEdit] = useState(cliente.cpfCnpj ?? '')
  const [tipoPessoaEdit, setTipoPessoaEdit] = useState<'fisica' | 'juridica'>(cliente.tipoPessoa)
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)

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

  async function handleSalvarPerfil() {
    setSalvandoPerfil(true)
    const result = await onUpdatePerfil(cliente.id, {
      nomeCompleto: nomeEdit,
      telefone: telefoneEdit,
      cpfCnpj: cpfEdit,
      tipoPessoa: tipoPessoaEdit,
    })
    setSalvandoPerfil(false)
    if (result.success) {
      setFeedback('Perfil atualizado!')
      setEditandoPerfil(false)
      setTimeout(() => setFeedback(null), 3000)
    } else {
      setFeedback('Erro: ' + result.error)
    }
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
              {/* Dados básicos */}
              <div className="rounded-lg border border-neutral-200 p-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-neutral-500">Dados do Perfil</p>
                  {editandoPerfil ? (
                    <div className="flex gap-2">
                      <button onClick={() => setEditandoPerfil(false)} className="text-xs text-neutral-400 hover:text-neutral-600">Cancelar</button>
                      <button onClick={handleSalvarPerfil} disabled={salvandoPerfil}
                        className="rounded bg-brand px-2 py-1 text-xs font-medium text-white hover:bg-brand-dark disabled:opacity-50">
                        {salvandoPerfil ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setEditandoPerfil(true)} className="text-xs text-brand hover:underline">Editar</button>
                  )}
                </div>
                {editandoPerfil ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="text-xs text-neutral-400">Nome completo</label>
                      <input value={nomeEdit} onChange={e => setNomeEdit(e.target.value)}
                        className="mt-0.5 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400">Telefone</label>
                      <input value={telefoneEdit} onChange={e => setTelefoneEdit(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="mt-0.5 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400">CPF/CNPJ</label>
                      <input value={cpfEdit} onChange={e => setCpfEdit(e.target.value)}
                        className="mt-0.5 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400">Tipo de Pessoa</label>
                      <select value={tipoPessoaEdit} onChange={e => setTipoPessoaEdit(e.target.value as 'fisica' | 'juridica')}
                        className="mt-0.5 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                        <option value="fisica">Física</option>
                        <option value="juridica">Jurídica</option>
                      </select>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-2">
                      <p className="text-xs text-neutral-400">Cliente desde</p>
                      <p className="mt-0.5 text-sm font-medium text-neutral-700">
                        {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-neutral-50 p-2.5">
                      <p className="text-xs text-neutral-400">Nome</p>
                      <p className="mt-0.5 text-sm font-medium text-neutral-700">{cliente.nomeCompleto || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-2.5">
                      <p className="text-xs text-neutral-400">Telefone</p>
                      <p className="mt-0.5 text-sm font-medium text-neutral-700">{cliente.telefone || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-2.5">
                      <p className="text-xs text-neutral-400">CPF/CNPJ</p>
                      <p className="mt-0.5 text-sm font-medium text-neutral-700">{cliente.cpfCnpj || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-2.5">
                      <p className="text-xs text-neutral-400">Tipo de Pessoa</p>
                      <p className="mt-0.5 text-sm font-medium text-neutral-700 capitalize">{cliente.tipoPessoa === 'fisica' ? 'Física' : 'Jurídica'}</p>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-2.5">
                      <p className="text-xs text-neutral-400">Cliente desde</p>
                      <p className="mt-0.5 text-sm font-medium text-neutral-700">
                        {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
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
interface ModalCampanhaProps {
  onClose: () => void
  onSent: () => void
  initialData?: Pick<Campanha, 'titulo' | 'assunto' | 'conteudoHtml' | 'segmento' | 'tagFiltro'>
}

function ModalCampanha({ onClose, onSent, initialData }: ModalCampanhaProps) {
  const [titulo, setTitulo] = useState(initialData?.titulo ?? '')
  const [assunto, setAssunto] = useState(initialData?.assunto ?? '')
  const [html, setHtml] = useState(initialData?.conteudoHtml ?? '<p>Olá {{nome}},</p>\n\n<p>Mensagem aqui.</p>\n\n<p>Atenciosamente,<br>A2 Brasil Supplies</p>')
  const [segmento, setSegmento] = useState<SegmentoCampanha>(initialData?.segmento ?? 'todos')
  const [tag, setTag] = useState(initialData?.tagFiltro ?? '')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{ enviados: number } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [tagsDisponiveis, setTagsDisponiveis] = useState<string[]>([])

  useEffect(() => {
    getTagsUnicas().then(setTagsDisponiveis)
  }, [])

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
      <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl max-h-[90vh]">
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="font-bold text-neutral-900">{initialData ? 'Reenviar Campanha' : 'Nova Campanha de E-mail'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-neutral-100 text-neutral-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto p-6">
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
                  <div className="mt-2">
                    {tagsDisponiveis.length === 0 ? (
                      <p className="text-xs text-neutral-400">Nenhuma tag cadastrada nos clientes ainda.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {tagsDisponiveis.map(t => (
                          <button key={t} onClick={() => setTag(t)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${tag === t ? 'bg-brand text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                    {tag && (
                      <p className="mt-1.5 text-xs text-neutral-500">
                        Selecionada: <span className="font-medium text-brand">{tag}</span>
                        <button onClick={() => setTag('')} className="ml-2 text-neutral-400 hover:text-red-500">×</button>
                      </p>
                    )}
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
  const { clientes, isLoading, error, reload, getPedidos, updateRole, updateTags, updatePerfil } = useClientesAdmin()

  const [busca, setBusca] = useState('')
  const [filtroRole, setFiltroRole] = useState<'todos' | 'cliente' | 'funcionario' | 'admin'>('todos')
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteAdmin | null>(null)
  const [sortKey, setSortKey] = useState<SortKeyClientes>('cadastro')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [abaAtiva, setAbaAtiva] = useState<'clientes' | 'campanhas'>('clientes')
  const [campanhaReenvio, setCampanhaReenvio] = useState<Campanha | null>(null)
  const [showCampanha, setShowCampanha] = useState(false)
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [loadingCampanhas, setLoadingCampanhas] = useState(false)
  const [sortCampanha, setSortCampanha] = useState<'titulo' | 'status' | 'enviados' | 'data'>('data')
  const [sortCampanhaDir, setSortCampanhaDir] = useState<'asc' | 'desc'>('desc')
  const [deletandoCampanha, setDeletandoCampanha] = useState<string | null>(null)

  async function carregarCampanhas() {
    setLoadingCampanhas(true)
    const { campanhas } = await getCampanhas()
    setCampanhas(campanhas)
    setLoadingCampanhas(false)
  }

  function toggleSortCampanha(col: typeof sortCampanha) {
    if (sortCampanha === col) setSortCampanhaDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCampanha(col); setSortCampanhaDir('asc') }
  }

  async function handleDeleteCampanha(id: string) {
    setDeletandoCampanha(id)
    const { error } = await deleteCampanha(id)
    if (!error) setCampanhas(prev => prev.filter(c => c.id !== id))
    setDeletandoCampanha(null)
  }

  const campanhasOrdenadas = [...campanhas].sort((a, b) => {
    const m = sortCampanhaDir === 'asc' ? 1 : -1
    if (sortCampanha === 'titulo') return m * a.titulo.localeCompare(b.titulo, 'pt-BR')
    if (sortCampanha === 'status') return m * a.status.localeCompare(b.status, 'pt-BR')
    if (sortCampanha === 'enviados') return m * (a.totalEnviados - b.totalEnviados)
    return m * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  })
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
                    {([
                      { label: 'Título', col: 'titulo', align: 'left' },
                      { label: 'Segmento', col: null, align: 'left' },
                      { label: 'Enviados', col: 'enviados', align: 'center' },
                      { label: 'Status', col: 'status', align: 'center' },
                      { label: 'Data', col: 'data', align: 'right' },
                      { label: 'Ações', col: null, align: 'center' },
                    ] as const).map(({ label, col, align }) =>
                      col ? (
                        <th key={label} onClick={() => toggleSortCampanha(col)}
                          className={`cursor-pointer select-none px-4 py-3 text-${align} font-medium text-neutral-600 hover:text-neutral-900`}>
                          <span className="inline-flex items-center gap-1">
                            {label}
                            <span className={`text-xs ${sortCampanha === col ? 'text-brand' : 'text-neutral-300'}`}>
                              {sortCampanha === col ? (sortCampanhaDir === 'asc' ? '↑' : '↓') : '↕'}
                            </span>
                          </span>
                        </th>
                      ) : (
                        <th key={label} className={`px-4 py-3 text-${align} font-medium text-neutral-600`}>{label}</th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {campanhasOrdenadas.map(c => (
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
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => { setCampanhaReenvio(c); setShowCampanha(true) }}
                            title="Reenviar campanha"
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:border-brand hover:text-brand transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                            </svg>
                            Reenviar
                          </button>
                          <button
                            onClick={() => { if (window.confirm(`Excluir a campanha "${c.titulo}"?`)) handleDeleteCampanha(c.id) }}
                            disabled={deletandoCampanha === c.id}
                            title="Excluir campanha"
                            className="inline-flex items-center rounded-lg border border-neutral-200 px-2 py-1 text-xs font-medium text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            {deletandoCampanha === c.id ? (
                              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                            ) : (
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            )}
                          </button>
                        </div>
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
          onUpdatePerfil={async (id, dados) => {
            const result = await updatePerfil(id, dados)
            if (result.success) {
              setClienteSelecionado(prev => prev ? { ...prev, ...dados } : null)
            }
            return result
          }}
        />
      )}
      </> }

      {/* Modal Nova Campanha */}
      {showCampanha && (
        <ModalCampanha
          key={campanhaReenvio?.id ?? 'nova'}
          onClose={() => { setShowCampanha(false); setCampanhaReenvio(null) }}
          onSent={() => { setAbaAtiva('campanhas'); carregarCampanhas() }}
          initialData={campanhaReenvio ?? undefined}
        />
      )}
    </div>
  )
}
