import Header from '@components/layout/Header'
import Footer from '@components/layout/Footer'
import { useCart } from '@/features/cart/contexts/CartContext'

const vagas = [
  { cargo: 'Consultor Técnico de Vendas', area: 'Comercial', regime: 'CLT · São Paulo/SP' },
  { cargo: 'Analista de Logística', area: 'Operações', regime: 'CLT · São Paulo/SP' },
  { cargo: 'Assistente Administrativo', area: 'Administrativo', regime: 'CLT · São Paulo/SP' },
]

export default function TrabalheConoscoPage() {
  const { itemsCount } = useCart()

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex-1 bg-neutral-50">
        <div className="bg-neutral-900 py-14">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-white">Trabalhe Conosco</h1>
            <p className="mt-2 text-neutral-400">
              Faça parte de um time especializado em soluções de elevação e amarração
            </p>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-14">
          <p className="mb-10 text-neutral-600 leading-relaxed">
            Na A2 Brasil Supplies valorizamos profissionais comprometidos com segurança, qualidade e
            atendimento ao cliente. Se você tem interesse no setor industrial e quer crescer em uma
            empresa em expansão, confira as oportunidades abaixo ou envie seu currículo.
          </p>

          <h2 className="mb-6 text-xl font-bold text-neutral-900">Vagas Abertas</h2>
          <div className="space-y-4">
            {vagas.map((v) => (
              <div key={v.cargo} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-5">
                <div>
                  <p className="font-semibold text-neutral-900">{v.cargo}</p>
                  <p className="mt-0.5 text-sm text-neutral-500">{v.area} · {v.regime}</p>
                </div>
                <a
                  href={`mailto:contato@a2brasilsupplies.com.br?subject=Candidatura: ${v.cargo}`}
                  className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
                >
                  Candidatar
                </a>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-2 font-bold text-neutral-900">Banco de Talentos</h2>
            <p className="mb-4 text-sm text-neutral-600">
              Não encontrou uma vaga adequada? Envie seu currículo e entraremos em contato quando
              surgir uma oportunidade alinhada ao seu perfil.
            </p>
            <a
              href="mailto:contato@a2brasilsupplies.com.br?subject=Currículo - Banco de Talentos"
              className="inline-block rounded-lg border border-brand px-5 py-2.5 text-sm font-semibold text-brand hover:bg-brand/5"
            >
              Enviar currículo
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
