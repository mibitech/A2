import { useEffect, useState } from 'react'
import Header from '@components/layout/Header'
import Footer from '@components/layout/Footer'
import { getConteudoPorSecao, getSobreGaleria } from '@features/admin/services/site.admin.service'
import type { ConteudoMap, SobreImagem } from '@features/admin/services/site.admin.service'

const DEFAULTS: ConteudoMap = {
  sobre_titulo: 'Sobre a A2 Brasil Supplies',
  sobre_subtitulo: 'Especialistas em equipamentos de elevação e amarração',
  sobre_historia:
    'A A2 Brasil Supplies nasceu da necessidade de oferecer ao mercado brasileiro equipamentos de elevação e amarração de alta qualidade, com certificação e suporte técnico especializado.',
  sobre_missao:
    'Fornecer soluções de elevação e amarração seguras, certificadas e de alta qualidade para a indústria brasileira.',
  sobre_visao:
    'Ser reconhecida como a principal distribuidora de equipamentos de elevação do Brasil.',
  sobre_valores:
    'Segurança, Qualidade, Transparência e Comprometimento com o cliente.',
  sobre_stat_clientes: '500+',
  sobre_stat_anos: '20+',
  sobre_stat_pedidos: '10.000+',
  sobre_stat_estados: '27',
}

const STATS = [
  { key: 'sobre_stat_clientes', label: 'Clientes Atendidos' },
  { key: 'sobre_stat_anos',     label: 'Anos de Mercado' },
  { key: 'sobre_stat_pedidos',  label: 'Pedidos Entregues' },
  { key: 'sobre_stat_estados',  label: 'Estados Atendidos' },
]

export default function SobreNosPage() {
  const [conteudo, setConteudo] = useState<ConteudoMap>(DEFAULTS)
  const [galeria, setGaleria] = useState<SobreImagem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ mapa }, { imagens }] = await Promise.all([
        getConteudoPorSecao('sobre'),
        getSobreGaleria(),
      ])
      if (Object.keys(mapa).length > 0) setConteudo({ ...DEFAULTS, ...mapa })
      setGaleria(imagens.filter(i => i.ativo))
      setIsLoading(false)
    }
    load()
  }, [])

  const c = conteudo

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header cartItemsCount={0} />

      <main className="flex-1">
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 py-24">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white" />
          </div>
          <div className="container relative mx-auto px-4 text-center">
            <span className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              Quem Somos
            </span>
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {c.sobre_titulo}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-brand-200">
              {c.sobre_subtitulo}
            </p>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="border-b border-neutral-100 bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map(stat => (
                <div key={stat.key} className="text-center">
                  <p className="text-3xl font-bold text-brand sm:text-4xl">
                    {isLoading ? '—' : c[stat.key]}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HISTÓRIA ===== */}
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 text-2xl font-bold text-neutral-800 sm:text-3xl">Nossa História</h2>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
                  <div className="h-4 w-4/6 animate-pulse rounded bg-neutral-200" />
                </div>
              ) : (
                <p className="text-base leading-relaxed text-neutral-600">{c.sobre_historia}</p>
              )}
            </div>
          </div>
        </section>

        {/* ===== MISSÃO / VISÃO / VALORES ===== */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="mb-10 text-center text-2xl font-bold text-neutral-800 sm:text-3xl">
              Nossos Princípios
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  key: 'sobre_missao',
                  titulo: 'Missão',
                  icon: (
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  ),
                  cor: 'brand',
                },
                {
                  key: 'sobre_visao',
                  titulo: 'Visão',
                  icon: (
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ),
                  cor: 'blue',
                },
                {
                  key: 'sobre_valores',
                  titulo: 'Valores',
                  icon: (
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ),
                  cor: 'green',
                },
              ].map(item => (
                <div key={item.key}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl
                    ${item.cor === 'brand' ? 'bg-brand-100 text-brand'
                    : item.cor === 'blue' ? 'bg-blue-50 text-blue-600'
                    : 'bg-green-50 text-green-600'}`}>
                    {item.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-neutral-800">{item.titulo}</h3>
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
                      <div className="h-3 w-4/5 animate-pulse rounded bg-neutral-100" />
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-neutral-600">{c[item.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== GALERIA ===== */}
        {galeria.length > 0 && (
          <section className="py-16 bg-neutral-50">
            <div className="container mx-auto px-4">
              <h2 className="mb-8 text-center text-2xl font-bold text-neutral-800 sm:text-3xl">
                Nossa Estrutura
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {galeria.map(img => (
                  <div key={img.id}
                    className="group overflow-hidden rounded-2xl bg-neutral-200">
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-52"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== CTA ===== */}
        <section className="bg-brand-900 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
              Pronto para trabalhar com a gente?
            </h2>
            <p className="mb-8 text-brand-200">
              Entre em contato e descubra como podemos ajudar a sua empresa.
            </p>
            <a
              href="/contatos"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand hover:bg-brand-50 transition-colors"
            >
              Fale Conosco
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
