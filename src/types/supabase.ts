export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      fornecedores: {
        Row: {
          id: string
          nome: string
          slug: string
          url_site: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          slug: string
          url_site?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          slug?: string
          url_site?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      produtos: {
        Row: {
          id: string
          fornecedor_id: string
          nome: string
          slug: string
          descricao: string | null
          preco: number
          preco_promocional: number | null
          estoque: number
          imagens: string[]
          categoria: string
          subcategoria: string | null
          sku: string | null
          peso: number | null
          dimensoes: Json | null
          caracteristicas: Json | null
          ativo: boolean
          destaque: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          fornecedor_id: string
          nome: string
          slug: string
          descricao?: string | null
          preco: number
          preco_promocional?: number | null
          estoque?: number
          imagens?: string[]
          categoria: string
          subcategoria?: string | null
          sku?: string | null
          peso?: number | null
          dimensoes?: Json | null
          caracteristicas?: Json | null
          ativo?: boolean
          destaque?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          fornecedor_id?: string
          nome?: string
          slug?: string
          descricao?: string | null
          preco?: number
          preco_promocional?: number | null
          estoque?: number
          imagens?: string[]
          categoria?: string
          subcategoria?: string | null
          sku?: string | null
          peso?: number | null
          dimensoes?: Json | null
          caracteristicas?: Json | null
          ativo?: boolean
          destaque?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          email: string
          nome_completo: string | null
          telefone: string | null
          cpf_cnpj: string | null
          tipo_pessoa: 'fisica' | 'juridica'
          role: 'cliente' | 'funcionario' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nome_completo?: string | null
          telefone?: string | null
          cpf_cnpj?: string | null
          tipo_pessoa?: 'fisica' | 'juridica'
          role?: 'cliente' | 'funcionario' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nome_completo?: string | null
          telefone?: string | null
          cpf_cnpj?: string | null
          tipo_pessoa?: 'fisica' | 'juridica'
          role?: 'cliente' | 'funcionario' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      enderecos: {
        Row: {
          id: string
          usuario_id: string
          nome: string
          cep: string
          logradouro: string
          numero: string
          complemento: string | null
          bairro: string
          cidade: string
          estado: string
          padrao: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          nome: string
          cep: string
          logradouro: string
          numero: string
          complemento?: string | null
          bairro: string
          cidade: string
          estado: string
          padrao?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          nome?: string
          cep?: string
          logradouro?: string
          numero?: string
          complemento?: string | null
          bairro?: string
          cidade?: string
          estado?: string
          padrao?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pedidos: {
        Row: {
          id: string
          usuario_id: string
          status:
            | 'pendente'
            | 'pago'
            | 'processando'
            | 'enviado'
            | 'entregue'
            | 'cancelado'
          subtotal: number
          frete: number
          desconto: number
          total: number
          endereco_entrega: Json
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          status?: 'pendente' | 'pago' | 'processando' | 'enviado' | 'entregue' | 'cancelado'
          subtotal: number
          frete: number
          desconto?: number
          total: number
          endereco_entrega: Json
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          status?: 'pendente' | 'pago' | 'processando' | 'enviado' | 'entregue' | 'cancelado'
          subtotal?: number
          frete?: number
          desconto?: number
          total?: number
          endereco_entrega?: Json
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      movimentacoes_estoque: {
        Row: {
          id: string
          produto_id: string
          usuario_id: string | null
          tipo: string
          quantidade: number
          estoque_anterior: number
          estoque_posterior: number
          motivo: string | null
          created_at: string
        }
        Insert: {
          id?: string
          produto_id: string
          usuario_id?: string | null
          tipo: string
          quantidade: number
          estoque_anterior: number
          estoque_posterior: number
          motivo?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          produto_id?: string
          usuario_id?: string | null
          tipo?: string
          quantidade?: number
          estoque_anterior?: number
          estoque_posterior?: number
          motivo?: string | null
          created_at?: string
        }
      }
      itens_pedido: {
        Row: {
          id: string
          pedido_id: string
          produto_id: string
          quantidade: number
          preco_unitario: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          pedido_id: string
          produto_id: string
          quantidade: number
          preco_unitario: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          pedido_id?: string
          produto_id?: string
          quantidade?: number
          preco_unitario?: number
          subtotal?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
