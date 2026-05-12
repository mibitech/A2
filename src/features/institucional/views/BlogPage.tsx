import Header from '@components/layout/Header'
import Footer from '@components/layout/Footer'
import { useCart } from '@/features/cart/contexts/CartContext'

const posts = [
  {
    tag: 'Segurança',
    titulo: 'Como escolher a eslinga certa para cada operação',
    resumo: 'Entenda os critérios técnicos — carga de trabalho, ângulo de içamento e tipo de material — que determinam a eslinga ideal para cada situação.',
    data: 'Maio 2026',
  },
  {
    tag: 'Normas',
    titulo: 'NR-11: o que muda para sua operação em 2026',
    resumo: 'Atualizações recentes na NR-11 afetam diretamente quem trabalha com movimentação de cargas. Saiba o que sua empresa precisa adequar.',
    data: 'Abril 2026',
  },
  {
    tag: 'Dicas',
    titulo: 'Inspeção de cintas de amarração: checklist completo',
    resumo: 'Um guia prático para inspecionar cintas antes de cada uso, identificar sinais de desgaste e saber quando substituir.',
    data: 'Março 2026',
  },
]

export default function BlogPage() {
  const { itemsCount } = useCart()

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex-1 bg-neutral-50">
        <div className="bg-neutral-900 py-14">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-white">Blog</h1>
            <p className="mt-2 text-neutral-400">
              Conteúdo técnico sobre elevação, amarração e segurança industrial
            </p>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 py-14">
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.titulo} className="rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                    {post.tag}
                  </span>
                  <span className="text-xs text-neutral-400">{post.data}</span>
                </div>
                <h2 className="mb-2 text-xl font-bold text-neutral-900">{post.titulo}</h2>
                <p className="text-sm text-neutral-600 leading-relaxed">{post.resumo}</p>
                <p className="mt-4 text-xs text-neutral-400 italic">Em breve — artigo completo disponível</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-brand/20 bg-brand/5 p-6 text-center">
            <h2 className="mb-1 font-bold text-neutral-900">Quer receber novos conteúdos?</h2>
            <p className="mb-4 text-sm text-neutral-600">Fique por dentro das novidades sobre segurança e equipamentos.</p>
            <a
              href="mailto:contato@a2brasilsupplies.com.br?subject=Quero receber novidades do blog"
              className="inline-block rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand/90"
            >
              Me avise por e-mail
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
