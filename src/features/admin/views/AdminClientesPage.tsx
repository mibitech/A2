import { useState } from 'react'
import { useClientesAdmin } from '../controllers/useClientesAdmin'
import type { ClienteAdmin, PedidoResumo } from '../controllers/useClientesAdmin'

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
}

function PerfilModal({ cliente, onClose, getPedidos, onUpdateRole }: PerfilModalProps) {
  const [pedidos, setPedidos] = useState<PedidoResumo[] | null>(null)
  const [loadingPedidos, setLoadingPedidos] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'info' | 'pedidos'>('info')
  const [editandoRole, setEditandoRole] = useState(false)
  const [novoRole, setNovoRole] = useState(cliente.role)
  const [salvandoRole, setSalvandoRole] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

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
// PÁGINA PRINCIPAL
// =====================================================
export default function AdminClientesPage() {
  const { clientes, isLoading, error, reload, getPedidos, updateRole } = useClientesAdmin()

  const [busca, setBusca] = useState('')
  const [filtroRole, setFiltroRole] = useState<'todos' | 'cliente' | 'funcionario' | 'admin'>('todos')
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteAdmin | null>(null)

  const clientesFiltrados = clientes.filter(c => {
    const matchBusca = !busca ||
      c.email.toLowerCase().includes(busca.toLowerCase()) ||
      (c.nomeCompleto ?? '').toLowerCase().includes(busca.toLowerCase())
    const matchRole = filtroRole === 'todos' || c.role === filtroRole
    return matchBusca && matchRole
  })

  const totalClientes = clientes.filter(c => c.role === 'cliente').length
  const totalFuncionarios = clientes.filter(c => c.role === 'funcionario').length
  const totalAdmins = clientes.filter(c => c.role === 'admin').length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Clientes</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {clientes.length} usuários · {totalClientes} clientes · {totalFuncionarios} funcionários · {totalAdmins} admins
          </p>
        </div>
        <button onClick={reload} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <select
          value={filtroRole}
          onChange={e => setFiltroRole(e.target.value as typeof filtroRole)}
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
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Usuário</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Contato</th>
                <th className="px-4 py-3 text-center font-medium text-neutral-600">Tipo</th>
                <th className="px-4 py-3 text-center font-medium text-neutral-600">Acesso</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600">Cadastro</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {clientesFiltrados.map(c => (
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
        />
      )}
    </div>
  )
}
