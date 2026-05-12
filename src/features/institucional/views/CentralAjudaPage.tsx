import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '@components/layout/Header'
import Footer from '@components/layout/Footer'
import { useCart } from '@/features/cart/contexts/CartContext'

const faqs = [
  {
    pergunta: 'Como acompanho meu pedido?',
    resposta: 'Acesse "Minha Conta" > "Meus Pedidos" para ver o status atualizado. Você também pode usar a página "Rastrear Pedido" com o número do pedido.',
  },
  {
    pergunta: 'Qual o prazo de entrega?',
    resposta: 'O prazo varia conforme a região. No checkout, antes de finalizar a compra, você visualiza o prazo estimado para o seu CEP.',
  },
  {
    pergunta: 'Como solicitar nota fiscal?',
    resposta: 'A nota fiscal é emitida automaticamente após a confirmação do pagamento e enviada para o e-mail cadastrado.',
  },
  {
    pergunta: 'Os produtos têm garantia?',
    resposta: 'Sim. Todos os produtos possuem garantia do fabricante contra defeitos de fabricação. Consulte a ficha técnica de cada produto para o prazo específico.',
  },
  {
    pergunta: 'Posso cancelar meu pedido?',
    resposta: 'Pedidos podem ser cancelados antes do envio. Entre em contato pela Central de Atendimento o mais rápido possível após a compra.',
  },
  {
    pergunta: 'Quais formas de pagamento são aceitas?',
    resposta: 'Aceitamos cartões de crédito e débito via Stripe. As parcelas variam conforme o valor do pedido.',
  },
]

function FaqItem({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-neutral-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-neutral-900 hover:text-brand"
      >
        {pergunta}
        <svg
          className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <p className="pb-4 text-sm text-neutral-600 leading-relaxed">{resposta}</p>}
    </div>
  )
}

export default function CentralAjudaPage() {
  const { itemsCount } = useCart()

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex-1 bg-neutral-50">
        <div className="bg-neutral-900 py-14">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-white">Central de Ajuda</h1>
            <p className="mt-2 text-neutral-400">Encontre respostas rápidas para as dúvidas mais comuns</p>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-14">
          <div className="rounded-xl border border-neutral-200 bg-white px-6 py-2">
            {faqs.map((f) => <FaqItem key={f.pergunta} {...f} />)}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: '📞', titulo: 'Telefone', desc: '(11) 3333-4444', sub: 'Seg–Sex, 8h às 18h', href: 'tel:+551133334444' },
              { icon: '✉️', titulo: 'E-mail', desc: 'contato@a2brasilsupplies.com.br', sub: 'Resposta em até 24h', href: 'mailto:contato@a2brasilsupplies.com.br' },
              { icon: '📦', titulo: 'Rastrear Pedido', desc: 'Acompanhe seu pedido', sub: 'Acesso direto ao status', href: '/rastrear-pedido' },
            ].map((canal) => (
              <a
                key={canal.titulo}
                href={canal.href}
                className="flex flex-col items-center rounded-xl border border-neutral-200 bg-white p-5 text-center transition-shadow hover:shadow-md"
              >
                <span className="mb-2 text-2xl">{canal.icon}</span>
                <p className="font-semibold text-neutral-900">{canal.titulo}</p>
                <p className="mt-1 text-sm text-brand">{canal.desc}</p>
                <p className="text-xs text-neutral-400">{canal.sub}</p>
              </a>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Não encontrou o que procura?{' '}
            <Link to="/contatos" className="text-brand hover:underline">Fale conosco</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
