import { useEffect, useState } from 'react'
import Header from '@components/layout/Header'
import Footer from '@components/layout/Footer'
import { getConteudoPorSecao } from '@features/admin/services/site.admin.service'
import type { ConteudoMap } from '@features/admin/services/site.admin.service'

const DEFAULTS: ConteudoMap = {
  contato_telefone: '(11) 99999-9999',
  contato_email: 'contato@a2tech.com.br',
  contato_whatsapp: '5511999999999',
  contato_endereco: 'Av. Paulista, 1000',
  contato_bairro: 'Bela Vista',
  contato_cidade: 'São Paulo',
  contato_estado: 'SP',
  contato_cep: '01310-100',
  contato_horario: 'Segunda a Sexta, 9h às 18h',
}

export default function ContatosPage() {
  const [conteudo, setConteudo] = useState<ConteudoMap>(DEFAULTS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getConteudoPorSecao('contatos').then(({ mapa }) => {
      if (Object.keys(mapa).length > 0) setConteudo({ ...DEFAULTS, ...mapa })
      setIsLoading(false)
    })
  }, [])

  const c = conteudo
  const whatsappLink = `https://wa.me/${c.contato_whatsapp}`
  const enderecoCompleto = `${c.contato_endereco}, ${c.contato_bairro} — ${c.contato_cidade}/${c.contato_estado}`
  const mapsLink = `https://maps.google.com/?q=${encodeURIComponent(enderecoCompleto)}`

  const CARDS = [
    {
      titulo: 'Telefone',
      valor: c.contato_telefone,
      link: `tel:${c.contato_telefone.replace(/\D/g, '')}`,
      linkLabel: 'Ligar agora',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      cor: 'brand',
    },
    {
      titulo: 'E-mail',
      valor: c.contato_email,
      link: `mailto:${c.contato_email}`,
      linkLabel: 'Enviar e-mail',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      cor: 'blue',
    },
    {
      titulo: 'WhatsApp',
      valor: c.contato_telefone,
      link: whatsappLink,
      linkLabel: 'Abrir WhatsApp',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      cor: 'green',
    },
    {
      titulo: 'Endereço',
      valor: enderecoCompleto,
      link: mapsLink,
      linkLabel: 'Ver no mapa',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      cor: 'orange',
    },
  ]

  const corClasses: Record<string, string> = {
    brand:  'bg-brand-100 text-brand',
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header cartItemsCount={0} />

      <main className="flex-1">
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 py-20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white" />
          </div>
          <div className="container relative mx-auto px-4 text-center">
            <span className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              Fale Conosco
            </span>
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Entre em Contato
            </h1>
            <p className="mx-auto max-w-xl text-lg text-brand-200">
              Estamos prontos para atender você. Escolha o canal de sua preferência.
            </p>
          </div>
        </section>

        {/* ===== CARDS DE CONTATO ===== */}
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {CARDS.map(card => (
                <div key={card.titulo}
                  className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${corClasses[card.cor]}`}>
                    {card.icon}
                  </div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {card.titulo}
                  </p>
                  {isLoading ? (
                    <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100 my-1" />
                  ) : (
                    <p className="text-sm font-medium text-neutral-800 flex-1">{card.valor}</p>
                  )}
                  <a
                    href={card.link}
                    target={card.titulo === 'WhatsApp' || card.titulo === 'Endereço' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                  >
                    {card.linkLabel}
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HORÁRIO + FORMULÁRIO ===== */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">

              {/* Horário e informações */}
              <div>
                <h2 className="mb-6 text-2xl font-bold text-neutral-800">Horário de Atendimento</h2>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">Horário Comercial</p>
                      {isLoading ? (
                        <div className="h-3 w-40 animate-pulse rounded bg-neutral-200 mt-1" />
                      ) : (
                        <p className="text-sm text-neutral-500">{c.contato_horario}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">Resposta Rápida</p>
                      <p className="text-sm text-neutral-500">Retornamos em até 2 horas úteis</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">Endereço</p>
                      {isLoading ? (
                        <div className="h-3 w-48 animate-pulse rounded bg-neutral-200 mt-1" />
                      ) : (
                        <p className="text-sm text-neutral-500">
                          {c.contato_endereco}, {c.contato_bairro}<br />
                          {c.contato_cidade} — {c.contato_estado}, {c.contato_cep}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* WhatsApp destaque */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center gap-3 rounded-2xl bg-green-600 px-6 py-4 text-white hover:bg-green-700 transition-colors"
                >
                  <svg className="h-7 w-7 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Falar pelo WhatsApp</p>
                    <p className="text-sm text-green-200">Atendimento rápido e direto</p>
                  </div>
                  <svg className="ml-auto h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Formulário de contato */}
              <div>
                <h2 className="mb-6 text-2xl font-bold text-neutral-800">Envie uma Mensagem</h2>
                <FormContato email={c.contato_email} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// =====================================================
// FORMULÁRIO DE CONTATO (link mailto)
// =====================================================
function FormContato({ email }: { email: string }) {
  const [nome, setNome] = useState('')
  const [emailUsuario, setEmailUsuario] = useState('')
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [enviado, setEnviado] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const corpo = `Nome: ${nome}\nE-mail: ${emailUsuario}\n\n${mensagem}`
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(assunto || 'Contato via site')}&body=${encodeURIComponent(corpo)}`
    window.location.href = mailtoLink
    setEnviado(true)
    setTimeout(() => setEnviado(false), 5000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Seu nome *</label>
          <input required value={nome} onChange={e => setNome(e.target.value)}
            placeholder="João Silva"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Seu e-mail *</label>
          <input required type="email" value={emailUsuario} onChange={e => setEmailUsuario(e.target.value)}
            placeholder="joao@empresa.com"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Assunto</label>
        <input value={assunto} onChange={e => setAssunto(e.target.value)}
          placeholder="Ex: Orçamento de cintas de elevação"
          className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Mensagem *</label>
        <textarea required value={mensagem} onChange={e => setMensagem(e.target.value)}
          rows={5} placeholder="Descreva como podemos ajudar..."
          className="w-full resize-none rounded-xl border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
      </div>

      {enviado && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Seu cliente de e-mail foi aberto com a mensagem preenchida!
        </div>
      )}

      <button type="submit"
        className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-colors">
        Enviar Mensagem
      </button>

      <p className="text-center text-xs text-neutral-400">
        Ao enviar, seu aplicativo de e-mail será aberto para confirmar o envio.
      </p>
    </form>
  )
}
