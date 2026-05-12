import Header from '@components/layout/Header'
import Footer from '@components/layout/Footer'
import { useCart } from '@/features/cart/contexts/CartContext'

const secoes = [
  {
    titulo: '1. Aceitação dos Termos',
    texto: 'Ao acessar e utilizar o site a2brasilsupplies.com.br, você concorda com estes Termos de Uso. Se não concordar, não utilize o site.',
  },
  {
    titulo: '2. Uso do Site',
    texto: 'O site é destinado exclusivamente à compra de equipamentos de elevação e amarração por pessoas físicas e jurídicas maiores de 18 anos. É proibido qualquer uso fraudulento, automatizado (bots) ou que prejudique outros usuários.',
  },
  {
    titulo: '3. Cadastro e Conta',
    texto: 'Você é responsável pela veracidade dos dados cadastrados e pela confidencialidade da sua senha. Notifique-nos imediatamente em caso de uso não autorizado da sua conta.',
  },
  {
    titulo: '4. Pedidos e Pagamentos',
    texto: 'Ao finalizar um pedido, você realiza uma oferta de compra sujeita à confirmação de disponibilidade de estoque e aprovação do pagamento. O contrato de compra e venda se perfaz com a confirmação do pagamento.',
  },
  {
    titulo: '5. Preços e Disponibilidade',
    texto: 'Os preços podem ser alterados sem aviso prévio. Erros de preço evidentes não obrigam a A2 Brasil Supplies a honrar a venda. A disponibilidade de estoque é informativa e pode variar.',
  },
  {
    titulo: '6. Entrega',
    texto: 'Os prazos de entrega são estimados e podem variar conforme transportadora e localidade. A A2 Brasil Supplies não é responsável por atrasos causados por eventos fora do seu controle (greves, desastres naturais, etc.).',
  },
  {
    titulo: '7. Propriedade Intelectual',
    texto: 'Todo o conteúdo do site (textos, imagens, logos, design) é de propriedade da A2 Brasil Supplies ou de seus licenciantes e protegido por direitos autorais. É proibida a reprodução sem autorização.',
  },
  {
    titulo: '8. Limitação de Responsabilidade',
    texto: 'A A2 Brasil Supplies não se responsabiliza por danos indiretos, incidentais ou consequentes decorrentes do uso do site ou dos produtos, salvo nos casos previstos no Código de Defesa do Consumidor.',
  },
  {
    titulo: '9. Foro',
    texto: 'Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias oriundas destes Termos, com renúncia a qualquer outro.',
  },
]

export default function TermosUsoPage() {
  const { itemsCount } = useCart()

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex-1 bg-neutral-50">
        <div className="bg-neutral-900 py-14">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-white">Termos de Uso</h1>
            <p className="mt-2 text-neutral-400">Atualizado em maio de 2026</p>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-14">
          <div className="space-y-8">
            {secoes.map((s) => (
              <div key={s.titulo}>
                <h2 className="mb-2 text-lg font-bold text-neutral-900">{s.titulo}</h2>
                <p className="text-sm text-neutral-600 leading-relaxed">{s.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
