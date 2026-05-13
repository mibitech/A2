import { supabase } from '@lib/supabase/client'

export interface Fornecedor {
  id: string
  nome: string
  slug: string
  url_site: string | null
  cnpj: string | null
  email: string | null
  telefone: string | null
  contato: string | null
  endereco: {
    logradouro?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
  } | null
  ativo: boolean
  created_at: string
}

export interface FornecedorInput {
  nome: string
  slug: string
  url_site?: string
  cnpj?: string
  email?: string
  telefone?: string
  contato?: string
  endereco?: Fornecedor['endereco']
  ativo: boolean
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function listarFornecedores(): Promise<{ data: Fornecedor[]; error: string | null }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .order('nome')
      .abortSignal(controller.signal)
      .then(r => { clearTimeout(timeoutId); return r })

    if (error) return { data: [], error: error.message }
    return { data: (data ?? []) as Fornecedor[], error: null }
  } catch {
    clearTimeout(timeoutId)
    return { data: [], error: 'Tempo limite excedido' }
  }
}

export async function criarFornecedor(input: FornecedorInput): Promise<{ data: Fornecedor | null; error: string | null }> {
  const slug = input.slug || slugify(input.nome)
  const { data, error } = await supabase
    .from('fornecedores')
    .insert({ ...input, slug })
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Fornecedor, error: null }
}

export async function atualizarFornecedor(id: string, input: Partial<FornecedorInput>): Promise<{ error: string | null }> {
  const { error } = await (supabase.from('fornecedores') as any).update(input).eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}

export async function alternarAtivo(id: string, ativo: boolean): Promise<{ error: string | null }> {
  const { error } = await (supabase.from('fornecedores') as any).update({ ativo }).eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}
