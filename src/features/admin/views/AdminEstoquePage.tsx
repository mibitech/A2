import { useState, useEffect } from 'react'
import { useProdutosAdmin } from '../controllers/useProdutosAdmin'
import type { ProdutoAdmin } from '../controllers/useProdutosAdmin'
import { useLotesAdmin } from '../controllers/useLotesAdmin'
import { useFornecedoresAdmin } from '../controllers/useFornecedoresAdmin'
import type { Fornecedor } from '../controllers/useFornecedoresAdmin'
import Pagination from '@components/ui/Pagination'

// =====================================================
// FORMULÁRIO DE PRODUTO
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
  fornecedor_id: string
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
  fornecedor_id: '',
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
        <p className="mb-4 text-sm text-neutral-500">{produto.nome} — atual: <strong>{produto.estoque}</strong> un.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Tipo</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as typeof tipo)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="entrada">Entrada (adicionar)</option>
              <option value="saida">Saída (remover)</option>
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
// MODAL DE HISTÓRICO
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

  const tipoLabel = { entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste' }
  const tipoColor = { entrada: 'text-green-600', saida: 'text-red-600', ajuste: 'text-blue-600' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-800">Histórico de Estoque</h2>
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
            <p className="text-center text-sm text-neutral-400">Nenhuma movimentação registrada</p>
          ) : (
            <div className="space-y-3">
              {movs.map(m => (
                <div key={m.id} className="flex items-start justify-between rounded-lg border border-neutral-100 p-3">
                  <div>
                    <span className={`text-xs font-semibold uppercase ${tipoColor[m.tipo]}`}>
                      {tipoLabel[m.tipo]}
                    </span>
                    <p className="mt-0.5 text-sm text-neutral-700">
                      {m.estoqueAnterior} → {m.estoquePosterior} un.
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
// MODAL DE FORMULÁRIO (CREATE / EDIT)
// =====================================================
interface FormModalProps {
  produto: ProdutoAdmin | null
  fornecedores: Fornecedor[]
  onClose: () => void
  onCreate: (data: ProdutoFormData) => Promise<{ success: boolean; produto?: ProdutoAdmin | null; error?: string }>
  onUpdate: (id: string, data: ProdutoFormData) => Promise<{ success: boolean; error?: string }>
  uploadImagem: (file: File, produtoId: string) => Promise<{ url: string | null; error: string | null }>
}

function FormModal({ produto, fornecedores, onClose, onCreate, onUpdate, uploadImagem }: FormModalProps) {
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
          fornecedor_id: (produto as any).fornecedor_id ?? '',
        }
      : { ...formVazio }
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
      fornecedor_id: form.fornecedor_id || null,
      nome: form.nome.trim(),
      slug: form.slug.trim(),
      descricao: form.descricao.trim() || null,
      preco: parseFloat(form.preco),
      preco_promocional: form.precoPromocional ? parseFloat(form.precoPromocional) : null,
      // estoque só é enviado na criação; edição usa lotes/ajuste manual
      ...(!isEdit ? { estoque: 0 } : {}),
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
              <label className="mb-1 block text-sm font-medium text-neutral-700">Descrição</label>
              <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Preço (R$) *</label>
              <input name="preco" type="number" step="0.01" min="0" value={form.preco} onChange={handleChange} required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Preço Promocional (R$)</label>
              <input name="precoPromocional" type="number" step="0.01" min="0" value={form.precoPromocional} onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Estoque</label>
              {isEdit ? (
                <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <span className="text-sm font-semibold text-neutral-800">{form.estoque} un.</span>
                  <span className="text-xs text-neutral-400">— gerenciado por lotes e ajuste manual</span>
                </div>
              ) : (
                <input name="estoque" type="number" min="0" value={form.estoque} onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
              )}
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

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Fornecedor</label>
              <select name="fornecedor_id" value={form.fornecedor_id} onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
                <option value="">Nenhum</option>
                {fornecedores.filter(f => f.ativo).map(f => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange}
                  className="h-4 w-4 rounded border-neutral-300 text-brand focus:ring-brand" />
                Ativo (visível no site)
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
              {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// =====================================================
// MODAL DE LOTES
// =====================================================
interface LotesModalProps {
  produto: ProdutoAdmin
  fornecedores: Fornecedor[]
  onClose: () => void
  onEstoqueChanged: () => void
}

function LotesModal({ produto, fornecedores, onClose, onEstoqueChanged }: LotesModalProps) {
  const { loteAtivo, lotesAguardando, lotesEncerrados, isLoading, carregar, criar, ativar, encerrar, atualizar } = useLotesAdmin(produto.id)
  const [novoForm, setNovoForm] = useState({ fornecedor_id: '', numero_lote: '', quantidade_inicial: '', observacoes: '' })
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ numero_lote: '', fornecedor_id: '', observacoes: '' })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [mostrarNovo, setMostrarNovo] = useState(false)

  useEffect(() => { carregar() }, [carregar])

  const nomeFornecedor = (id: string) => fornecedores.find(f => f.id === id)?.nome ?? '—'

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault()
    if (!novoForm.fornecedor_id || !novoForm.numero_lote || !novoForm.quantidade_inicial) {
      setErro('Preencha fornecedor, número do lote e quantidade'); return
    }
    setSalvando(true); setErro(null)
    const qtd = parseInt(novoForm.quantidade_inicial)
    const { success, error } = await criar({
      produto_id: produto.id,
      fornecedor_id: novoForm.fornecedor_id,
      numero_lote: novoForm.numero_lote.trim(),
      quantidade_inicial: qtd,
      estoque_atual: qtd,
      observacoes: novoForm.observacoes.trim() || undefined,
    })
    setSalvando(false)
    if (!success) { setErro(error); return }
    setMostrarNovo(false)
    setNovoForm({ fornecedor_id: '', numero_lote: '', quantidade_inicial: '', observacoes: '' })
    onEstoqueChanged()
  }

  async function handleEditar(e: React.FormEvent) {
    e.preventDefault()
    if (!editandoId) return
    setSalvando(true); setErro(null)
    const { success, error } = await atualizar(editandoId, {
      numero_lote: editForm.numero_lote,
      fornecedor_id: editForm.fornecedor_id,
      observacoes: editForm.observacoes || undefined,
    })
    setSalvando(false)
    if (!success) { setErro(error); return }
    setEditandoId(null)
  }

  function iniciarEdicao(lote: { id: string; numero_lote: string; fornecedor_id: string; observacoes: string | null }) {
    setEditandoId(lote.id)
    setEditForm({ numero_lote: lote.numero_lote, fornecedor_id: lote.fornecedor_id, observacoes: lote.observacoes ?? '' })
    setErro(null)
  }

  async function handleAtivar(id: string) {
    setSalvando(true); setErro(null)
    const { success, error } = await ativar(id)
    setSalvando(false)
    if (!success) { setErro(error); return }
    onEstoqueChanged()
  }

  async function handleEncerrar(id: string) {
    if (!confirm('Encerrar este lote manualmente?')) return
    setSalvando(true); setErro(null)
    const { success, error } = await encerrar(id)
    setSalvando(false)
    if (!success) { setErro(error); return }
    onEstoqueChanged()
  }

  const inputCls = 'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-800">Lotes de Estoque</h2>
            <p className="text-sm text-neutral-500">{produto.nome}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-sm text-neutral-400 py-4">Carregando...</p>
          ) : (
            <>
              {erro && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}

              {/* ---- LOTE ATIVO ---- */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Lote Ativo</p>
                </div>

                {loteAtivo ? (
                  editandoId === loteAtivo.id ? (
                    <form onSubmit={handleEditar} className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                      <p className="text-xs font-semibold text-blue-700">Editando lote ativo</p>
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Número do Lote *</label>
                        <input value={editForm.numero_lote} onChange={e => setEditForm(p => ({ ...p, numero_lote: e.target.value }))} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Fornecedor *</label>
                        <select value={editForm.fornecedor_id} onChange={e => setEditForm(p => ({ ...p, fornecedor_id: e.target.value }))} className={inputCls}>
                          {fornecedores.filter(f => f.ativo).map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Observações</label>
                        <input value={editForm.observacoes} onChange={e => setEditForm(p => ({ ...p, observacoes: e.target.value }))} className={inputCls} />
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setEditandoId(null)} className="flex-1 rounded-lg border border-neutral-300 py-1.5 text-xs font-medium text-neutral-700">Cancelar</button>
                        <button type="submit" disabled={salvando} className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{salvando ? 'Salvando...' : 'Salvar'}</button>
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-800">{loteAtivo.numero_lote}</span>
                            <span className="rounded-full bg-green-200 px-2 py-0.5 text-xs font-medium text-green-800">Ativo</span>
                          </div>
                          <p className="text-xs text-neutral-600">Fornecedor: <strong>{loteAtivo.fornecedor?.nome ?? nomeFornecedor(loteAtivo.fornecedor_id)}</strong></p>
                          <div className="flex gap-4 text-xs text-neutral-600">
                            <span>Inicial: <strong>{loteAtivo.quantidade_inicial}</strong> un.</span>
                            <span>Atual: <strong className={loteAtivo.estoque_atual <= 5 ? 'text-amber-600' : ''}>{loteAtivo.estoque_atual}</strong> un.</span>
                          </div>
                          {loteAtivo.observacoes && <p className="text-xs text-neutral-400 italic">{loteAtivo.observacoes}</p>}
                          <p className="text-xs text-neutral-400">{new Date(loteAtivo.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button onClick={() => iniciarEdicao(loteAtivo)} className="text-xs text-blue-600 hover:underline">Editar</button>
                          <button onClick={() => handleEncerrar(loteAtivo.id)} disabled={salvando} className="text-xs text-red-500 hover:underline disabled:opacity-50">Encerrar</button>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-neutral-200 p-4 text-center">
                    <p className="text-sm text-neutral-400">Nenhum lote ativo.</p>
                    <p className="text-xs text-neutral-400 mt-0.5">Cadastre um lote abaixo e clique em "Ativar".</p>
                  </div>
                )}
              </section>

              {/* ---- LOTES AGUARDANDO ---- */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Aguardando ({lotesAguardando.length})
                  </p>
                  {!mostrarNovo && (
                    <button onClick={() => setMostrarNovo(true)} className="text-xs font-semibold text-brand-600 hover:underline">
                      + Novo lote
                    </button>
                  )}
                </div>

                {/* Formulário novo lote */}
                {mostrarNovo && (
                  <form onSubmit={handleCriar} className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3 mb-3">
                    <p className="text-xs font-semibold text-amber-700">Novo lote — ficará como "Aguardando" até ser ativado</p>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Fornecedor *</label>
                      <select value={novoForm.fornecedor_id} onChange={e => setNovoForm(p => ({ ...p, fornecedor_id: e.target.value }))} className={inputCls}>
                        <option value="">Selecione...</option>
                        {fornecedores.filter(f => f.ativo).map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Número do Lote *</label>
                      <input value={novoForm.numero_lote} onChange={e => setNovoForm(p => ({ ...p, numero_lote: e.target.value }))} placeholder="ex: LOT-2025-001" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Quantidade inicial (un.) *</label>
                      <input type="number" min="1" value={novoForm.quantidade_inicial} onChange={e => setNovoForm(p => ({ ...p, quantidade_inicial: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Observações</label>
                      <input value={novoForm.observacoes} onChange={e => setNovoForm(p => ({ ...p, observacoes: e.target.value }))} placeholder="Validade, nota fiscal, etc." className={inputCls} />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setMostrarNovo(false); setErro(null) }} className="flex-1 rounded-lg border border-neutral-300 py-1.5 text-xs font-medium text-neutral-700">Cancelar</button>
                      <button type="submit" disabled={salvando} className="flex-1 rounded-lg bg-amber-600 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{salvando ? 'Criando...' : 'Criar Lote'}</button>
                    </div>
                  </form>
                )}

                {lotesAguardando.length === 0 && !mostrarNovo ? (
                  <p className="text-xs text-neutral-400 text-center py-2">Nenhum lote aguardando</p>
                ) : (
                  <div className="space-y-2">
                    {lotesAguardando.map(l => (
                      <div key={l.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        {editandoId === l.id ? (
                          <form onSubmit={handleEditar} className="space-y-2">
                            <input value={editForm.numero_lote} onChange={e => setEditForm(p => ({ ...p, numero_lote: e.target.value }))} className={inputCls} placeholder="Número do lote" />
                            <select value={editForm.fornecedor_id} onChange={e => setEditForm(p => ({ ...p, fornecedor_id: e.target.value }))} className={inputCls}>
                              {fornecedores.filter(f => f.ativo).map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                            </select>
                            <input value={editForm.observacoes} onChange={e => setEditForm(p => ({ ...p, observacoes: e.target.value }))} className={inputCls} placeholder="Observações" />
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setEditandoId(null)} className="flex-1 rounded-lg border border-neutral-300 py-1 text-xs text-neutral-700">Cancelar</button>
                              <button type="submit" disabled={salvando} className="flex-1 rounded-lg bg-blue-600 py-1 text-xs font-semibold text-white disabled:opacity-50">Salvar</button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-neutral-800">{l.numero_lote}</span>
                                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800">Aguardando</span>
                              </div>
                              <p className="text-xs text-neutral-600">Fornecedor: <strong>{l.fornecedor?.nome ?? nomeFornecedor(l.fornecedor_id)}</strong></p>
                              <div className="flex gap-4 text-xs text-neutral-600">
                                <span>Inicial: <strong>{l.quantidade_inicial}</strong> un.</span>
                                <span>Atual: <strong>{l.estoque_atual}</strong> un.</span>
                              </div>
                              {l.observacoes && <p className="text-xs text-neutral-400 italic">{l.observacoes}</p>}
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <button onClick={() => handleAtivar(l.id)} disabled={salvando} className="rounded-lg bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">Ativar</button>
                              <button onClick={() => iniciarEdicao(l)} className="text-xs text-blue-600 hover:underline">Editar</button>
                              <button onClick={() => handleEncerrar(l.id)} disabled={salvando} className="text-xs text-red-500 hover:underline disabled:opacity-50">Encerrar</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ---- LOTES ENCERRADOS ---- */}
              {lotesEncerrados.length > 0 && (
                <section>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Encerrados ({lotesEncerrados.length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {lotesEncerrados.map(l => (
                      <div key={l.id} className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-neutral-500">{l.numero_lote}</span>
                          <span className="text-xs text-neutral-400">Encerrado</span>
                        </div>
                        <p className="text-xs text-neutral-400">Fornecedor: {l.fornecedor?.nome ?? nomeFornecedor(l.fornecedor_id)}</p>
                        <div className="flex gap-4 text-xs text-neutral-400 mt-0.5">
                          <span>Inicial: {l.quantidade_inicial} un.</span>
                          <span>Final: {l.estoque_atual} un.</span>
                          <span>{new Date(l.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
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
          {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </span>
    </th>
  )
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================
export default function AdminEstoquePage() {
  const { produtos, isLoading, error, reload, create, update, remove, uploadImagem, ajustarEstoque, getMovimentacoes } = useProdutosAdmin()
  const { fornecedores } = useFornecedoresAdmin()

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
  const [modalLotes, setModalLotes] = useState<ProdutoAdmin | null>(null)
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
          <h1 className="text-2xl font-bold text-neutral-800">Gestão de Estoque</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {produtos.length} produtos · {ativos} ativos · {inativos} inativos
            {baixoEstoque > 0 && <span className="ml-2 text-amber-600 font-medium">· {baixoEstoque} com estoque baixo (&le;5)</span>}
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
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou SKU..."
          value={busca}
          onChange={e => { setBusca(e.target.value); setPage(1) }}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <div className="flex gap-2">
          <select
            value={filtroStatus}
            onChange={e => { setFiltroStatus(e.target.value as typeof filtroStatus); setPage(1) }}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
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
        <>
        {/* Desktop */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <ThSort label="Produto" col="nome" current={sortKey} dir={sortDir} onSort={toggleSort} align="left" />
                <ThSort label="Categoria" col="categoria" current={sortKey} dir={sortDir} onSort={toggleSort} align="left" />
                <ThSort label="Preço" col="preco" current={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                <ThSort label="Estoque" col="estoque" current={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                <th className="px-4 py-3 text-center font-medium text-neutral-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {produtosPaginados.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imagens[0] ? (
                        <img src={p.imagens[0]} alt={p.nome} className="h-10 w-10 shrink-0 rounded-lg object-cover border border-neutral-200" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-800 truncate" title={p.nome}>{p.nome}</p>
                        {p.sku && <p className="text-xs text-neutral-400">SKU: {p.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">{p.categoria}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <p className="font-medium text-neutral-800">{p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    {p.precoPromocional && <p className="text-xs text-green-600">{p.precoPromocional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className={`font-medium ${p.estoque <= 5 ? 'text-amber-600' : 'text-neutral-800'}`}>{p.estoque}</span>
                    <span className="text-neutral-400"> un.</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.ativo ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>{p.ativo ? 'Ativo' : 'Inativo'}</span>
                    {p.destaque && <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Destaque</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setModalLotes(p)} title="Lotes" className="rounded-lg p-1.5 text-neutral-400 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      </button>
                      <button onClick={() => setModalHistorico(p)} title="Histórico" className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      </button>
                      <button onClick={() => setModalAjuste(p)} title="Ajustar estoque" className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                      </button>
                      <button onClick={() => setModalForm({ aberto: true, produto: p })} title="Editar" className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      {p.ativo && (
                        <button onClick={() => handleRemove(p)} title="Desativar" className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination total={produtosFiltrados.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={s => { setPageSize(s); setPage(1) }} />
        </div>

        {/* Mobile — cards */}
        <div className="md:hidden space-y-3">
          {produtosPaginados.map(p => (
            <div key={p.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-start gap-3 mb-3">
                {p.imagens[0] ? (
                  <img src={p.imagens[0]} alt={p.nome} className="h-14 w-14 shrink-0 rounded-lg object-cover border border-neutral-200" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-300">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-800 leading-snug">{p.nome}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{p.categoria}{p.sku ? ` · SKU: ${p.sku}` : ''}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.ativo ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>{p.ativo ? 'Ativo' : 'Inativo'}</span>
                    {p.destaque && <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Destaque</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3 text-sm">
                <div>
                  <p className="font-semibold text-neutral-800">{p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  {p.precoPromocional && <p className="text-xs text-green-600">{p.precoPromocional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>}
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${p.estoque <= 5 ? 'text-amber-600' : 'text-neutral-700'}`}>{p.estoque} un.</p>
                  {p.estoque <= 5 && <p className="text-xs text-amber-500">Estoque baixo</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                <button onClick={() => setModalLotes(p)} className="flex-1 rounded-lg border border-amber-200 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors">Lotes</button>
                <button onClick={() => setModalHistorico(p)} className="flex-1 rounded-lg border border-neutral-200 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">Histórico</button>
                <button onClick={() => setModalAjuste(p)} className="flex-1 rounded-lg border border-neutral-200 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">Ajustar</button>
                <button onClick={() => setModalForm({ aberto: true, produto: p })} className="flex-1 rounded-lg bg-brand py-1.5 text-xs font-medium text-white hover:bg-brand-dark transition-colors">Editar</button>
              </div>
            </div>
          ))}
          <Pagination total={produtosFiltrados.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={s => { setPageSize(s); setPage(1) }} />
        </div>
        </>
      )}

      {/* Modais */}
      {modalForm.aberto && (
        <FormModal
          produto={modalForm.produto}
          fornecedores={fornecedores}
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
      {modalLotes && (
        <LotesModal
          key={modalLotes.id}
          produto={modalLotes}
          fornecedores={fornecedores}
          onClose={() => setModalLotes(null)}
          onEstoqueChanged={reload}
        />
      )}
    </div>
  )
}
