import type { CartItem } from '@/features/cart/models/cart.types'

export interface EnderecoCheckout {
  nome: string
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
}

export interface FreteCheckout {
  id: string
  nome: string
  prazo: string
  valor: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env

const FUNCTION_URL = `${env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`
const ANON_KEY: string = env.VITE_SUPABASE_ANON_KEY

export async function iniciarCheckout(params: {
  items: CartItem[]
  frete: FreteCheckout
  endereco: EnderecoCheckout
  userId: string
}): Promise<{ url: string | null; error: string | null }> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 20_000)

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY,
      },
      body: JSON.stringify({
        items: params.items,
        frete: params.frete,
        enderecoEntrega: params.endereco,
        userId: params.userId,
      }),
    })

    clearTimeout(timer)

    const data = await response.json()

    if (!response.ok) {
      return { url: null, error: data?.error ?? `Erro ${response.status} do servidor de pagamento` }
    }

    if (!data?.url) {
      return { url: null, error: 'Resposta inválida do servidor de pagamento' }
    }

    return { url: data.url, error: null }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { url: null, error: 'O servidor demorou para responder. Tente novamente.' }
    }
    return { url: null, error: 'Erro ao conectar com o servidor de pagamento' }
  }
}
