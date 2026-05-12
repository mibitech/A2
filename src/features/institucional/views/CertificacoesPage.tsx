import { Link } from 'react-router-dom'
import Header from '@components/layout/Header'
import Footer from '@components/layout/Footer'
import { useCart } from '@/features/cart/contexts/CartContext'

const certs = [
  {
    sigla: 'ABNT NBR 11900',
    titulo: 'Acessórios de Elevação',
    desc: 'Norma brasileira que estabelece requisitos para acessórios de elevação — eslingas, manilhas, ganchos e correntes.',
  },
  {
    sigla: 'NR-11',
    titulo: 'Operações de Carga',
    desc: 'Regulamentação do MTE sobre transporte, movimentação, armazenagem e manuseio de materiais.',
  },
  {
    sigla: 'EN 1492 / EN 818',
    titulo: 'Norma Europeia',
    desc: 'Padrão europeu de segurança para eslingas têxteis e correntes de aço — adotado como referência de qualidade.',
  },
  {
    sigla: 'ISO 9001',
    titulo: 'Gestão da Qualidade',
    desc: 'Nossos fornecedores mantêm certificação ISO 9001, garantindo processos padronizados e rastreáveis.',
  },
]

export default function CertificacoesPage() {
  const { itemsCount } = useCart()

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex-1 bg-neutral-50">
        <div className="bg-neutral-900 py-14">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-white">Certificações</h1>
            <p className="mt-2 text-neutral-400">
              Produtos certificados e em conformidade com as normas brasileiras e internacionais
            </p>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 py-14">
          <p className="mb-10 text-neutral-600 leading-relaxed">
            A A2 Brasil Supplies comercializa apenas produtos que atendem às normas técnicas vigentes.
            Cada item do nosso catálogo é acompanhado de certificado de conformidade e laudo técnico,
            garantindo segurança total nas suas operações de elevação e amarração.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {certs.map((c) => (
              <div key={c.sigla} className="rounded-xl border border-neutral-200 bg-white p-6">
                <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  {c.sigla}
                </span>
                <h3 className="mt-3 text-lg font-bold text-neutral-900">{c.titulo}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-brand/20 bg-brand/5 p-6 text-center">
            <h2 className="mb-2 text-lg font-bold text-neutral-900">Precisa de documentação técnica?</h2>
            <p className="mb-4 text-sm text-neutral-600">
              Solicite certificados e laudos dos produtos pelo nosso canal de atendimento.
            </p>
            <Link
              to="/contatos"
              className="inline-block rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand/90"
            >
              Falar com a equipe técnica
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
