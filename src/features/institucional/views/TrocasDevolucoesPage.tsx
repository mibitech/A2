import { Link } from 'react-router-dom'
import Header from '@components/layout/Header'
import Footer from '@components/layout/Footer'
import { useCart } from '@/features/cart/contexts/CartContext'

const passos = [
  { num: '1', titulo: 'Entre em contato', desc: 'Acione nossa Central de Atendimento em até 7 dias após o recebimento, informando o número do pedido e o motivo da solicitação.' },
  { num: '2', titulo: 'Avaliação', desc: 'Nossa equipe avalia a solicitação e confirma a elegibilidade dentro de 1 dia útil.' },
  { num: '3', titulo: 'Envio do produto', desc: 'Após aprovação, você envia o produto no mesmo estado em que foi recebido, com embalagem original.' },
  { num: '4', titulo: 'Reembolso ou troca', desc: 'Após recebermos e inspecionarmos o produto, processamos o reembolso (5–10 dias úteis) ou enviamos o produto substituto.' },
]

export default function TrocasDevolucoesPage() {
  const { itemsCount } = useCart()

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex-1 bg-neutral-50">
        <div className="bg-neutral-900 py-14">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-white">Trocas e Devoluções</h1>
            <p className="mt-2 text-neutral-400">Nossa política é simples e transparente</p>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-14">
          <div className="mb-10 grid gap-4 md:grid-cols-3">
            {[
              { titulo: '7 dias', sub: 'para solicitar troca ou devolução após o recebimento' },
              { titulo: '100%', sub: 'reembolso para produtos com defeito de fabricação' },
              { titulo: '1 dia útil', sub: 'para resposta após o acionamento' },
            ].map((stat) => (
              <div key={stat.titulo} className="rounded-xl border border-neutral-200 bg-white p-5 text-center">
                <p className="text-3xl font-bold text-brand">{stat.titulo}</p>
                <p className="mt-1 text-sm text-neutral-500">{stat.sub}</p>
              </div>
            ))}
          </div>

          <h2 className="mb-6 text-xl font-bold text-neutral-900">Como Funciona</h2>
          <div className="space-y-4">
            {passos.map((p) => (
              <div key={p.num} className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {p.num}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{p.titulo}</p>
                  <p className="mt-1 text-sm text-neutral-600 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-3 font-bold text-neutral-900">Situações Elegíveis</h2>
            <ul className="space-y-2 text-sm text-neutral-600">
              {[
                'Produto com defeito de fabricação comprovado',
                'Produto diferente do descrito ou fotografado no site',
                'Produto danificado no transporte (com registro fotográfico)',
                'Desistência da compra dentro de 7 dias do recebimento (CDC Art. 49)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Dúvidas?{' '}
            <Link to="/ajuda" className="text-brand hover:underline">Central de Ajuda</Link>
            {' '}ou{' '}
            <Link to="/contatos" className="text-brand hover:underline">fale conosco</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
