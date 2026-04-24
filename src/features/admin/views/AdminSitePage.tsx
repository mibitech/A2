import { useState, useRef } from 'react'
import {
  useHeroSlides,
  useConteudoSecao,
  useSobreGaleria,
  uploadSiteImagem,
} from '../controllers/useSiteAdmin'
import type { HeroSlide, ConteudoItem } from '../controllers/useSiteAdmin'

type Aba = 'carrossel' | 'sobre' | 'contatos' | 'institucional' | 'whatsapp'

const ABAS: { id: Aba; label: string }[] = [
  { id: 'carrossel', label: 'Carrossel' },
  { id: 'sobre', label: 'Sobre Nós' },
  { id: 'contatos', label: 'Contatos' },
  { id: 'institucional', label: 'Institucional' },
  { id: 'whatsapp', label: 'WhatsApp' },
]

// =====================================================
// UPLOAD BUTTON
// =====================================================
interface UploadBtnProps {
  pasta: 'hero' | 'sobre'
  onUpload: (url: string) => void
  label?: string
}

function UploadBtn({ pasta, onUpload, label = 'Fazer upload' }: UploadBtnProps) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setErro(null)
    const { url, error } = await uploadSiteImagem(file, pasta)
    setUploading(false)
    if (error || !url) { setErro(error ?? 'Erro no upload'); return }
    onUpload(url)
    if (ref.current) ref.current.value = ''
  }

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm text-neutral-600 hover:border-brand hover:text-brand transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-brand" />
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
        {uploading ? 'Enviando...' : label}
      </button>
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
    </div>
  )
}

// =====================================================
// ABA: CARROSSEL
// =====================================================
function AbaCarrossel() {
  const { slides, isLoading, error, criar, atualizar, excluir } = useHeroSlides()
  const [editando, setEditando] = useState<HeroSlide | null>(null)
  const [novoAberto, setNovoAberto] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  function msg(texto: string) {
    setFeedback(texto)
    setTimeout(() => setFeedback(null), 3500)
  }

  async function handleToggle(slide: HeroSlide) {
    const r = await atualizar(slide.id, { ativo: !slide.ativo })
    if (!r.success) msg('Erro: ' + r.error)
  }

  async function handleExcluir(id: string) {
    if (!confirm('Excluir este slide?')) return
    const r = await excluir(id)
    if (!r.success) msg('Erro: ' + r.error)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{slides.length} slide(s) cadastrado(s)</p>
        <button
          onClick={() => setNovoAberto(true)}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Slide
        </button>
      </div>

      {feedback && <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{feedback}</div>}

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" /></div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : slides.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-neutral-200 p-12 text-center">
          <p className="text-sm text-neutral-400">Nenhum slide cadastrado. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map(s => (
            <div key={s.id} className={`flex gap-4 rounded-xl border bg-white p-4 ${!s.ativo ? 'opacity-60' : 'border-neutral-200'}`}>
              <img
                src={s.imagemUrl}
                alt={s.titulo}
                className="h-20 w-32 shrink-0 rounded-lg object-cover bg-neutral-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {s.badge && (
                      <span className="mb-1 inline-flex rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand">
                        {s.badge}
                      </span>
                    )}
                    <p className="font-semibold text-neutral-800 truncate">{s.titulo}</p>
                    <p className="text-sm text-neutral-500 truncate">{s.subtitulo}</p>
                    <p className="text-xs text-neutral-400 mt-1">CTA: {s.ctaTexto} → {s.ctaUrl}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${s.ativo ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                    {s.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex gap-3 mt-3">
                  <button onClick={() => setEditando(s)} className="text-xs text-brand hover:underline">Editar</button>
                  <button onClick={() => handleToggle(s)} className="text-xs text-neutral-400 hover:text-neutral-700">
                    {s.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button onClick={() => handleExcluir(s.id)} className="text-xs text-red-400 hover:text-red-600">Excluir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(novoAberto || editando) && (
        <SlideModal
          slide={editando}
          onClose={() => { setNovoAberto(false); setEditando(null) }}
          onSalvar={async payload => {
            if (editando) {
              return atualizar(editando.id, payload)
            }
            return criar({ ...payload, ordem: slides.length })
          }}
        />
      )}
    </div>
  )
}

interface SlideModalProps {
  slide: HeroSlide | null
  onClose: () => void
  onSalvar: (p: {
    titulo: string; subtitulo: string; badge?: string | null
    ctaTexto: string; ctaUrl: string; imagemUrl: string; ativo?: boolean
  }) => Promise<{ success: boolean; error?: string }>
}

function SlideModal({ slide, onClose, onSalvar }: SlideModalProps) {
  const [titulo, setTitulo] = useState(slide?.titulo ?? '')
  const [subtitulo, setSubtitulo] = useState(slide?.subtitulo ?? '')
  const [badge, setBadge] = useState(slide?.badge ?? '')
  const [ctaTexto, setCtaTexto] = useState(slide?.ctaTexto ?? 'Ver Produtos')
  const [ctaUrl, setCtaUrl] = useState(slide?.ctaUrl ?? '/produtos')
  const [imagemUrl, setImagemUrl] = useState(slide?.imagemUrl ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) { setErro('Título obrigatório'); return }
    if (!imagemUrl.trim()) { setErro('Faça upload de uma imagem'); return }
    setSalvando(true)
    const r = await onSalvar({ titulo, subtitulo, badge: badge || null, ctaTexto, ctaUrl, imagemUrl })
    setSalvando(false)
    if (r.success) onClose()
    else setErro(r.error ?? 'Erro ao salvar')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold text-neutral-800">{slide ? 'Editar Slide' : 'Novo Slide'}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Imagem */}
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Imagem de Fundo *</label>
            {imagemUrl && (
              <img src={imagemUrl} alt="Preview" className="mb-2 h-32 w-full rounded-lg object-cover" />
            )}
            <UploadBtn pasta="hero" onUpload={setImagemUrl} label="Upload de imagem (1200×600 recomendado)" />
            {!imagemUrl && (
              <div className="mt-2">
                <p className="text-xs text-neutral-400 mb-1">Ou cole uma URL:</p>
                <input type="url" value={imagemUrl} onChange={e => setImagemUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Título *</label>
              <input value={titulo} onChange={e => setTitulo(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Badge</label>
              <input value={badge} onChange={e => setBadge(e.target.value)} placeholder="Ex: FRETE GRÁTIS"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Subtítulo</label>
            <input value={subtitulo} onChange={e => setSubtitulo(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Texto do Botão</label>
              <input value={ctaTexto} onChange={e => setCtaTexto(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">URL do Botão</label>
              <input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
          </div>

          {erro && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</div>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-neutral-300 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
              Cancelar
            </button>
            <button type="submit" disabled={salvando}
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
// ABA CONTEÚDO GENÉRICA (Contatos / Sobre / Institucional)
// =====================================================
interface AbaConteudoProps {
  secao: 'contatos' | 'sobre' | 'institucional' | 'whatsapp'
}

function AbaConteudo({ secao }: AbaConteudoProps) {
  const { itens, isLoading, error, salvar } = useConteudoSecao(secao)
  const [valores, setValores] = useState<Record<string, string>>({})
  const [inicializado, setInicializado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  if (!inicializado && itens.length > 0) {
    const init: Record<string, string> = {}
    itens.forEach(i => { init[i.chave] = i.valor })
    setValores(init)
    setInicializado(true)
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const updates = itens.map(i => ({ chave: i.chave, valor: valores[i.chave] ?? i.valor }))
    const r = await salvar(updates)
    setSalvando(false)
    setFeedback({ ok: r.success, msg: r.success ? 'Salvo com sucesso!' : r.error ?? 'Erro' })
    setTimeout(() => setFeedback(null), 3500)
  }

  if (isLoading) return (
    <div className="flex justify-center py-10">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
    </div>
  )

  if (error) return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>

  return (
    <form onSubmit={handleSalvar} className="space-y-4">
      {itens.map(item => (
        <div key={item.chave}>
          <label className="mb-1 block text-xs font-medium text-neutral-600">{item.rotulo}</label>
          {item.tipo === 'texto_longo' ? (
            <textarea
              value={valores[item.chave] ?? ''}
              onChange={e => setValores(prev => ({ ...prev, [item.chave]: e.target.value }))}
              rows={3}
              className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          ) : (
            <input
              type={item.tipo === 'email' ? 'email' : item.tipo === 'url' ? 'url' : 'text'}
              value={valores[item.chave] ?? ''}
              onChange={e => setValores(prev => ({ ...prev, [item.chave]: e.target.value }))}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          )}
          <p className="mt-0.5 text-xs text-neutral-400 font-mono">{item.chave}</p>
        </div>
      ))}

      {feedback && (
        <div className={`rounded-lg px-3 py-2 text-sm ${feedback.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {feedback.msg}
        </div>
      )}

      <div className="pt-2">
        <button type="submit" disabled={salvando}
          className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}

// =====================================================
// ABA: SOBRE NÓS (conteúdo + galeria)
// =====================================================
function AbaSobre() {
  const galeria = useSobreGaleria()
  const [uploadandoGaleria, setUploadandoGaleria] = useState(false)
  const [altInput, setAltInput] = useState('')
  const [feedbackGaleria, setFeedbackGaleria] = useState<string | null>(null)

  function msgGaleria(t: string) { setFeedbackGaleria(t); setTimeout(() => setFeedbackGaleria(null), 3500) }

  return (
    <div className="space-y-8">
      {/* Textos */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-neutral-700">Textos e Informações</h3>
        <AbaConteudo secao="sobre" />
      </div>

      {/* Galeria de imagens */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">Galeria de Imagens</h3>
        <p className="mb-4 text-xs text-neutral-400">Imagens exibidas na página Sobre Nós.</p>

        {/* Upload */}
        <div className="mb-4 flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <label className="mb-1 block text-xs font-medium text-neutral-500">Descrição (alt)</label>
            <input value={altInput} onChange={e => setAltInput(e.target.value)}
              placeholder="Ex: Nossa equipe"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
          <UploadBtn
            pasta="sobre"
            label="Adicionar imagem"
            onUpload={async url => {
              setUploadandoGaleria(true)
              const r = await galeria.adicionar(url, altInput || 'Imagem')
              setUploadandoGaleria(false)
              setAltInput('')
              if (!r.success) msgGaleria('Erro: ' + r.error)
            }}
          />
        </div>

        {feedbackGaleria && (
          <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{feedbackGaleria}</div>
        )}

        {galeria.isLoading ? (
          <div className="flex justify-center py-6"><div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" /></div>
        ) : galeria.imagens.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center">
            <p className="text-sm text-neutral-400">Nenhuma imagem cadastrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {galeria.imagens.map(img => (
              <div key={img.id} className="group relative rounded-xl overflow-hidden bg-neutral-100">
                <img src={img.url} alt={img.alt} className="h-32 w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
                  <button
                    onClick={async () => {
                      if (!confirm('Excluir imagem?')) return
                      const r = await galeria.excluir(img.id, img.url)
                      if (!r.success) msgGaleria('Erro: ' + r.error)
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded-full bg-red-500 p-2 text-white transition-opacity"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {img.alt && (
                  <p className="px-2 py-1 text-xs text-neutral-500 truncate">{img.alt}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// =====================================================
// ABA: WHATSAPP BUBBLE
// =====================================================
function AbaWhatsApp() {
  const { itens, mapa, isLoading, error, salvar } = useConteudoSecao('whatsapp')
  const [valores, setValores] = useState<Record<string, string>>({})
  const [inicializado, setInicializado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  if (!inicializado && itens.length > 0) {
    const init: Record<string, string> = {}
    itens.forEach(i => { init[i.chave] = i.valor })
    setValores(init)
    setInicializado(true)
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const updates = itens.map(i => ({ chave: i.chave, valor: valores[i.chave] ?? i.valor }))
    const r = await salvar(updates)
    setSalvando(false)
    setFeedback({ ok: r.success, msg: r.success ? 'Salvo com sucesso!' : r.error ?? 'Erro' })
    setTimeout(() => setFeedback(null), 3500)
  }

  if (isLoading) return (
    <div className="flex justify-center py-10">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
    </div>
  )

  if (error) return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>

  const ativo = valores['whatsapp_ativo'] === 'true'
  const numero = (valores['whatsapp_numero'] ?? '').replace(/\D/g, '')
  const mensagem = encodeURIComponent(valores['whatsapp_mensagem'] ?? '')
  const label = valores['whatsapp_label'] || 'Fale conosco'

  return (
    <form onSubmit={handleSalvar} className="space-y-6">
      {/* Preview */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="mb-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Preview do botão</p>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-md">
            {label}
          </span>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg">
            <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
        </div>
        {numero && (
          <a
            href={`https://wa.me/${numero}?text=${mensagem}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs text-brand hover:underline"
          >
            Testar link →
          </a>
        )}
      </div>

      {/* Toggle ativo */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
        <div>
          <p className="text-sm font-medium text-neutral-800">Exibir botão no site</p>
          <p className="text-xs text-neutral-400 mt-0.5">Quando desativado, o botão some para os visitantes</p>
        </div>
        <button
          type="button"
          onClick={() => setValores(prev => ({ ...prev, whatsapp_ativo: ativo ? 'false' : 'true' }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ativo ? 'bg-[#25D366]' : 'bg-neutral-200'}`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${ativo ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Campos */}
      {itens.filter(i => i.chave !== 'whatsapp_ativo').map(item => (
        <div key={item.chave}>
          <label className="mb-1 block text-xs font-medium text-neutral-600">{item.rotulo}</label>
          {item.tipo === 'texto_longo' ? (
            <textarea
              value={valores[item.chave] ?? ''}
              onChange={e => setValores(prev => ({ ...prev, [item.chave]: e.target.value }))}
              rows={3}
              className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          ) : (
            <input
              type="text"
              value={valores[item.chave] ?? ''}
              onChange={e => setValores(prev => ({ ...prev, [item.chave]: e.target.value }))}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          )}
          {item.chave === 'whatsapp_numero' && (
            <p className="mt-0.5 text-xs text-neutral-400">Ex: 5511999999999 (55 = Brasil, 11 = DDD, sem espaços)</p>
          )}
        </div>
      ))}

      {feedback && (
        <div className={`rounded-lg px-3 py-2 text-sm ${feedback.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {feedback.msg}
        </div>
      )}

      <div className="pt-2">
        <button type="submit" disabled={salvando}
          className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================
export default function AdminSitePage() {
  const [aba, setAba] = useState<Aba>('carrossel')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Conteúdo do Site</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Gerencie as informações exibidas no site para os visitantes
        </p>
      </div>

      {/* Abas */}
      <div className="flex border-b border-neutral-200 mb-6 overflow-x-auto">
        {ABAS.map(a => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              aba === a.id
                ? 'border-b-2 border-brand text-brand'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl">
        {aba === 'carrossel'     && <AbaCarrossel />}
        {aba === 'sobre'         && <AbaSobre />}
        {aba === 'contatos'      && <AbaConteudo secao="contatos" />}
        {aba === 'institucional' && <AbaConteudo secao="institucional" />}
        {aba === 'whatsapp'      && <AbaWhatsApp />}
      </div>
    </div>
  )
}
