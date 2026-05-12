import Header from '@components/layout/Header'
import Footer from '@components/layout/Footer'
import { useCart } from '@/features/cart/contexts/CartContext'

const secoes = [
  {
    titulo: '1. Quem somos',
    texto: 'A2 Brasil Supplies LTDA, inscrita no CNPJ sob nº XX.XXX.XXX/0001-XX, com sede em São Paulo/SP, é a controladora dos dados pessoais coletados neste site.',
  },
  {
    titulo: '2. Quais dados coletamos',
    texto: 'Coletamos nome completo, e-mail, CPF/CNPJ, telefone e endereço de entrega para processamento dos pedidos. Também coletamos dados de navegação (cookies técnicos) para manter a sessão ativa.',
  },
  {
    titulo: '3. Como usamos seus dados',
    texto: 'Seus dados são usados para: (a) processar e entregar seus pedidos; (b) enviar confirmações de compra por e-mail; (c) cumprir obrigações fiscais e legais; (d) enviar comunicações de marketing, somente com seu consentimento.',
  },
  {
    titulo: '4. Compartilhamento de dados',
    texto: 'Seus dados podem ser compartilhados com: (a) transportadoras, para entrega do pedido; (b) processadores de pagamento (Stripe), para cobrança segura; (c) autoridades públicas, quando exigido por lei.',
  },
  {
    titulo: '5. Seus direitos (LGPD)',
    texto: 'Nos termos da Lei 13.709/2020 (LGPD), você tem direito a: confirmar a existência de tratamento, acessar seus dados, corrigir dados incompletos, solicitar anonimização ou exclusão, revogar consentimento e obter informações sobre compartilhamento.',
  },
  {
    titulo: '6. Segurança',
    texto: 'Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou divulgação indevida, incluindo criptografia em trânsito (HTTPS) e controle de acesso.',
  },
  {
    titulo: '7. Retenção',
    texto: 'Mantemos seus dados pelo período necessário para cumprir a finalidade da coleta e obrigações legais (em geral, 5 anos para dados fiscais).',
  },
  {
    titulo: '8. Contato',
    texto: 'Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato com nosso encarregado (DPO) pelo e-mail: privacidade@a2brasilsupplies.com.br.',
  },
]

export default function PoliticaPrivacidadePage() {
  const { itemsCount } = useCart()

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex-1 bg-neutral-50">
        <div className="bg-neutral-900 py-14">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-white">Política de Privacidade</h1>
            <p className="mt-2 text-neutral-400">Atualizada em maio de 2026 · Em conformidade com a LGPD</p>
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
