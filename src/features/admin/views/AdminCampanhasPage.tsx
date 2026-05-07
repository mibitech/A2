import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@features/auth/contexts/AuthContext'
import {
  getCampanhasTemplates, criarTemplate, editarTemplate, excluirTemplate,
  getCampanhas, salvarRascunho, enviarCampanha, enviarRascunho,
  arquivarCampanha, cancelarCampanha, deleteCampanha,
} from '../services/campanhas.admin.service'
import type { CampanhaTemplate, Campanha, SegmentoCampanha, StatusCampanha } from '../services/campanhas.admin.service'
import { getTagsUnicas } from '../services/clientes.admin.service'

// =====================================================
// HELPERS
// =====================================================

const fmtData = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })

const SEGMENTO_LABEL: Record<SegmentoCampanha, string> = {
  todos: 'Todos',
  clientes: 'Clientes',
  por_tag: 'Por tag',
  lista_manual: 'Lista manual',
}

const STATUS_LABEL: Record<StatusCampanha, string> = {
  enviando: 'Enviando...',
  enviada: 'Enviada',
  erro: 'Erro',
  arquivada: 'Arquivada',
  cancelada: 'Cancelada',
}

const STATUS_COLOR: Record<StatusCampanha, string> = {
  enviando: 'bg-blue-100 text-blue-700',
  enviada: 'bg-green-100 text-green-700',
  erro: 'bg-red-100 text-red-700',
  arquivada: 'bg-neutral-100 text-neutral-400',
  cancelada: 'bg-orange-100 text-orange-600',
}

const HTML_VAZIO = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#6d28d9;padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;">A2 Brasil Supplies</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="color:#1a1a1a;">Olá, {{nome}}!</h2>
          <p style="color:#555;font-size:15px;line-height:1.6;">Escreva seu conteúdo aqui...</p>
        </td></tr>
        <tr><td style="background:#f8f8f8;padding:20px 32px;text-align:center;border-top:1px solid #e5e5e5;">
          <p style="margin:0;color:#888;font-size:12px;">© 2026 A2 Brasil Supplies LTDA.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

// =====================================================
// MODAL TEMPLATE
// =====================================================

interface ModalTemplateProps {
  inicial?: CampanhaTemplate | null
  tags: string[]
  onClose: () => void
  onSalvar: (payload: any) => Promise<{ error: string | null }>
}

function ModalTemplate({ inicial, tags, onClose, onSalvar }: ModalTemplateProps) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [descricao, setDescricao] = useState(inicial?.descricao ?? '')
  const [assunto, setAssunto] = useState(inicial?.assunto ?? '')
  const [segmento, setSegmento] = useState<SegmentoCampanha>(inicial?.segmento ?? 'todos')
  const [tagFiltro, setTagFiltro] = useState(inicial?.tagFiltro ?? '')
  const [conteudoHtml, setConteudoHtml] = useState(inicial?.conteudoHtml ?? HTML_VAZIO)
  const [preview, setPreview] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !assunto.trim() || !conteudoHtml.trim()) {
      setErro('Preencha título, assunto e conteúdo')
      return
    }
    setSalvando(true)
    setErro(null)
    const result = await onSalvar({ titulo, descricao, assunto, conteudoHtml, segmento, tagFiltro })
    setSalvando(false)
    if (result.error) setErro(result.error)
    else onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 shrink-0">
          <h2 className="font-semibold text-neutral-800">{inicial ? 'Editar Template' : 'Novo Template'}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreview(p => !p)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${preview ? 'border-brand bg-brand text-white' : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}
            >
              {preview ? 'Editar' : 'Preview'}
            </button>
            <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {preview ? (
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: conteudoHtml.replace(/\{\{nome\}\}/g, 'João Silva').replace(/\{\{email\}\}/g, 'joao@exemplo.com') }}
            />
          ) : (
            <form id="form-template" onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500">Título interno *</label>
                  <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Promoção Maio"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500">Descrição (uso interno)</label>
                  <input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Quando usar este template..."
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">Assunto do e-mail *</label>
                <input value={assunto} onChange={e => setAssunto(e.target.value)} placeholder="Ex: Novidades para você!"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500">Destinatário padrão</label>
                  <select value={segmento} onChange={e => setSegmento(e.target.value as SegmentoCampanha)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
                    <option value="todos">Todos os usuários</option>
                    <option value="clientes">Clientes</option>
                    <option value="por_tag">Por tag</option>
                  </select>
                </div>
                {segmento === 'por_tag' && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-500">Tag padrão</label>
                    <select value={tagFiltro} onChange={e => setTagFiltro(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
                      <option value="">Selecione...</option>
                      {tags.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-neutral-500">Conteúdo HTML *</label>
                  <span className="text-xs text-neutral-400">Use {`{{nome}}`} e {`{{email}}`} para personalizar</span>
                </div>
                <textarea value={conteudoHtml} onChange={e => setConteudoHtml(e.target.value)} rows={12}
                  className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>

              {erro && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</div>}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-neutral-200 px-6 py-4 shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-lg border border-neutral-300 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
            Cancelar
          </button>
          <button form="form-template" type="submit" disabled={salvando || preview}
            className="flex-1 rounded-lg bg-brand py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">
            {salvando ? 'Salvando...' : 'Salvar template'}
          </button>
        </div>
      </div>
    </div>
  )
}

// =====================================================
// MODAL CAMPANHA (criar/enviar)
// =====================================================

interface ModalCampanhaProps {
  templates: CampanhaTemplate[]
  tags: string[]
  inicial?: Campanha | null
  templatePre?: CampanhaTemplate | null
  usuarioId?: string
  onClose: () => void
  onSalvarRascunho: (payload: any) => Promise<{ error: string | null }>
  onEnviar: (payload: any) => Promise<{ enviados: number; error: string | null }>
}

function ModalCampanha({ templates, tags, inicial, templatePre, usuarioId, onClose, onSalvarRascunho, onEnviar }: ModalCampanhaProps) {
  const baseTemplate = templatePre ?? (inicial?.templateId ? templates.find(t => t.id === inicial.templateId) : null)

  const [templateId, setTemplateId] = useState(inicial?.templateId ?? templatePre?.id ?? '')
  const [titulo, setTitulo] = useState(inicial?.titulo ?? templatePre?.titulo ?? '')
  const [assunto, setAssunto] = useState(inicial?.assunto ?? templatePre?.assunto ?? '')
  const [segmento, setSegmento] = useState<SegmentoCampanha>(inicial?.segmento ?? templatePre?.segmento ?? 'todos')
  const [tagFiltro, setTagFiltro] = useState(inicial?.tagFiltro ?? templatePre?.tagFiltro ?? '')
  const [listaManualTexto, setListaManualTexto] = useState(
    inicial?.destinatariosManual?.join('\n') ?? ''
  )
  const [conteudoHtml, setConteudoHtml] = useState(inicial?.conteudoHtml ?? templatePre?.conteudoHtml ?? HTML_VAZIO)
  const [preview, setPreview] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function parsearEmails(texto: string): string[] {
    return [...new Set(
      texto
        .split(/[\n\r,;|\t]+/)
        .map(e => e.trim().toLowerCase().replace(/^["'\s]+|["'\s]+$/g, ''))
        .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e))
    )]
  }

  const emailsParsed = segmento === 'lista_manual' ? parsearEmails(listaManualTexto) : []

  function aplicarTemplate(id: string) {
    const t = templates.find(t => t.id === id)
    if (!t) return
    setTemplateId(id)
    setTitulo(t.titulo)
    setAssunto(t.assunto)
    setSegmento(t.segmento)
    setTagFiltro(t.tagFiltro ?? '')
    setConteudoHtml(t.conteudoHtml)
  }

  async function handleRascunho() {
    if (!titulo.trim() || !assunto.trim()) { setErro('Preencha título e assunto'); return }
    if (segmento === 'lista_manual' && emailsParsed.length === 0) { setErro('Adicione ao menos um e-mail válido na lista'); return }
    setProcessando(true)
    setErro(null)
    const result = await onSalvarRascunho({
      titulo, assunto, conteudoHtml, segmento, tagFiltro,
      destinatariosManual: segmento === 'lista_manual' ? emailsParsed : undefined,
      templateId: templateId || undefined, criadoPor: usuarioId,
    })
    setProcessando(false)
    if (result.error) setErro(result.error)
    else onClose()
  }

  async function handleEnviar() {
    if (!titulo.trim() || !assunto.trim() || !conteudoHtml.trim()) { setErro('Preencha título, assunto e conteúdo'); return }
    if (segmento === 'lista_manual' && emailsParsed.length === 0) { setErro('Adicione ao menos um e-mail válido na lista'); return }
    const destLabel = segmento === 'lista_manual'
      ? `${emailsParsed.length} e-mail(s) da lista`
      : `"${SEGMENTO_LABEL[segmento]}"${tagFiltro ? ` (tag: ${tagFiltro})` : ''}`
    if (!confirm(`Enviar para ${destLabel}? Esta ação não pode ser desfeita.`)) return
    setProcessando(true)
    setErro(null)
    const result = await onEnviar({
      titulo, assunto, conteudoHtml, segmento, tagFiltro,
      destinatariosManual: segmento === 'lista_manual' ? emailsParsed : undefined,
      templateId: templateId || undefined, criadoPor: usuarioId,
    })
    setProcessando(false)
    if (result.error) setErro(result.error)
    else onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 shrink-0">
          <h2 className="font-semibold text-neutral-800">Nova Campanha</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreview(p => !p)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${preview ? 'border-brand bg-brand text-white' : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}
            >
              {preview ? 'Editar' : 'Preview'}
            </button>
            <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {preview ? (
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: conteudoHtml.replace(/\{\{nome\}\}/g, 'João Silva').replace(/\{\{email\}\}/g, 'joao@exemplo.com') }}
            />
          ) : (
            <div className="p-6 space-y-4">
              {/* Selecionar template */}
              {templates.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500">Usar um template</label>
                  <select
                    value={templateId}
                    onChange={e => e.target.value ? aplicarTemplate(e.target.value) : setTemplateId('')}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">— Sem template (do zero) —</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.titulo}</option>
                    ))}
                  </select>
                  {templateId && (
                    <p className="mt-1 text-xs text-neutral-400">
                      Os campos foram preenchidos com o template. Você pode editá-los antes de enviar.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500">Título interno *</label>
                  <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Promoção Junho 2026"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500">Assunto do e-mail *</label>
                  <input value={assunto} onChange={e => setAssunto(e.target.value)} placeholder="Ex: Novidades para você!"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500">Destinatários</label>
                  <select value={segmento} onChange={e => setSegmento(e.target.value as SegmentoCampanha)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
                    <option value="todos">Todos os usuários</option>
                    <option value="clientes">Clientes</option>
                    <option value="por_tag">Por tag</option>
                    <option value="lista_manual">Lista manual de e-mails</option>
                  </select>
                </div>
                {segmento === 'por_tag' && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-500">Tag</label>
                    <select value={tagFiltro} onChange={e => setTagFiltro(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
                      <option value="">Selecione...</option>
                      {tags.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {segmento === 'lista_manual' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-500">Lista de e-mails</label>
                    {listaManualTexto.trim() && (
                      <span className={`text-xs font-medium ${emailsParsed.length > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {emailsParsed.length > 0 ? `${emailsParsed.length} reconhecido(s)` : 'Nenhum e-mail válido'}
                      </span>
                    )}
                  </div>
                  <textarea
                    value={listaManualTexto}
                    onChange={e => setListaManualTexto(e.target.value)}
                    rows={5}
                    placeholder={'joao@empresa.com\nmaria@empresa.com\ncontato@fornecedor.com'}
                    className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <p className="text-xs text-neutral-400">
                    Um por linha, ou separados por vírgula, ponto-e-vírgula ou pipe (|).
                  </p>
                  {emailsParsed.length > 0 && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                      <p className="mb-1.5 text-xs font-semibold text-green-700">Serão enviados para:</p>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                        {emailsParsed.map(e => (
                          <span key={e} className="rounded-full bg-white border border-green-200 px-2 py-0.5 text-xs text-green-800 font-mono">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {listaManualTexto.trim() && (() => {
                    const linhas = listaManualTexto.split(/[\n\r,;|\t]+/).map(e => e.trim().toLowerCase().replace(/^["'\s]+|["'\s]+$/g, '')).filter(Boolean)
                    const rejeitados = linhas.filter(l => l && !emailsParsed.includes(l))
                    return rejeitados.length > 0 ? (
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                        <p className="mb-1.5 text-xs font-semibold text-orange-700">Ignorados (formato inválido):</p>
                        <div className="flex flex-wrap gap-1.5">
                          {rejeitados.map(e => (
                            <span key={e} className="rounded-full bg-white border border-orange-200 px-2 py-0.5 text-xs text-orange-700 font-mono">
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-neutral-500">Conteúdo HTML *</label>
                  <span className="text-xs text-neutral-400">Use {`{{nome}}`} e {`{{email}}`}</span>
                </div>
                <textarea value={conteudoHtml} onChange={e => setConteudoHtml(e.target.value)} rows={10}
                  className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>

              {erro && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</div>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-neutral-200 px-6 py-4 shrink-0">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
            Cancelar
          </button>
          <button type="button" onClick={handleEnviar} disabled={processando || preview}
            className="flex-1 rounded-lg bg-brand py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">
            {processando ? 'Enviando...' : 'Enviar agora'}
          </button>
        </div>
      </div>
    </div>
  )
}

// =====================================================
// ABA TEMPLATES
// =====================================================

function AbaTemplates({ templates, tags, loading, onNovo, onEditar, onExcluir, onUsarTemplate }: {
  templates: CampanhaTemplate[]
  tags: string[]
  loading: boolean
  onNovo: () => void
  onEditar: (t: CampanhaTemplate) => void
  onExcluir: (id: string, titulo: string) => void
  onUsarTemplate: (t: CampanhaTemplate) => void
}) {
  const [previewId, setPreviewId] = useState<string | null>(null)
  const previewTemplate = templates.find(t => t.id === previewId)

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-neutral-500">{templates.length} template{templates.length !== 1 ? 's' : ''} cadastrado{templates.length !== 1 ? 's' : ''}</p>
        <button onClick={onNovo}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo template
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-neutral-200 p-12 text-center">
          <svg className="mx-auto h-10 w-10 text-neutral-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-neutral-400 mb-3">Nenhum template cadastrado</p>
          <button onClick={onNovo} className="text-sm text-brand hover:underline">Criar primeiro template</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className="flex flex-col rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              {/* Mini preview */}
              <div
                className="h-28 overflow-hidden bg-neutral-50 border-b border-neutral-100 pointer-events-none select-none"
                style={{ transform: 'scale(1)', transformOrigin: 'top left' }}
              >
                <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: '286%', height: '286%', pointerEvents: 'none' }}
                  dangerouslySetInnerHTML={{ __html: t.conteudoHtml.replace(/\{\{nome\}\}/g, 'João').replace(/\{\{email\}\}/g, 'joao@ex.com') }} />
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-neutral-800 leading-tight">{t.titulo}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${SEGMENTO_LABEL[t.segmento] ? 'bg-brand/10 text-brand' : 'bg-neutral-100 text-neutral-500'}`}>
                    {SEGMENTO_LABEL[t.segmento]}
                    {t.tagFiltro && `: ${t.tagFiltro}`}
                  </span>
                </div>
                {t.descricao && (
                  <p className="text-xs text-neutral-400 mb-2 line-clamp-2">{t.descricao}</p>
                )}
                <p className="text-xs text-neutral-500 italic truncate mb-3">"{t.assunto}"</p>

                <div className="mt-auto flex gap-1.5 flex-wrap">
                  <button onClick={() => onUsarTemplate(t)}
                    className="flex-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark transition-colors">
                    Usar
                  </button>
                  <button onClick={() => setPreviewId(t.id)}
                    className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors">
                    Preview
                  </button>
                  <button onClick={() => onEditar(t)}
                    className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors">
                    Editar
                  </button>
                  <button onClick={() => onExcluir(t.id, t.titulo)}
                    className="rounded-lg border border-neutral-200 p-1.5 text-neutral-300 hover:text-red-500 hover:border-red-200 transition-colors">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal preview full */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 shrink-0">
              <div>
                <p className="font-semibold text-neutral-800">{previewTemplate.titulo}</p>
                <p className="text-xs text-neutral-400 italic mt-0.5">"{previewTemplate.assunto}"</p>
              </div>
              <button onClick={() => setPreviewId(null)} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: previewTemplate.conteudoHtml.replace(/\{\{nome\}\}/g, 'João Silva').replace(/\{\{email\}\}/g, 'joao@exemplo.com') }} />
            <div className="flex gap-2 border-t border-neutral-200 px-6 py-4 shrink-0">
              <button onClick={() => setPreviewId(null)} className="flex-1 rounded-lg border border-neutral-300 py-2 text-sm text-neutral-600 hover:bg-neutral-50">Fechar</button>
              <button onClick={() => { setPreviewId(null); onUsarTemplate(previewTemplate) }}
                className="flex-1 rounded-lg bg-brand py-2 text-sm font-medium text-white hover:bg-brand-dark">
                Usar este template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// =====================================================
// ABA CAMPANHAS
// =====================================================

function AbaCampanhas({ campanhas, loading, onNova, onArquivar, onReenviar, onExcluir }: {
  campanhas: Campanha[]
  loading: boolean
  onNova: () => void
  onArquivar: (id: string) => void
  onReenviar: (c: Campanha) => void
  onExcluir: (id: string, titulo: string) => void
}) {
  const [filtroStatus, setFiltroStatus] = useState<StatusCampanha | 'todos'>('todos')

  const filtradas = filtroStatus === 'todos'
    ? campanhas
    : campanhas.filter(c => c.status === filtroStatus)

  const contadores: Record<string, number> = {
    todos: campanhas.length,
    enviada: campanhas.filter(c => c.status === 'enviada').length,
    erro: campanhas.filter(c => c.status === 'erro').length,
    arquivada: campanhas.filter(c => c.status === 'arquivada').length,
    cancelada: campanhas.filter(c => c.status === 'cancelada').length,
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {/* Filtros */}
        <div className="flex flex-wrap gap-1.5">
          {(['todos', 'enviada', 'erro', 'arquivada', 'cancelada'] as const).map(s => (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filtroStatus === s ? 'border-brand bg-brand text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}>
              {s === 'todos' ? 'Todas' : STATUS_LABEL[s as StatusCampanha]}
              {contadores[s] > 0 && <span className="ml-1.5 opacity-70">{contadores[s]}</span>}
            </button>
          ))}
        </div>

        <button onClick={onNova}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova campanha
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-200 border-t-brand" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-neutral-200 p-12 text-center">
          <p className="text-sm text-neutral-400">Nenhuma campanha encontrada</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">Campanha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 hidden sm:table-cell">Destinatários</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500">Enviados</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 hidden md:table-cell">Data</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtradas.map(c => (
                <tr key={c.id} className={`hover:bg-neutral-50 transition-colors ${c.status === 'arquivada' || c.status === 'cancelada' ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-800 truncate max-w-[200px]">{c.titulo}</p>
                    {c.templateTitulo && (
                      <p className="text-xs text-neutral-400 truncate">Template: {c.templateTitulo}</p>
                    )}
                    {c.erroMsg && (
                      <p className="text-xs text-red-500 truncate max-w-[200px]" title={c.erroMsg}>{c.erroMsg}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-neutral-500">
                      {SEGMENTO_LABEL[c.segmento]}
                      {c.tagFiltro && <span className="ml-1 rounded bg-neutral-100 px-1.5 py-0.5 font-mono">{c.tagFiltro}</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-neutral-700">{c.totalEnviados}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[c.status]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-neutral-400 hidden md:table-cell whitespace-nowrap">
                    {fmtData(c.enviadaAt ?? c.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(c.status === 'enviada' || c.status === 'erro') && (
                        <button onClick={() => onArquivar(c.id)}
                          className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs text-neutral-500 hover:bg-neutral-50 transition-colors">
                          Arquivar
                        </button>
                      )}
                      {c.status === 'arquivada' && (
                        <button onClick={() => onReenviar(c)}
                          className="rounded-lg border border-brand/40 px-2.5 py-1 text-xs text-brand hover:bg-brand/5 transition-colors">
                          Reenviar
                        </button>
                      )}
                      <button onClick={() => onExcluir(c.id, c.titulo)}
                        className="rounded p-1.5 text-neutral-300 hover:text-red-500 transition-colors">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function AdminCampanhasPage() {
  const { user } = useAuthContext()

  const [aba, setAba] = useState<'templates' | 'campanhas'>('templates')
  const [templates, setTemplates] = useState<CampanhaTemplate[]>([])
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [loadingCampanhas, setLoadingCampanhas] = useState(true)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)

  // Modais
  const [modalTemplate, setModalTemplate] = useState<{ aberto: boolean; editando: CampanhaTemplate | null }>({ aberto: false, editando: null })
  const [modalCampanha, setModalCampanha] = useState<{ aberto: boolean; templatePre: CampanhaTemplate | null; campanhaInicial: Campanha | null }>({ aberto: false, templatePre: null, campanhaInicial: null })

  const mostrarFeedback = useCallback((msg: string, ok: boolean) => {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 4000)
  }, [])

  const carregarTemplates = useCallback(async () => {
    setLoadingTemplates(true)
    const { templates: t } = await getCampanhasTemplates()
    setTemplates(t)
    setLoadingTemplates(false)
  }, [])

  const carregarCampanhas = useCallback(async () => {
    setLoadingCampanhas(true)
    const { campanhas: c } = await getCampanhas()
    setCampanhas(c)
    setLoadingCampanhas(false)
  }, [])

  useEffect(() => { carregarTemplates() }, [carregarTemplates])
  useEffect(() => { carregarCampanhas() }, [carregarCampanhas])
  useEffect(() => {
    getTagsUnicas().then(t => setTags(t))
  }, [])

  // ---- Templates ----

  async function handleSalvarTemplate(payload: any) {
    if (modalTemplate.editando) {
      const { error } = await editarTemplate(modalTemplate.editando.id, payload)
      if (!error) { carregarTemplates(); mostrarFeedback('Template atualizado!', true) }
      return { error }
    }
    const { template, error } = await criarTemplate({ ...payload, criadoPor: user?.id })
    if (!error && template) { carregarTemplates(); mostrarFeedback('Template criado!', true) }
    return { error }
  }

  async function handleExcluirTemplate(id: string, titulo: string) {
    if (!confirm(`Excluir o template "${titulo}"? Esta ação não pode ser desfeita.`)) return
    const { error } = await excluirTemplate(id)
    if (error) mostrarFeedback(error, false)
    else { carregarTemplates(); mostrarFeedback('Template excluído.', true) }
  }

  function handleUsarTemplate(t: CampanhaTemplate) {
    setModalCampanha({ aberto: true, templatePre: t, campanhaInicial: null })
    setAba('campanhas')
  }

  function handleReenviarArquivada(c: Campanha) {
    setModalCampanha({ aberto: true, templatePre: null, campanhaInicial: c })
    setAba('campanhas')
  }

  // ---- Campanhas ----

  async function handleSalvarRascunho(payload: any) {
    const { error } = await salvarRascunho({ ...payload, criadoPor: user?.id })
    if (!error) { carregarCampanhas(); mostrarFeedback('Rascunho salvo!', true) }
    return { error }
  }

  async function handleEnviarCampanha(payload: any) {
    const result = await enviarCampanha({ ...payload, criadoPor: user?.id })
    if (!result.error) {
      carregarCampanhas()
      mostrarFeedback(`Campanha enviada para ${result.enviados} destinatário(s)!`, true)
    }
    return result
  }

  async function handleEnviarRascunho(id: string) {
    if (!confirm('Enviar este rascunho agora?')) return
    const { enviados, error } = await enviarRascunho(id)
    if (error) mostrarFeedback(error, false)
    else { carregarCampanhas(); mostrarFeedback(`Enviado para ${enviados} destinatário(s)!`, true) }
  }

  async function handleArquivar(id: string) {
    const { error } = await arquivarCampanha(id)
    if (error) mostrarFeedback(error, false)
    else { setCampanhas(prev => prev.map(c => c.id === id ? { ...c, status: 'arquivada' } : c)) }
  }

  async function handleCancelar(id: string) {
    if (!confirm('Cancelar este rascunho?')) return
    const { error } = await cancelarCampanha(id)
    if (error) mostrarFeedback(error, false)
    else { setCampanhas(prev => prev.map(c => c.id === id ? { ...c, status: 'cancelada' } : c)) }
  }

  async function handleExcluirCampanha(id: string, titulo: string) {
    if (!confirm(`Excluir a campanha "${titulo}"?`)) return
    const { error } = await deleteCampanha(id)
    if (error) mostrarFeedback(error, false)
    else { setCampanhas(prev => prev.filter(c => c.id !== id)) }
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Campanhas</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Gerencie templates reutilizáveis e o envio de campanhas por e-mail</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${feedback.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {feedback.msg}
        </div>
      )}

      {/* Abas */}
      <div className="flex border-b border-neutral-200 mb-6">
        {([['templates', 'Templates', templates.length], ['campanhas', 'Campanhas', campanhas.length]] as const).map(([id, label, count]) => (
          <button key={id} onClick={() => setAba(id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors ${
              aba === id ? 'border-b-2 border-brand text-brand' : 'text-neutral-500 hover:text-neutral-700'
            }`}>
            {label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${aba === id ? 'bg-brand/10 text-brand' : 'bg-neutral-100 text-neutral-500'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {aba === 'templates' && (
        <AbaTemplates
          templates={templates}
          tags={tags}
          loading={loadingTemplates}
          onNovo={() => setModalTemplate({ aberto: true, editando: null })}
          onEditar={t => setModalTemplate({ aberto: true, editando: t })}
          onExcluir={handleExcluirTemplate}
          onUsarTemplate={handleUsarTemplate}
        />
      )}

      {aba === 'campanhas' && (
        <AbaCampanhas
          campanhas={campanhas}
          loading={loadingCampanhas}
          onNova={() => setModalCampanha({ aberto: true, templatePre: null, campanhaInicial: null })}
          onArquivar={handleArquivar}
          onReenviar={handleReenviarArquivada}
          onExcluir={handleExcluirCampanha}
        />
      )}

      {/* Modais */}
      {modalTemplate.aberto && (
        <ModalTemplate
          key={modalTemplate.editando?.id ?? 'novo-template'}
          inicial={modalTemplate.editando}
          tags={tags}
          onClose={() => setModalTemplate({ aberto: false, editando: null })}
          onSalvar={handleSalvarTemplate}
        />
      )}

      {modalCampanha.aberto && (
        <ModalCampanha
          key={modalCampanha.campanhaInicial?.id ?? modalCampanha.templatePre?.id ?? 'nova-campanha'}
          templates={templates}
          tags={tags}
          templatePre={modalCampanha.templatePre}
          inicial={modalCampanha.campanhaInicial}
          usuarioId={user?.id}
          onClose={() => setModalCampanha({ aberto: false, templatePre: null, campanhaInicial: null })}
          onSalvarRascunho={handleSalvarRascunho}
          onEnviar={handleEnviarCampanha}
        />
      )}
    </div>
  )
}
