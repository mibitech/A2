import { useState } from 'react'
import { useFinanceiroAdmin } from '../controllers/useFinanceiroAdmin'
import type { LancamentoCaixa, TipoLancamento, CategoriaCaixa, TipoCategoria } from '../controllers/useFinanceiroAdmin'
import { useAuthContext } from '@features/auth/contexts/AuthContext'
import Pagination from '@components/ui/Pagination'

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtData = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

const TIPO_LABEL: Record<TipoCategoria, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  ambos: 'Ambos',
}

// =====================================================
// MODAL NOVO LANÇAMENTO
// =====================================================
interface NovoLancamentoModalProps {
  categoriasPorTipo: (tipo: TipoLancamento) => CategoriaCaixa[]
  usuarioId?: string
  onClose: () => void
  onSalvar: (payload: {
    tipo: TipoLancamento
    categoria: string
    descricao: string
    valor: number
    dataRef: string
    observacoes?: string
    criadoPor?: string
  }) => Promise<{ success: boolean; error?: string }>
}

function NovoLancamentoModal({ categoriasPorTipo, usuarioId, onClose, onSalvar }: NovoLancamentoModalProps) {
  const [tipo, setTipo] = useState<TipoLancamento>('entrada')
  const cats = categoriasPorTipo(tipo)
  const [categoria, setCategoria] = useState(cats[0]?.nome ?? '')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [dataRef, setDataRef] = useState(new Date().toISOString().slice(0, 10))
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function handleTipo(t: TipoLancamento) {
    setTipo(t)
    const novasCats = categoriasPorTipo(t)
    setCategoria(novasCats[0]?.nome ?? '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = parseFloat(valor.replace(',', '.'))
    if (!descricao.trim()) { setErro('Informe a descrição'); return }
    if (isNaN(v) || v <= 0) { setErro('Valor inválido'); return }
    if (!categoria) { setErro('Selecione uma categoria'); return }

    setSalvando(true)
    setErro(null)
    const result = await onSalvar({
      tipo, categoria, descricao: descricao.trim(), valor: v, dataRef,
      observacoes: observacoes.trim() || undefined,
      criadoPor: usuarioId,
    })
    setSalvando(false)
    if (result.success) onClose()
    else setErro(result.error ?? 'Erro ao salvar')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="font-semibold text-neutral-800">Novo Lançamento</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo */}
          <div className="grid grid-cols-2 gap-2">
            {(['entrada', 'saida'] as TipoLancamento[]).map(t => (
              <button key={t} type="button" onClick={() => handleTipo(t)}
                className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                  tipo === t
                    ? t === 'entrada' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-400 bg-red-50 text-red-700'
                    : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                }`}>
                {t === 'entrada' ? '+ Entrada' : '− Saída'}
              </button>
            ))}
          </div>

          {/* Categoria */}
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Categoria</label>
            {cats.length === 0 ? (
              <p className="text-xs text-orange-600">Nenhuma categoria ativa para este tipo. Cadastre uma na aba Categorias.</p>
            ) : (
              <select value={categoria} onChange={e => setCategoria(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand capitalize">
                {cats.map(c => (
                  <option key={c.id} value={c.nome}>{c.nome.charAt(0).toUpperCase() + c.nome.slice(1)}</option>
                ))}
              </select>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Descrição *</label>
            <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)}
              placeholder="Ex: Venda pedido #001"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Valor (R$) *</label>
              <input type="text" inputMode="decimal" value={valor} onChange={e => setValor(e.target.value)}
                placeholder="0,00"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Data</label>
              <input type="date" value={dataRef} onChange={e => setDataRef(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Observações</label>
            <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={2}
              placeholder="Opcional..."
              className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>

          {erro && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</div>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-neutral-300 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
              Cancelar
            </button>
            <button type="submit" disabled={salvando || cats.length === 0}
              className="flex-1 rounded-lg bg-brand py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// =====================================================
// ABA CATEGORIAS
// =====================================================
interface AbaCategoriesProps {
  categorias: CategoriaCaixa[]
  isLoading: boolean
  onCriar: (p: { nome: string; tipo: TipoCategoria }) => Promise<{ success: boolean; error?: string }>
  onToggle: (id: string, ativo: boolean) => Promise<{ success: boolean; error?: string }>
  onExcluir: (id: string) => Promise<{ success: boolean; error?: string }>
}

function AbaCategorias({ categorias, isLoading, onCriar, onToggle, onExcluir }: AbaCategoriesProps) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<TipoCategoria>('entrada')
  const [salvando, setSalvando] = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)

  function mostrarFeedback(msg: string, ok: boolean) {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 3500)
  }

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    setSalvando(true)
    const result = await onCriar({ nome, tipo })
    setSalvando(false)
    if (result.success) {
      setNome('')
      mostrarFeedback('Categoria criada!', true)
    } else {
      mostrarFeedback(result.error ?? 'Erro', false)
    }
  }

  async function handleToggle(c: CategoriaCaixa) {
    const result = await onToggle(c.id, !c.ativo)
    if (!result.success) mostrarFeedback(result.error ?? 'Erro', false)
  }

  async function handleExcluir(c: CategoriaCaixa) {
    if (!confirm(`Excluir categoria "${c.nome}"? Esta ação não pode ser desfeita.`)) return
    const result = await onExcluir(c.id)
    if (!result.success) mostrarFeedback(result.error ?? 'Erro ao excluir', false)
  }

  const grupos: TipoCategoria[] = ['entrada', 'saida', 'ambos']

  return (
    <div className="space-y-6">
      {/* Formulário de nova categoria */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Nova Categoria</h3>
        <form onSubmit={handleCriar} className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome da categoria..."
            className="flex-1 min-w-[180px] rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value as TipoCategoria)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
            <option value="ambos">Ambos</option>
          </select>
          <button
            type="submit"
            disabled={salvando || !nome.trim()}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>
        {feedback && (
          <p className={`mt-2 text-xs ${feedback.ok ? 'text-green-700' : 'text-red-700'}`}>{feedback.msg}</p>
        )}
      </div>

      {/* Lista por grupo */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
        </div>
      ) : (
        grupos.map(grupo => {
          const lista = categorias.filter(c => c.tipo === grupo)
          if (lista.length === 0) return null
          return (
            <div key={grupo}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {TIPO_LABEL[grupo]}
              </h4>
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-neutral-100">
                    {lista.map(c => (
                      <tr key={c.id} className={`${!c.ativo ? 'opacity-50' : ''} transition-opacity`}>
                        <td className="px-4 py-3">
                          <span className="font-medium text-neutral-800 capitalize">{c.nome}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            grupo === 'entrada' ? 'bg-green-100 text-green-700'
                            : grupo === 'saida' ? 'bg-red-100 text-red-700'
                            : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {TIPO_LABEL[grupo]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.ativo ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-400'
                          }`}>
                            {c.ativo ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggle(c)}
                              className="text-xs text-neutral-400 hover:text-brand transition-colors"
                              title={c.ativo ? 'Desativar' : 'Ativar'}
                            >
                              {c.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              onClick={() => handleExcluir(c)}
                              className="rounded p-1 text-neutral-300 hover:text-red-500 transition-colors"
                              aria-label="Excluir"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================
export default function AdminFinanceiroPage() {
  const { user } = useAuthContext()
  const {
    lancamentos, categorias, isLoading, isLoadingCategorias, error, resumo,
    filtroTipo, setFiltroTipo, categoriasPorTipo,
    reloadLancamentos, criar, excluir,
    criarCategoria, toggleCategoria, excluirCategoria,
  } = useFinanceiroAdmin()

  const [aba, setAba] = useState<'lancamentos' | 'categorias'>('lancamentos')
  const [modalAberto, setModalAberto] = useState(false)
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const [feedbackExcluir, setFeedbackExcluir] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  async function handleExcluir(l: LancamentoCaixa) {
    if (!confirm(`Excluir "${l.descricao}"?`)) return
    setExcluindo(l.id)
    const result = await excluir(l.id)
    setExcluindo(null)
    if (!result.success) {
      setFeedbackExcluir('Erro ao excluir: ' + result.error)
      setTimeout(() => setFeedbackExcluir(null), 4000)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Financeiro</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Fluxo de caixa manual — entradas e saídas</p>
        </div>
        {aba === 'lancamentos' && (
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Lançamento
          </button>
        )}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs text-green-600 font-medium">Total Entradas</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{fmtBRL(resumo.totalEntradas)}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs text-red-600 font-medium">Total Saídas</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{fmtBRL(resumo.totalSaidas)}</p>
        </div>
        <div className={`rounded-xl border p-4 ${resumo.saldo >= 0 ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'}`}>
          <p className={`text-xs font-medium ${resumo.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Saldo</p>
          <p className={`mt-1 text-2xl font-bold ${resumo.saldo >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {fmtBRL(resumo.saldo)}
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex border-b border-neutral-200 mb-5">
        {([['lancamentos', 'Lançamentos'], ['categorias', 'Categorias']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              aba === id
                ? 'border-b-2 border-brand text-brand'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {label}
            {id === 'categorias' && (
              <span className="ml-1.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
                {categorias.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo: Lançamentos */}
      {aba === 'lancamentos' && (
        <>
          {/* Filtros */}
          <div className="flex gap-2 mb-4">
            {(['todos', 'entrada', 'saida'] as const).map(f => (
              <button key={f} onClick={() => { setFiltroTipo(f); setPage(1) }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filtroTipo === f
                    ? 'border-brand bg-brand text-white'
                    : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                }`}>
                {f === 'todos' ? 'Todos' : f === 'entrada' ? 'Entradas' : 'Saídas'}
              </button>
            ))}
            <button onClick={reloadLancamentos}
              className="ml-auto rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {feedbackExcluir && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{feedbackExcluir}</div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : lancamentos.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-neutral-200 p-12 text-center">
              <svg className="mx-auto h-10 w-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-3 text-sm text-neutral-400">Nenhum lançamento encontrado</p>
              <button onClick={() => setModalAberto(true)} className="mt-3 text-sm text-brand hover:underline">
                Criar primeiro lançamento
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Data</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Descrição</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600">Categoria</th>
                    <th className="px-4 py-3 text-center font-medium text-neutral-600">Tipo</th>
                    <th className="px-4 py-3 text-right font-medium text-neutral-600">Valor</th>
                    <th className="px-4 py-3 text-right font-medium text-neutral-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {lancamentos.slice((page - 1) * pageSize, page * pageSize).map(l => (
                    <tr key={l.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">{fmtData(l.dataRef)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-800">{l.descricao}</p>
                        {l.observacoes && <p className="text-xs text-neutral-400">{l.observacoes}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500 capitalize">{l.categoria}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          l.tipo === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {l.tipo === 'entrada' ? '+ Entrada' : '− Saída'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${
                        l.tipo === 'entrada' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {l.tipo === 'saida' ? '−' : '+'} {fmtBRL(l.valor)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleExcluir(l)} disabled={excluindo === l.id}
                          className="rounded p-1 text-neutral-300 hover:text-red-500 disabled:opacity-50 transition-colors"
                          aria-label="Excluir">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                total={lancamentos.length}
                page={page}
                pageSize={pageSize}
                onPage={setPage}
                onPageSize={s => { setPageSize(s); setPage(1) }}
              />
            </div>
          )}
        </>
      )}

      {/* Conteúdo: Categorias */}
      {aba === 'categorias' && (
        <AbaCategorias
          categorias={categorias}
          isLoading={isLoadingCategorias}
          onCriar={criarCategoria}
          onToggle={toggleCategoria}
          onExcluir={excluirCategoria}
        />
      )}

      {/* Modal novo lançamento */}
      {modalAberto && (
        <NovoLancamentoModal
          categoriasPorTipo={categoriasPorTipo}
          usuarioId={user?.id}
          onClose={() => setModalAberto(false)}
          onSalvar={criar}
        />
      )}
    </div>
  )
}
