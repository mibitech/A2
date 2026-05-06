import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/features/cart/contexts/CartContext'
import { useAuthContext } from '@/features/auth/contexts/AuthContext'
import { iniciarCheckout } from '../services/checkout.service'
import type { EnderecoCheckout, FreteCheckout } from '../services/checkout.service'
import { supabase } from '@lib/supabase/client'
import { Header, Footer } from '@components/layout'

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

function formatCep(v: string) {
  const n = v.replace(/\D/g, '').slice(0, 8)
  return n.length > 5 ? `${n.slice(0, 5)}-${n.slice(5)}` : n
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

const ENDERECO_VAZIO: EnderecoCheckout = {
  nome: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: 'SP',
}

export default function CheckoutPage() {
  const { items, total, itemsCount } = useCart()
  const { user, isAuthenticated } = useAuthContext()

  const [frete] = useState<FreteCheckout>(() => {
    try { return JSON.parse(sessionStorage.getItem('a2tech_frete') ?? 'null') } catch { return null }
  })

  const [enderecoSalvo, setEnderecoSalvo] = useState<EnderecoCheckout | null>(null)
  const [confirmaEndereco, setConfirmaEndereco] = useState<boolean | null>(null) // null=aguardando, true=confirmado, false=quer alterar
  const [buscandoEndereco, setBuscandoEndereco] = useState(false) // false: só ativa quando user estiver disponível

  const [endereco, setEndereco] = useState<EnderecoCheckout>(ENDERECO_VAZIO)
  const [erros, setErros] = useState<Partial<Record<keyof EnderecoCheckout, string>>>({})
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const totalComFrete = total + (frete?.valor ?? 0)

  // Buscar endereço padrão do cliente ao montar
  useEffect(() => {
    if (!user) {
      // Auth ainda carregando — garante que o formulário aparece sem travar
      setEndereco(prev => ({ ...prev, nome: '' }))
      setConfirmaEndereco(false)
      setBuscandoEndereco(false)
      return
    }
    let cancelled = false
    setBuscandoEndereco(true)

    async function buscarEndereco() {

      type EndRow = { nome: string; cep: string; logradouro: string; numero: string; complemento: string | null; bairro: string; cidade: string; estado: string } | null
      type Result = { data: EndRow; error: unknown }

      const timeout = new Promise<Result>(resolve =>
        setTimeout(() => resolve({ data: null, error: 'timeout' }), 5_000)
      )

      const query = supabase
        .from('enderecos')
        .select('nome, cep, logradouro, numero, complemento, bairro, cidade, estado')
        .eq('usuario_id', user!.id)
        .eq('padrao', true)
        .maybeSingle() as unknown as Promise<Result>

      const { data } = await Promise.race([query, timeout])

      if (cancelled) return

      if (data) {
        const endSalvo: EnderecoCheckout = {
          nome: data.nome,
          cep: data.cep,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento ?? '',
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
        }
        setEnderecoSalvo(endSalvo)
        setEndereco(endSalvo)
        setConfirmaEndereco(null)
      } else {
        setEndereco(prev => ({ ...prev, nome: user!.nomeCompleto ?? '' }))
        setConfirmaEndereco(false)
      }
      setBuscandoEndereco(false)
    }

    buscarEndereco()
    return () => { cancelled = true }
  }, [user])

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header cartItemsCount={itemsCount} />
        <main className="flex flex-1 items-center justify-center bg-neutral-50 py-16">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-bold text-neutral-900">Faça login para continuar</h2>
            <p className="mb-6 text-neutral-600">Você precisa estar logado para finalizar o pedido.</p>
            <Link to="/auth/login?redirect=/checkout" className="rounded-lg bg-brand px-6 py-2.5 font-medium text-white hover:bg-brand/90">
              Fazer login
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header cartItemsCount={0} />
        <main className="flex flex-1 items-center justify-center bg-neutral-50 py-16">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-bold text-neutral-900">Carrinho vazio</h2>
            <Link to="/produtos" className="text-brand hover:underline">Ver produtos</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  function campo(field: keyof EnderecoCheckout, value: string) {
    setEndereco(prev => ({ ...prev, [field]: value }))
    if (erros[field]) setErros(prev => ({ ...prev, [field]: undefined }))
  }

  function validar(): boolean {
    const novosErros: typeof erros = {}
    if (!endereco.nome.trim()) novosErros.nome = 'Obrigatório'
    if (endereco.cep.replace(/\D/g, '').length < 8) novosErros.cep = 'CEP inválido'
    if (!endereco.logradouro.trim()) novosErros.logradouro = 'Obrigatório'
    if (!endereco.numero.trim()) novosErros.numero = 'Obrigatório'
    if (!endereco.bairro.trim()) novosErros.bairro = 'Obrigatório'
    if (!endereco.cidade.trim()) novosErros.cidade = 'Obrigatório'
    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  async function handlePagar() {
    if (!validar()) return
    if (!frete) { setErro('Volte ao carrinho e selecione uma opção de frete.'); return }
    setCarregando(true)
    setErro(null)

    // Salva/atualiza o endereço padrão do cliente para próximas compras
    // Só salva se o usuário digitou um endereço novo (não confirmou um existente)
    if (confirmaEndereco === false) {
      const payload = {
        nome: endereco.nome,
        cep: endereco.cep,
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        complemento: endereco.complemento || null,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,
        padrao: true,
      }
      if (enderecoSalvo) {
        // Atualiza o registro existente
        await supabase
          .from('enderecos')
          .update(payload as never)
          .eq('usuario_id', user!.id)
          .eq('padrao', true)
      } else {
        // Insere novo registro
        await supabase
          .from('enderecos')
          .insert({ ...payload, usuario_id: user!.id } as never)
      }
    }

    const { url, error } = await iniciarCheckout({ items, frete, endereco, userId: user!.id })
    setCarregando(false)
    if (error || !url) { setErro(error ?? 'Erro desconhecido'); return }
    window.location.href = url
  }

  const inputCls = (field: keyof EnderecoCheckout) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand ${
      erros[field] ? 'border-red-400 focus:ring-red-400' : 'border-neutral-300'
    }`

  // Bloco: confirmação de endereço salvo
  const blocoEndereco = buscandoEndereco ? (
    <div className="flex items-center gap-2 py-6 text-sm text-neutral-400">
      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
      Buscando seu endereço...
    </div>
  ) : enderecoSalvo && confirmaEndereco === null ? (
    // Tem endereço salvo — pergunta se ainda é o mesmo
    <div className="rounded-xl border border-brand/30 bg-brand/5 p-5">
      <p className="mb-3 text-sm font-semibold text-neutral-800">Entregar no endereço cadastrado?</p>
      <div className="mb-4 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 leading-relaxed">
        <p className="font-medium">{enderecoSalvo.nome}</p>
        <p>{enderecoSalvo.logradouro}, {enderecoSalvo.numero}{enderecoSalvo.complemento ? ` — ${enderecoSalvo.complemento}` : ''}</p>
        <p>{enderecoSalvo.bairro} · {enderecoSalvo.cidade}/{enderecoSalvo.estado}</p>
        <p>CEP {enderecoSalvo.cep}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setConfirmaEndereco(true)}
          className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand/90"
        >
          Sim, entregar aqui
        </button>
        <button
          onClick={() => {
            setEndereco({ ...ENDERECO_VAZIO, nome: enderecoSalvo.nome })
            setConfirmaEndereco(false)
          }}
          className="flex-1 rounded-lg border border-neutral-300 bg-white py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Usar outro endereço
        </button>
      </div>
    </div>
  ) : confirmaEndereco === true ? (
    // Confirmou — mostra resumo com opção de alterar
    <div className="rounded-xl border border-green-200 bg-green-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-green-800">
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
            Endereço confirmado
          </p>
          <p className="text-sm text-neutral-700">{endereco.logradouro}, {endereco.numero}</p>
          <p className="text-sm text-neutral-700">{endereco.bairro} · {endereco.cidade}/{endereco.estado} · CEP {endereco.cep}</p>
        </div>
        <button
          onClick={() => setConfirmaEndereco(null)}
          className="shrink-0 text-xs text-brand hover:underline"
        >
          Alterar
        </button>
      </div>
    </div>
  ) : (
    // Sem endereço salvo ou quer usar outro — formulário completo
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Nome completo</label>
        <input className={inputCls('nome')} value={endereco.nome}
          onChange={e => campo('nome', e.target.value)} placeholder="Seu nome completo" />
        {erros.nome && <p className="mt-1 text-xs text-red-600">{erros.nome}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">CEP</label>
          <input className={inputCls('cep')} value={endereco.cep}
            onChange={e => campo('cep', formatCep(e.target.value))}
            placeholder="00000-000" maxLength={9} />
          {erros.cep && <p className="mt-1 text-xs text-red-600">{erros.cep}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Estado</label>
          <select className={inputCls('estado')} value={endereco.estado}
            onChange={e => campo('estado', e.target.value)}>
            {ESTADOS.map(uf => <option key={uf}>{uf}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Logradouro</label>
        <input className={inputCls('logradouro')} value={endereco.logradouro}
          onChange={e => campo('logradouro', e.target.value)} placeholder="Rua, Avenida..." />
        {erros.logradouro && <p className="mt-1 text-xs text-red-600">{erros.logradouro}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Número</label>
          <input className={inputCls('numero')} value={endereco.numero}
            onChange={e => campo('numero', e.target.value)} placeholder="123" />
          {erros.numero && <p className="mt-1 text-xs text-red-600">{erros.numero}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Complemento <span className="font-normal text-neutral-400">(opcional)</span>
          </label>
          <input className={inputCls('complemento')} value={endereco.complemento}
            onChange={e => campo('complemento', e.target.value)} placeholder="Apto, Sala..." />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Bairro</label>
          <input className={inputCls('bairro')} value={endereco.bairro}
            onChange={e => campo('bairro', e.target.value)} placeholder="Bairro" />
          {erros.bairro && <p className="mt-1 text-xs text-red-600">{erros.bairro}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Cidade</label>
          <input className={inputCls('cidade')} value={endereco.cidade}
            onChange={e => campo('cidade', e.target.value)} placeholder="Cidade" />
          {erros.cidade && <p className="mt-1 text-xs text-red-600">{erros.cidade}</p>}
        </div>
      </div>
    </div>
  )

  // Botão de pagar só aparece quando o endereço está resolvido
  const enderecoResolvido = confirmaEndereco === true || confirmaEndereco === false

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemsCount={itemsCount} />

      <main className="flex-1 bg-neutral-50 py-8">
        <div className="container mx-auto max-w-4xl px-4">

          <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
            <Link to="/carrinho" className="hover:text-brand">Carrinho</Link>
            <span>›</span>
            <span className="font-semibold text-neutral-900">Finalizar Pedido</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

            {/* Endereço */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <h2 className="mb-5 text-lg font-bold text-neutral-900">Endereço de Entrega</h2>
              {erro && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</div>
              )}
              {blocoEndereco}
            </div>

            {/* Resumo + botão */}
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <h3 className="mb-4 font-bold text-neutral-900">Resumo do Pedido</h3>
                <div className="space-y-2 text-sm">
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between text-neutral-700">
                      <span>{item.productName} × {item.quantity}</span>
                      <span>{fmt(item.productPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="my-3 border-t border-neutral-100" />
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span><span>{fmt(total)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Frete {frete ? `(${frete.nome})` : ''}</span>
                    <span className={frete?.valor === 0 ? 'text-green-600' : ''}>
                      {frete ? (frete.valor === 0 ? 'Grátis' : fmt(frete.valor)) : '—'}
                    </span>
                  </div>
                </div>
                <div className="my-3 border-t border-neutral-200" />
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>Total</span>
                  <span className="text-brand text-lg">{fmt(totalComFrete)}</span>
                </div>
                {frete && <p className="mt-1 text-right text-xs text-neutral-400">Prazo: {frete.prazo}</p>}
              </div>

              {enderecoResolvido && (
                <button
                  onClick={handlePagar}
                  disabled={carregando}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-60"
                >
                  {carregando ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Aguarde...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Pagar com Stripe
                    </>
                  )}
                </button>
              )}

              <p className="text-center text-xs text-neutral-400">
                Pagamento seguro processado pelo Stripe.
              </p>
              <Link to="/carrinho" className="block text-center text-sm text-brand hover:underline">
                ← Voltar ao carrinho
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
