import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { Button, Card } from '@components/ui'
import { Header, Footer } from '@components/layout'

// =====================================================
// FRETE MOCKADO
// =====================================================

interface OpcaoFrete {
  id: string
  nome: string
  prazo: string
  valor: number
}

function calcularFreteMock(cep: string, subtotal: number): OpcaoFrete[] {
  const prefix = parseInt(cep.replace(/\D/g, '').slice(0, 2))

  // Frete grátis acima de R$ 500
  const gratis = subtotal >= 500

  // Regiões aproximadas por faixa de CEP
  let pac: number
  let sedex: number

  if (prefix >= 1 && prefix <= 19) {
    // São Paulo capital / ABCD
    pac = gratis ? 0 : 14.9
    sedex = gratis ? 0 : 29.9
  } else if (prefix >= 20 && prefix <= 28) {
    // Rio de Janeiro
    pac = gratis ? 0 : 19.9
    sedex = gratis ? 0 : 38.9
  } else if (prefix >= 29 && prefix <= 39) {
    // ES / MG
    pac = gratis ? 0 : 22.9
    sedex = gratis ? 0 : 42.9
  } else if (prefix >= 40 && prefix <= 48) {
    // BA / SE
    pac = gratis ? 0 : 26.9
    sedex = gratis ? 0 : 49.9
  } else if (prefix >= 49 && prefix <= 65) {
    // Centro-Oeste / Norte
    pac = gratis ? 0 : 32.9
    sedex = gratis ? 0 : 58.9
  } else if (prefix >= 66 && prefix <= 69) {
    // Pará / Amazônia
    pac = gratis ? 0 : 38.9
    sedex = gratis ? 0 : 68.9
  } else if (prefix >= 70 && prefix <= 76) {
    // Brasília / GO
    pac = gratis ? 0 : 24.9
    sedex = gratis ? 0 : 44.9
  } else if (prefix >= 77 && prefix <= 79) {
    // MT / MS
    pac = gratis ? 0 : 29.9
    sedex = gratis ? 0 : 52.9
  } else if (prefix >= 80 && prefix <= 87) {
    // Paraná
    pac = gratis ? 0 : 16.9
    sedex = gratis ? 0 : 32.9
  } else if (prefix >= 88 && prefix <= 89) {
    // Santa Catarina
    pac = gratis ? 0 : 17.9
    sedex = gratis ? 0 : 34.9
  } else {
    // Rio Grande do Sul / demais
    pac = gratis ? 0 : 18.9
    sedex = gratis ? 0 : 36.9
  }

  const opcoes: OpcaoFrete[] = [
    {
      id: 'pac',
      nome: 'PAC (Correios)',
      prazo: '5 a 8 dias úteis',
      valor: pac,
    },
    {
      id: 'sedex',
      nome: 'SEDEX (Correios)',
      prazo: '2 a 3 dias úteis',
      valor: sedex,
    },
  ]

  return opcoes
}

// =====================================================
// COMPONENTE: CÁLCULO DE FRETE
// =====================================================

interface CalcFreteProps {
  subtotal: number
  onFreteSelect: (opcao: OpcaoFrete | null) => void
  freteSelecionado: OpcaoFrete | null
}

function CalcFrete({ subtotal, onFreteSelect, freteSelecionado }: CalcFreteProps) {
  const [cep, setCep] = useState('')
  const [calculando, setCalculando] = useState(false)
  const [opcoes, setOpcoes] = useState<OpcaoFrete[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  function formatarCep(valor: string) {
    const nums = valor.replace(/\D/g, '').slice(0, 8)
    if (nums.length > 5) return `${nums.slice(0, 5)}-${nums.slice(5)}`
    return nums
  }

  async function handleCalcular() {
    const nums = cep.replace(/\D/g, '')
    if (nums.length < 8) { setErro('Informe um CEP válido com 8 dígitos'); return }
    setErro(null)
    setCalculando(true)
    onFreteSelect(null)
    // Simula latência de API
    await new Promise(r => setTimeout(r, 800))
    const resultado = calcularFreteMock(nums, subtotal)
    setOpcoes(resultado)
    // Seleciona automaticamente o primeiro (mais barato)
    if (resultado.length > 0) onFreteSelect(resultado[0] ?? null)
    setCalculando(false)
  }

  const fmtBRL = (v: number) =>
    v === 0
      ? 'Grátis'
      : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div className="border-t border-neutral-200 pt-4">
      <p className="mb-2 text-sm font-medium text-neutral-700">Calcular Frete</p>

      <div className="flex gap-2">
        <input
          type="text"
          value={cep}
          onChange={e => {
            setCep(formatarCep(e.target.value))
            setOpcoes(null)
            onFreteSelect(null)
          }}
          onKeyDown={e => e.key === 'Enter' && handleCalcular()}
          placeholder="00000-000"
          maxLength={9}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button
          onClick={handleCalcular}
          disabled={calculando}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
        >
          {calculando ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : 'Calcular'}
        </button>
      </div>

      {subtotal >= 500 && (
        <p className="mt-1.5 text-xs text-green-600 font-medium">
          Parabéns! Seu pedido tem frete grátis.
        </p>
      )}

      {erro && <p className="mt-1.5 text-xs text-red-600">{erro}</p>}

      {opcoes && (
        <div className="mt-3 space-y-2">
          {opcoes.map(op => (
            <label
              key={op.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                freteSelecionado?.id === op.id
                  ? 'border-brand bg-brand/5'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="frete"
                  checked={freteSelecionado?.id === op.id}
                  onChange={() => onFreteSelect(op)}
                  className="accent-brand"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-800">{op.nome}</p>
                  <p className="text-xs text-neutral-400">{op.prazo}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${op.valor === 0 ? 'text-green-600' : 'text-neutral-800'}`}>
                {fmtBRL(op.valor)}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

function CartPage() {
  const { items, total, itemsCount, removeItem, updateQuantity, clearCart } = useCart()
  const navigate = useNavigate()
  const [freteSelecionado, setFreteSelecionado] = useState<OpcaoFrete | null>(null)

  function handleFinalizarCompra() {
    if (!freteSelecionado) return
    sessionStorage.setItem('a2tech_frete', JSON.stringify({
      id: freteSelecionado.id,
      nome: freteSelecionado.nome,
      prazo: freteSelecionado.prazo,
      valor: freteSelecionado.valor,
    }))
    navigate('/checkout')
  }

  const totalComFrete = total + (freteSelecionado?.valor ?? 0)

  const formatarPreco = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header cartItemsCount={itemsCount} />
        <main className="flex flex-1 items-center justify-center bg-neutral-50 py-12">
          <Card padding="lg" className="max-w-md text-center">
            <svg className="mx-auto mb-4 h-16 w-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="mb-2 text-xl font-bold text-neutral-900">Seu carrinho está vazio</h2>
            <p className="mb-6 text-neutral-600">Adicione produtos para continuar comprando</p>
            <Link to="/produtos" className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-hover hover:shadow-md">
              Ver Produtos
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex-1 bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Carrinho</h1>
              <p className="mt-2 text-neutral-600">
                {itemsCount} {itemsCount === 1 ? 'item' : 'itens'} no carrinho
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={clearCart}>
              Limpar Carrinho
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Lista de Itens */}
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.productId} padding="lg">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Link to={`/produtos/${item.productSlug}`} className="flex-shrink-0">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-20 w-20 rounded-lg object-cover sm:h-24 sm:w-24"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/produtos/${item.productSlug}`} className="font-medium text-neutral-900 hover:text-brand">
                          {item.productName}
                        </Link>
                        <div className="text-right sm:hidden">
                          <p className="text-base font-bold text-neutral-900">
                            {formatarPreco(item.productPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-1 text-base font-bold text-brand">
                        {formatarPreco(item.productPrice)}
                      </p>

                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="rounded-l-lg border border-neutral-300 px-2.5 py-1.5 hover:bg-neutral-100 sm:px-3 sm:py-2"
                          >
                            -
                          </button>
                          <span className="border-b border-t border-neutral-300 px-3 py-1.5 text-center font-medium sm:px-4 sm:py-2">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="rounded-r-lg border border-neutral-300 px-2.5 py-1.5 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-2"
                          >
                            +
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.productId)} className="text-sm text-error hover:underline">
                          Remover
                        </button>
                      </div>
                    </div>

                    <div className="hidden text-right sm:block">
                      <p className="text-sm text-neutral-600">Subtotal</p>
                      <p className="text-xl font-bold text-neutral-900">
                        {formatarPreco(item.productPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Resumo do Pedido */}
            <div>
              <Card padding="lg" className="sticky top-4">
                <h2 className="mb-4 text-xl font-bold text-neutral-900">Resumo do Pedido</h2>

                <div className="space-y-3 border-b border-neutral-200 pb-4">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal ({itemsCount} {itemsCount === 1 ? 'item' : 'itens'})</span>
                    <span className="font-medium">{formatarPreco(total)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Frete</span>
                    <span className={`font-medium ${freteSelecionado ? freteSelecionado.valor === 0 ? 'text-green-600' : 'text-neutral-800' : 'text-neutral-400'}`}>
                      {freteSelecionado
                        ? freteSelecionado.valor === 0
                          ? 'Grátis'
                          : formatarPreco(freteSelecionado.valor)
                        : 'Informe o CEP'}
                    </span>
                  </div>
                </div>

                <div className="my-4 flex justify-between">
                  <span className="text-lg font-bold text-neutral-900">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-brand">
                      {formatarPreco(totalComFrete)}
                    </span>
                    {!freteSelecionado && (
                      <p className="text-xs text-neutral-400">+ frete</p>
                    )}
                  </div>
                </div>

                <Button variant="primary" size="lg" fullWidth disabled={!freteSelecionado} onClick={handleFinalizarCompra}>
                  Finalizar Compra
                </Button>

                {!freteSelecionado && (
                  <p className="mt-2 text-center text-xs text-neutral-400">
                    Calcule o frete para continuar
                  </p>
                )}

                {/* Cálculo de frete */}
                <CalcFrete
                  subtotal={total}
                  freteSelecionado={freteSelecionado}
                  onFreteSelect={setFreteSelecionado}
                />

                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <Link
                    to="/produtos"
                    className="inline-flex w-full items-center justify-center rounded-lg border-2 border-brand bg-white px-3 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-50 active:bg-brand-100"
                  >
                    Continuar Comprando
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default CartPage
