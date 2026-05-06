import { useState } from 'react'
import { useProdutosAdmin } from '../controllers/useProdutosAdmin'
import type { ProdutoAdmin } from '../controllers/useProdutosAdmin'
import Pagination from '@components/ui/Pagination'

const FORNECEDOR_FITACABO = '00000000-0000-0000-0000-000000000001'

// =====================================================
// FORMULÃRIO DE PRODUTO
// =====================================================
interface ProdutoFormData {
  nome: string
  slug: string
  descricao: string
  preco: string
  precoPromocional: string
  estoque: string
  categoria: string
  subcategoria: string
  sku: string
  peso: string
  ativo: boolean
  destaque: boolean
}

const formVazio: ProdutoFormData = {
  nome: '',
  slug: '',
  descricao: '',
  preco: '',
  precoPromocional: '',
  estoque: '0',
  categoria: '',
  subcategoria: '',
  sku: '',
  peso: '',
  ativo: true,
  destaque: false,
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// =====================================================
// MODAL DE AJUSTE DE ESTOQUE
// =====================================================
interface AjusteModalProps {
  produto: ProdutoAdmin
  onClose: () => void
  onAjustar: (tipo: 'entrada' | 'saida' | 'ajuste', qtd: number, motivo: string) => Promise<void>
}

function AjusteModal({ produto, onClose, onAjustar }: AjusteModalProps) {
  const [tipo, setTipo] = useState<'entrada' | 'saida' | 'ajuste'>('entrada')
  const [quantidade, setQuantidade] = useState('1')
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const qtd = parseInt(quantidade)
    if (!qtd || qtd <= 0) return
    setSaving(true)
    await onAjustar(tipo, qtd, motivo)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-bold text-neutral-800">Ajustar Estoque</h2>
        <p className="mb-4 text-sm text-neutral-500">{produto.nome} â€” atual: <strong>{produto.estoque}</strong> un.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Tipo</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as typeof tipo)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="entrada">Entrada (adicionar)</option>
              <option value="saida">SaÃ­da (remover)</option>
              <option value="ajuste">Ajuste manual</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Quantidade</label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={e => setQuantidade(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Motivo (opcional)</label>
            <input
              type="text"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="ex: Compra fornecedor, Venda manual..."
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors disabled:opacity-50">
              {saving ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// =====================================================
// MODAL DE HISTÃ“RICO
// =====================================================
interface HistoricoModalProps {
  produto: ProdutoAdmin
  onClose: () => void
  getMovimentacoes: (id: string) => Promise<{ movimentacoes: import('../controllers/useProdutosAdmin').MovimentacaoEstoque[]; error: string | null }>
}

function HistoricoModal({ produto, onClose, getMovimentacoes }: HistoricoModalProps) {
  const [movs, setMovs] = useState<import('../controllers/useProdutosAdmin').MovimentacaoEstoque[]>([])
  const [loading, setLoading] = useState(true)

  useState(() => {
    getMovimentacoes(produto.id).then(({ movimentacoes }) => {
      setMovs(movimentacoes)
      setLoading(false)
    })
  })

  const tipoLabel = { entrada: 'Entrada', saida: 'SaÃ­da', ajuste: 'Ajuste' }
  const tipoColor = { entrada: 'text-green-600', saida: 'text-red-600', ajuste: 'text-blue-600' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-800">HistÃ³rico de Estoque</h2>
            <p className="text-sm text-neutral-500">{produto.nome}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-6">
          {loading ? (
            <p className="text-center text-sm text-neutral-400">Carregando...</p>
          ) : movs.length === 0 ? (
            <p className="text-center text-sm text-neutral-400">Nenhuma movimentaÃ§Ã£o registrada</p>
          ) : (
            <div className="space-y-3">
              {movs.map(m => (
                <div key={m.id} className="flex items-start justify-between rounded-lg border border-neutral-100 p-3">
                  <div>
                    <span className={`text-xs font-semibold uppercase ${tipoColor[m.tipo]}`}>
                      {tipoLabel[m.tipo]}
                    </span>
                    <p className="mt-0.5 text-sm text-neutral-700">
                      {m.estoqueAnterior} â†’ {m.estoquePosterior} un.
                      <span className="ml-2 font-medium">
                        ({m.tipo === 'saida' ? '-' : '+'}{m.quantidade})
                      </span>
                    </p>
                    {m.motivo && <p className="mt-0.5 text-xs text-neutral-400">{m.motivo}</p>}
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(m.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =====================================================
// MODAL DE FORMULÃRIO (CREATE / EDIT)
// =====================================================
interface FormModalProps {
  produto: ProdutoAdmin | null
  onClose: () => void
  onCreate: (data: ProdutoFormData) => Promise<{ success: boolean; produto?: ProdutoAdmin | null; error?: string }>
  onUpdate: (id: string, data: ProdutoFormData) => Promise<{ success: boolean; error?: string }>
  uploadImagem: (file: File, produtoId: string) => Promise<{ url: string | null; error: string | null }>
}

function FormModal({ produto, onClose, onCreate, onUpdate, uploadImagem }: FormModalProps) {
  const isEdit = !!produto
  const [form, setForm] = useState<ProdutoFormData>(
    produto
      ? {
          nome: produto.nome,
          slug: produto.slug,
          descricao: produto.descricao ?? '',
          preco: produto.preco.toString(),
          precoPromocional: produto.precoPromocional?.toString() ?? '',
          estoque: produto.estoque.toString(),
          categoria: produto.categoria,
          subcategoria: produto.subcategoria ?? '',
          sku: produto.sku ?? '',
          peso: produto.peso?.toString() ?? '',
          ativo: produto.ativo,
          destaque: produto.destaque,
        }
      : formVazio
  )
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [imagensTemp, setImagensTemp] = useState<string[]>(produto?.imagens ?? [])
  const [produtoIdTemp] = useState(produto?.id ?? crypto.randomUUID())

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'nome' && !isEdit ? { slug: slugify(value) } : {}),
    }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    const { url, error } = await uploadImagem(file, produtoIdTemp)
    setUploadingImg(false)
    if (error || !url) { setFormError('Erro ao fazer upload: ' + error); return }
    setImagensTemp(prev => [...prev, url])
  }

  function handleRemoveImagem(url: string) {
    setImagensTemp(prev => prev.filter(u => u !== url))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSaving(true)

    const payload = {
      fornecedor_id: FORNECEDOR_FITACABO,
      nome: form.nome.trim(),
      slug: form.slug.trim(),
      descricao: form.descricao.trim() || null,
      preco: parseFloat(form.preco),
      preco_promocional: form.precoPromocional ? parseFloat(form.precoPromocional) : null,
      estoque: parseInt(form.estoque) || 0,
      imagens: imagensTemp,
      categoria: form.categoria.trim(),
      subcategoria: form.subcategoria.trim() || null,
      sku: form.sku.trim() || null,
      peso: form.peso ? parseFloat(form.peso) : null,
      ativo: form.ativo,
      destaque: form.destaque,
    }

    const result = isEdit
      ? await onUpdate(produto!.id, payload as unknown as ProdutoFormData)
      : await onCreate(payload as unknown as ProdutoFormData)

    setSaving(false)

    if (!result.success) {
      setFormError(result.error ?? 'Erro ao salvar')
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-bold text-neutral-800">
            {isEdit ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700">Nome *</label>
              <input name="nome" value={form.nome} onChange={handleChange} required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700">Slug *</label>
              <input name="slug" value={form.slug} onChange={handleChange} required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700">DescriÃ§Ã£o</label>
              <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">PreÃ§o (R$) *</label>
              <input name="preco" type="number" step="0.01" min="0" value={form.preco} onChange={handleChange} required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">PreÃ§o Promocional (R$)</label>
              <input name="precoPromocional" type="number" step="0.01" min="0" value={form.precoPromocional} onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Estoque</label>
              <input name="estoque" type="number" min="0" value={form.estoque} onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">SKU</label>
              <input name="sku" value={form.sku} onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Categoria *</label>
              <input name="categoria" value={form.categoria} onChange={handleChange} required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Subcategoria</label>
              <input name="subcategoria" value={form.subcategoria} onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Peso (kg)</label>
              <input name="peso" type="number" step="0.01" min="0" value={form.peso} onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange}
                  className="h-4 w-4 rounded border-neutral-300 text-brand focus:ring-brand" />
                Ativo (visÃ­vel no site)
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                <input type="checkbox" name="destaque" checked={form.destaque} onChange={handleChange}
                  className="h-4 w-4 rounded border-neutral-300 text-brand focus:ring-brand" />
                Destaque
              </label>
            </div>
          </div>

          {/* Upload de Imagens */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">Imagens</label>
            <div className="flex flex-wrap gap-3">
              {imagensTemp.map(url => (
                <div key={url} className="relative h-20 w-20 rounded-lg overflow-hidden border border-neutral-200">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => handleRemoveImagem(url)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <label className={`flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-neutral-400 hover:border-brand hover:text-brand transition-colors ${uploadingImg ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploadingImg ? (
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="mt-1 text-xs">Adicionar</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
              </label>
            </div>
          </div>

          <div className="flex gap-3 border-t border-neutral-200 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors disabled:opacity-50">
              {saving ? 'Salvando...' : isEdit ? 'Salvar alteraÃ§Ãµes' : 'Criar produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// =====================================================
// CABEÃ‡ALHO ORDENÃVEL
// =====================================================
type SortDir = 'asc' | 'desc'
type SortKeyEstoque = 'nome' | 'categoria' | 'preco' | 'estoque'

function ThSort({ label, col, current, dir, onSort, align = 'left' }: {
  label: string; col: SortKeyEstoque; current: SortKeyEstoque
  dir: SortDir; onSort: (c: SortKeyEstoque) => void; align?: 'left' | 'right' | 'center'
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
          {active ? (dir === 'asc' ? 'â†‘' : 'â†“') : 'â†•'}
        </span>
      </span>
    </th>
  )
}

// =====================================================
// PÃGINA PRINCIPAL
// =====================================================
export default function AdminEstoquePage() {
  const { produtos, isLoading, error, reload, create, update, remove, uploadImagem, ajustarEstoque, getMovimentacoes } = useProdutosAdmin()

  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos')
  const [sortKey, setSortKey] = useState<SortKeyEstoque>('nome')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  function toggleSort(col: SortKeyEstoque) {
    if (sortKey === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(col); setSortDir('asc') }
    setPage(1)
  }
  const [modalForm, setModalForm] = useState<{ aberto: boolean; produto: ProdutoAdmin | null }>({ aberto: false, produto: null })
  const [modalAjuste, setModalAjuste] = useState<ProdutoAdmin | null>(null)
  const [modalHistorico, setModalHistorico] = useState<ProdutoAdmin | null>(null)
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; mensagem: string } | null>(null)

  function showFeedback(tipo: 'sucesso' | 'erro', mensagem: string) {
    setFeedback({ tipo, mensagem })
    setTimeout(() => setFeedback(null), 4000)
  }

  const produtosFiltrados = produtos
    .filter(p => {
      const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || (p.sku ?? '').toLowerCase().includes(busca.toLowerCase())
      const matchStatus = filtroStatus === 'todos' || (filtroStatus === 'ativo' ? p.ativo : !p.ativo)
      return matchBusca && matchStatus
    })
    .sort((a, b) => {
      const m = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'nome') return m * a.nome.localeCompare(b.nome, 'pt-BR')
      if (sortKey === 'categoria') return m * a.categoria.localeCompare(b.categoria, 'pt-BR')
      if (sortKey === 'preco') return m * (a.preco - b.preco)
      if (sortKey === 'estoque') return m * (a.estoque - b.estoque)
      return 0
    })

  const produtosPaginados = produtosFiltrados.slice((page - 1) * pageSize, page * pageSize)

  async function handleCreate(data: ProdutoFormData) {
    const payload = data as unknown as Parameters<typeof create>[0]
    const result = await create(payload)
    if (result.success) showFeedback('sucesso', 'Produto criado com sucesso!')
    else showFeedback('erro', result.error ?? 'Erro ao criar produto')
    return result
  }

  async function handleUpdate(id: string, data: ProdutoFormData) {
    const payload = data as unknown as Parameters<typeof update>[1]
    const result = await update(id, payload)
    if (result.success) showFeedback('sucesso', 'Produto atualizado!')
    else showFeedback('erro', result.error ?? 'Erro ao atualizar')
    return result
  }

  async function handleRemove(produto: ProdutoAdmin) {
    if (!confirm(`Desativar "${produto.nome}"?`)) return
    const result = await remove(produto.id)
    if (result.success) showFeedback('sucesso', 'Produto desativado')
    else showFeedback('erro', result.error ?? 'Erro ao desativar')
  }

  async function handleAjuste(tipo: 'entrada' | 'saida' | 'ajuste', qtd: number, motivo: string) {
    if (!modalAjuste) return
    const result = await ajustarEstoque(modalAjuste, tipo, qtd, motivo)
    if (result.success) showFeedback('sucesso', 'Estoque ajustado!')
    else showFeedback('erro', result.error ?? 'Erro ao ajustar estoque')
  }

  const ativos = produtos.filter(p => p.ativo).length
  const inativos = produtos.filter(p => !p.ativo).length
  const baixoEstoque = produtos.filter(p => p.ativo && p.estoque <= 5).length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">GestÃ£o de Estoque</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {produtos.length} produtos Â· {ativos} ativos Â· {inativos} inativos
            {baixoEstoque > 0 && <span className="ml-2 text-amber-600 font-medium">Â· {baixoEstoque} com estoque baixo (&le;5)</span>}
          </p>
        </div>
        <button
          onClick={() => setModalForm({ aberto: true, produto: null })}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Produto
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${feedback.tipo === 'sucesso' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {feedback.mensagem}
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou SKU..."
          value={busca}
          onChange={e => { setBusca(e.target.value); setPage(1) }}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <select
          value={filtroStatus}
          onChange={e => { setFiltroStatus(e.target.value as typeof filtroStatus); setPage(1) }}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="todos">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
        <button onClick={() => reload()} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-neutral-200 p-12 text-center">
          <p className="text-sm text-neutral-400">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <ThSort label="Produto" col="nome" current={sortKey} dir={sortDir} onSort={toggleSort} align="left" />
                <ThSort label="Categoria" col="categoria" current={sortKey} dir={sortDir} onSort={toggleSort} align="left" />
                <ThSort label="PreÃ§o" col="preco" current={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                <ThSort label="Estoque" col="estoque" current={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                <th className="px-4 py-3 text-center font-medium text-neutral-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600">AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {produtosPaginados.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imagens[0] ? (
                        <img src={p.imagens[0]} alt={p.nome} className="h-10 w-10 rounded-lg object-cover border border-neutral-200" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-neutral-800">{p.nome}</p>
                        {p.sku && <p className="text-xs text-neutral-400">SKU: {p.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{p.categoria}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-medium text-neutral-800">
                      {p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    {p.precoPromocional && (
                      <p className="text-xs text-green-600">
                        {p.precoPromocional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${p.estoque <= 5 ? 'text-amber-600' : 'text-neutral-800'}`}>
                      {p.estoque}
                    </span>
                    <span className="text-neutral-400"> un.</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.ativo ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    {p.destaque && (
                      <span className="ml-1 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                        Destaque
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setModalHistorico(p)}
                        title="HistÃ³rico de estoque"
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setModalAjuste(p)}
                        title="Ajustar estoque"
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setModalForm({ aberto: true, produto: p })}
                        title="Editar"
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {p.ativo && (
                        <button
                          onClick={() => handleRemove(p)}
                          title="Desativar"
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            total={produtosFiltrados.length}
            page={page}
            pageSize={pageSize}
            onPage={setPage}
            onPageSize={s => { setPageSize(s); setPage(1) }}
          />
        </div>
      )}

      {/* Modais */}
      {modalForm.aberto && (
        <FormModal
          produto={modalForm.produto}
          onClose={() => setModalForm({ aberto: false, produto: null })}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          uploadImagem={uploadImagem}
        />
      )}
      {modalAjuste && (
        <AjusteModal
          produto={modalAjuste}
          onClose={() => setModalAjuste(null)}
          onAjustar={handleAjuste}
        />
      )}
      {modalHistorico && (
        <HistoricoModal
          produto={modalHistorico}
          onClose={() => setModalHistorico(null)}
          getMovimentacoes={getMovimentacoes}
        />
      )}
    </div>
  )
}
