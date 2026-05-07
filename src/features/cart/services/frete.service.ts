interface ViaCepResponse {
  cep: string
  localidade: string
  uf: string
  erro?: boolean
}

export interface OpcaoFrete {
  id: string
  nome: string
  prazo: string
  valor: number
}

export interface InfoCep {
  cidade: string
  uf: string
  cep: string
}

export async function consultarCep(cep: string): Promise<{ info: InfoCep | null; error: string | null }> {
  const nums = cep.replace(/\D/g, '')
  if (nums.length !== 8) return { info: null, error: 'CEP deve ter 8 dígitos' }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${nums}/json/`, {
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return { info: null, error: 'Erro ao consultar CEP' }

    const data: ViaCepResponse = await res.json()
    if (data.erro) return { info: null, error: 'CEP não encontrado' }

    return { info: { cidade: data.localidade, uf: data.uf, cep: data.cep }, error: null }
  } catch {
    return { info: null, error: 'Não foi possível consultar o CEP. Verifique sua conexão.' }
  }
}

// Tabela por UF — estimativa baseada nos Correios
// TODO: substituir por API real do Melhor Envio ou Correios:
//   POST https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate
//   Headers: Authorization: Bearer {MELHOR_ENVIO_TOKEN}, Content-Type: application/json
//   Body: { from: { postal_code: "01310100" }, to: { postal_code: cep },
//           products: [{ weight: 1, width: 20, height: 20, length: 30 }],
//           services: "1,2" }
const TABELA_UF: Record<string, [pac: number, sedex: number]> = {
  SP: [14.9, 29.9], RJ: [19.9, 38.9], ES: [22.9, 42.9], MG: [22.9, 42.9],
  BA: [26.9, 49.9], SE: [26.9, 49.9], PE: [28.9, 52.9], AL: [28.9, 52.9],
  PB: [28.9, 52.9], RN: [28.9, 52.9], CE: [30.9, 55.9], PI: [32.9, 58.9],
  MA: [32.9, 58.9], PA: [36.9, 65.9], AP: [38.9, 68.9], AM: [38.9, 68.9],
  RR: [38.9, 68.9], AC: [38.9, 68.9], RO: [36.9, 65.9], TO: [34.9, 62.9],
  DF: [24.9, 44.9], GO: [24.9, 44.9], MT: [29.9, 52.9], MS: [29.9, 52.9],
  PR: [16.9, 32.9], SC: [17.9, 34.9], RS: [18.9, 36.9],
}

function estimarFretePorUf(uf: string, subtotal: number): OpcaoFrete[] {
  const gratis = subtotal >= 500
  const [pac, sedex] = TABELA_UF[uf.toUpperCase()] ?? [32.9, 58.9]
  return [
    { id: 'pac', nome: 'PAC (Correios)', prazo: '5 a 8 dias úteis', valor: gratis ? 0 : pac },
    { id: 'sedex', nome: 'SEDEX (Correios)', prazo: '2 a 3 dias úteis', valor: gratis ? 0 : sedex },
  ]
}

export async function calcularFrete(cep: string, subtotal: number): Promise<{
  opcoes: OpcaoFrete[]
  infoCep: InfoCep | null
  error: string | null
}> {
  const { info, error } = await consultarCep(cep)
  if (error || !info) return { opcoes: [], infoCep: null, error: error ?? 'CEP inválido' }

  const opcoes = estimarFretePorUf(info.uf, subtotal)
  return { opcoes, infoCep: info, error: null }
}
