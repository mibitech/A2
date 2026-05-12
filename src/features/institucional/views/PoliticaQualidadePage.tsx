import Header from '@components/layout/Header'
import Footer from '@components/layout/Footer'
import { useCart } from '@/features/cart/contexts/CartContext'

const pilares = [
  {
    titulo: 'Segurança em Primeiro Lugar',
    desc: 'Nenhum produto é comercializado sem laudo técnico e certificado de conformidade. A segurança do operador é inegociável.',
  },
  {
    titulo: 'Rastreabilidade Total',
    desc: 'Cada lote tem rastreabilidade completa — do fabricante até a entrega ao cliente — garantindo histórico e controle.',
  },
  {
    titulo: 'Melhoria Contínua',
    desc: 'Revisamos periodicamente nossos processos de compra, estoque e entrega para elevar continuamente o nível de serviço.',
  },
  {
    titulo: 'Conformidade com Normas',
    desc: 'Todos os produtos seguem normas ABNT, NR-11 e referências europeias EN aplicáveis ao segmento de elevação.',
  },
]

export default function PoliticaQualidadePage() {
  const { itemsCount } = useCart()

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex-1 bg-neutral-50">
        <div className="bg-neutral-900 py-14">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-white">Política de Qualidade</h1>
            <p className="mt-2 text-neutral-400">
              Nosso compromisso com a excelência e a segurança em cada produto
            </p>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 py-14">
          <div className="mb-10 rounded-xl border-l-4 border-brand bg-white p-6 shadow-sm">
            <p className="text-lg text-neutral-700 leading-relaxed italic">
              "A A2 Brasil Supplies está comprometida em fornecer equipamentos de elevação e amarração
              seguros, certificados e de alta qualidade, atendendo às necessidades dos nossos clientes
              com responsabilidade, transparência e melhoria contínua."
            </p>
            <p className="mt-3 text-sm font-semibold text-neutral-500">— Declaração de Qualidade A2 Brasil Supplies</p>
          </div>

          <h2 className="mb-6 text-xl font-bold text-neutral-900">Nossos Pilares de Qualidade</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {pilares.map((p, i) => (
              <div key={i} className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">{p.titulo}</h3>
                  <p className="mt-1 text-sm text-neutral-600 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-neutral-900">Compromisso com o Cliente</h2>
            <ul className="space-y-2 text-sm text-neutral-600">
              {[
                'Prazo de entrega cumprido conforme informado no pedido',
                'Produtos embalados com proteção adequada para transporte',
                'Suporte técnico disponível para dúvidas sobre aplicação e capacidade',
                'Política de troca para produtos com defeito de fabricação',
                'Documentação completa disponível mediante solicitação',
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
        </div>
      </main>

      <Footer />
    </div>
  )
}
