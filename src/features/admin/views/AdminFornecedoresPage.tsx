import { useState, useEffect } from 'react'
import { useFornecedoresAdmin } from '../controllers/useFornecedoresAdmin'
import type { Fornecedor, FornecedorInput } from '../controllers/useFornecedoresAdmin'

// =====================================================
// FORMULÁRIO
// =====================================================
const formVazio: FornecedorInput = {
  nome: '', slug: '', url_site: '', cnpj: '', email: '',
  telefone: '', contato: '', endereco: {
    logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: ''
  }, ativo: true,
}

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// =====================================================
// MODAL FORNECEDOR
// =====================================================
interface FornecedorModalProps {
  fornecedor: Fornecedor | null
  onClose: () => void
  onSalvar: (input: FornecedorInput) => Promise<{ success: boolean; error: string | null }>
}

function FornecedorModal({ fornecedor, onClose, onSalvar }: FornecedorModalProps) {
  const [form, setForm] = useState<FornecedorInput>(() => fornecedor
    ? {
        nome: fornecedor.nome,
        slug: fornecedor.slug,
        url_site: fornecedor.url_site ?? '',
        cnpj: fornecedor.cnpj ?? '',
        email: fornecedor.email ?? '',
        telefone: fornecedor.telefone ?? '',
        contato: fornecedor.contato ?? '',
        endereco: fornecedor.endereco ?? formVazio.endereco,
        ativo: fornecedor.ativo,
      }
    : { ...formVazio, endereco: { ...formVazio.endereco } }
  )
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function set(key: keyof FornecedorInput, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }))
  }
  function setEnd(key: string, value: string) {
    setForm(prev => ({ ...prev, endereco: { ...prev.endereco, [key]: value } }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) { setErro('Nome é obrigatório'); return }
    setSaving(true)
    setErro(null)
    const slug = form.slug.trim() || slugify(form.nome)
    const { success, error } = await onSalvar({ ...form, slug })
    setSaving(false)
    if (!success) { setErro(error); return }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-neutral-800">
            {fornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dados principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Nome *</label>
              <input
                value={form.nome}
                onChange={e => { set('nome', e.target.value); if (!fornecedor) set('slug', slugify(e.target.value)) }}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Nome do fornecedor"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Slug (URL)</label>
              <input
                value={form.slug}
                onChange={e => set('slug', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="slug-do-fornecedor"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">CNPJ</label>
              <input
                value={form.cnpj ?? ''}
                onChange={e => set('cnpj', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="00.000.000/0001-00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Nome do Contato</label>
              <input
                value={form.contato ?? ''}
                onChange={e => set('contato', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Responsável comercial"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">E-mail</label>
              <input
                type="email"
                value={form.email ?? ''}
                onChange={e => set('email', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="contato@fornecedor.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Telefone</label>
              <input
                value={form.telefone ?? ''}
                onChange={e => set('telefone', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Site</label>
              <input
                value={form.url_site ?? ''}
                onChange={e => set('url_site', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="https://www.fornecedor.com.br"
              />
            </div>
          </div>

          {/* Endereço */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Endereço</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  value={form.endereco?.logradouro ?? ''}
                  onChange={e => setEnd('logradouro', e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Logradouro"
                />
              </div>
              <div>
                <input
                  value={form.endereco?.numero ?? ''}
                  onChange={e => setEnd('numero', e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Nº"
                />
              </div>
              <div>
                <input
                  value={form.endereco?.complemento ?? ''}
                  onChange={e => setEnd('complemento', e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Complemento"
                />
              </div>
              <div>
                <input
                  value={form.endereco?.bairro ?? ''}
                  onChange={e => setEnd('bairro', e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Bairro"
                />
              </div>
              <div>
                <input
                  value={form.endereco?.cep ?? ''}
                  onChange={e => setEnd('cep', e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="CEP"
                />
              </div>
              <div>
                <input
                  value={form.endereco?.cidade ?? ''}
                  onChange={e => setEnd('cidade', e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Cidade"
                />
              </div>
              <div>
                <input
                  value={form.endereco?.estado ?? ''}
                  onChange={e => setEnd('estado', e.target.value.toUpperCase().slice(0, 2))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Ativo */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.ativo} onChange={e => set('ativo', e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-brand-600" />
            <span className="text-sm text-neutral-700">Fornecedor ativo</span>
          </label>

          {erro && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================
export default function AdminFornecedoresPage() {
  const { fornecedores, isLoading, error, criar, atualizar, alternarAtivo } = useFornecedoresAdmin()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Fornecedor | null>(null)
  const [busca, setBusca] = useState('')
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'erro' } | null>(null)

  function showToast(msg: string, tipo: 'ok' | 'erro') {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  function abrirNovo() { setEditando(null); setModalAberto(true) }
  function abrirEditar(f: Fornecedor) { setEditando(f); setModalAberto(true) }
  function fecharModal() { setModalAberto(false); setEditando(null) }

  async function handleSalvar(input: FornecedorInput) {
    if (editando) {
      const r = await atualizar(editando.id, input)
      if (r.success) showToast('Fornecedor atualizado!', 'ok')
      return r
    }
    const r = await criar(input)
    if (r.success) showToast('Fornecedor criado!', 'ok')
    return r
  }

  async function handleAlternarAtivo(f: Fornecedor) {
    const { success } = await alternarAtivo(f.id, !f.ativo)
    if (success) showToast(f.ativo ? 'Fornecedor desativado' : 'Fornecedor ativado', 'ok')
  }

  const filtrados = fornecedores.filter(f =>
    f.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (f.cnpj ?? '').includes(busca) ||
    (f.email ?? '').toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-800">Fornecedores</h1>
          <p className="text-sm text-neutral-500">{fornecedores.length} cadastrado{fornecedores.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Fornecedor
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, CNPJ ou e-mail..."
          className="w-full rounded-lg border border-neutral-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-neutral-400">Carregando...</div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm">{busca ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}</p>
        </div>
      ) : (
        <>
          {/* Tabela desktop */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <th className="px-4 py-3">Fornecedor</th>
                  <th className="px-4 py-3">CNPJ</th>
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">E-mail / Telefone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtrados.map(f => (
                  <tr key={f.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-800">{f.nome}</p>
                      {f.url_site && (
                        <a href={f.url_site} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">
                          {f.url_site.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{f.cnpj || <span className="text-neutral-300">—</span>}</td>
                    <td className="px-4 py-3 text-neutral-600">{f.contato || <span className="text-neutral-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <p className="text-neutral-600">{f.email || <span className="text-neutral-300">—</span>}</p>
                      <p className="text-xs text-neutral-400">{f.telefone || ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${f.ativo ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {f.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirEditar(f)}
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-brand-600"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleAlternarAtivo(f)}
                          className={`rounded-lg p-1.5 transition-colors ${f.ativo ? 'text-neutral-400 hover:bg-red-50 hover:text-red-600' : 'text-neutral-400 hover:bg-green-50 hover:text-green-600'}`}
                          title={f.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {f.ativo ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

          {/* Cards mobile */}
          <div className="md:hidden space-y-3">
            {filtrados.map(f => (
              <div key={f.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-neutral-800">{f.nome}</p>
                    {f.cnpj && <p className="text-xs text-neutral-500">{f.cnpj}</p>}
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${f.ativo ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                    {f.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {f.contato && <p className="text-sm text-neutral-600 mb-1">{f.contato}</p>}
                {f.email && <p className="text-xs text-neutral-500">{f.email}</p>}
                {f.telefone && <p className="text-xs text-neutral-500">{f.telefone}</p>}
                <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-100">
                  <button onClick={() => abrirEditar(f)} className="flex-1 rounded-lg border border-neutral-300 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
                    Editar
                  </button>
                  <button onClick={() => handleAlternarAtivo(f)} className={`flex-1 rounded-lg py-1.5 text-xs font-medium ${f.ativo ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'border border-green-200 text-green-600 hover:bg-green-50'}`}>
                    {f.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {modalAberto && (
        <FornecedorModal
          key={editando?.id ?? 'novo'}
          fornecedor={editando}
          onClose={fecharModal}
          onSalvar={handleSalvar}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${toast.tipo === 'ok' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
