export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      campanhas_crm: {
        Row: {
          assunto: string
          conteudo_html: string
          created_at: string
          criado_por: string | null
          destinatarios_manual: string[] | null
          enviada_at: string | null
          erro_msg: string | null
          id: string
          segmento: string
          status: string
          tag_filtro: string | null
          template_id: string | null
          titulo: string
          total_enviados: number
        }
        Insert: {
          assunto: string
          conteudo_html: string
          created_at?: string
          criado_por?: string | null
          destinatarios_manual?: string[] | null
          enviada_at?: string | null
          erro_msg?: string | null
          id?: string
          segmento?: string
          status?: string
          tag_filtro?: string | null
          template_id?: string | null
          titulo: string
          total_enviados?: number
        }
        Update: {
          assunto?: string
          conteudo_html?: string
          created_at?: string
          criado_por?: string | null
          destinatarios_manual?: string[] | null
          enviada_at?: string | null
          erro_msg?: string | null
          id?: string
          segmento?: string
          status?: string
          tag_filtro?: string | null
          template_id?: string | null
          titulo?: string
          total_enviados?: number
        }
        Relationships: [
          {
            foreignKeyName: "campanhas_crm_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campanhas_crm_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "campanhas_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      campanhas_templates: {
        Row: {
          assunto: string
          ativo: boolean
          conteudo_html: string
          created_at: string
          criado_por: string | null
          descricao: string | null
          id: string
          segmento: string
          tag_filtro: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          assunto: string
          ativo?: boolean
          conteudo_html: string
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          segmento?: string
          tag_filtro?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          assunto?: string
          ativo?: boolean
          conteudo_html?: string
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          segmento?: string
          tag_filtro?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campanhas_templates_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_caixa: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      conteudo_site: {
        Row: {
          chave: string
          created_at: string
          id: string
          rotulo: string
          secao: string
          tipo: string
          updated_at: string
          valor: string
        }
        Insert: {
          chave: string
          created_at?: string
          id?: string
          rotulo?: string
          secao: string
          tipo?: string
          updated_at?: string
          valor?: string
        }
        Update: {
          chave?: string
          created_at?: string
          id?: string
          rotulo?: string
          secao?: string
          tipo?: string
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      enderecos: {
        Row: {
          bairro: string
          cep: string
          cidade: string
          complemento: string | null
          created_at: string | null
          estado: string
          id: string
          logradouro: string
          nome: string
          numero: string
          padrao: boolean | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          bairro: string
          cep: string
          cidade: string
          complemento?: string | null
          created_at?: string | null
          estado: string
          id?: string
          logradouro: string
          nome: string
          numero: string
          padrao?: boolean | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          bairro?: string
          cep?: string
          cidade?: string
          complemento?: string | null
          created_at?: string | null
          estado?: string
          id?: string
          logradouro?: string
          nome?: string
          numero?: string
          padrao?: boolean | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enderecos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          ativo: boolean | null
          cnpj: string | null
          contato: string | null
          created_at: string | null
          email: string | null
          endereco: Json | null
          id: string
          nome: string
          slug: string
          telefone: string | null
          updated_at: string | null
          url_site: string | null
        }
        Insert: {
          ativo?: boolean | null
          cnpj?: string | null
          contato?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: Json | null
          id?: string
          nome: string
          slug: string
          telefone?: string | null
          updated_at?: string | null
          url_site?: string | null
        }
        Update: {
          ativo?: boolean | null
          cnpj?: string | null
          contato?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: Json | null
          id?: string
          nome?: string
          slug?: string
          telefone?: string | null
          updated_at?: string | null
          url_site?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          ativo: boolean
          badge: string | null
          created_at: string
          cta_texto: string
          cta_url: string
          id: string
          imagem_url: string
          ordem: number
          subtitulo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          badge?: string | null
          created_at?: string
          cta_texto?: string
          cta_url?: string
          id?: string
          imagem_url: string
          ordem?: number
          subtitulo?: string
          titulo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          badge?: string | null
          created_at?: string
          cta_texto?: string
          cta_url?: string
          id?: string
          imagem_url?: string
          ordem?: number
          subtitulo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      itens_pedido: {
        Row: {
          created_at: string | null
          fornecedor_id: string | null
          id: string
          lote_id: string | null
          numero_lote: string | null
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
        }
        Insert: {
          created_at?: string | null
          fornecedor_id?: string | null
          id?: string
          lote_id?: string | null
          numero_lote?: string | null
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
        }
        Update: {
          created_at?: string | null
          fornecedor_id?: string | null
          id?: string
          lote_id?: string | null
          numero_lote?: string | null
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos_caixa: {
        Row: {
          categoria: string
          created_at: string
          criado_por: string | null
          data_ref: string
          descricao: string
          id: string
          observacoes: string | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria?: string
          created_at?: string
          criado_por?: string | null
          data_ref?: string
          descricao: string
          id?: string
          observacoes?: string | null
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          criado_por?: string | null
          data_ref?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_caixa_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes: {
        Row: {
          created_at: string
          estoque_atual: number
          fornecedor_id: string
          id: string
          numero_lote: string
          observacoes: string | null
          produto_id: string
          quantidade_inicial: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estoque_atual?: number
          fornecedor_id: string
          id?: string
          numero_lote: string
          observacoes?: string | null
          produto_id: string
          quantidade_inicial: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estoque_atual?: number
          fornecedor_id?: string
          id?: string
          numero_lote?: string
          observacoes?: string | null
          produto_id?: string
          quantidade_inicial?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lotes_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lotes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_estoque: {
        Row: {
          created_at: string | null
          estoque_anterior: number
          estoque_posterior: number
          id: string
          motivo: string | null
          produto_id: string
          quantidade: number
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          estoque_anterior: number
          estoque_posterior: number
          id?: string
          motivo?: string | null
          produto_id: string
          quantidade: number
          tipo: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          estoque_anterior?: number
          estoque_posterior?: number
          id?: string
          motivo?: string | null
          produto_id?: string
          quantidade?: number
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          created_at: string | null
          desconto: number | null
          endereco_entrega: Json
          frete: number | null
          id: string
          observacoes: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number
          total: number
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          desconto?: number | null
          endereco_entrega: Json
          frete?: number | null
          id?: string
          observacoes?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal: number
          total: number
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          desconto?: number | null
          endereco_entrega?: Json
          frete?: number | null
          id?: string
          observacoes?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          caracteristicas: Json | null
          categoria: string
          created_at: string | null
          descricao: string | null
          destaque: boolean | null
          dimensoes: Json | null
          estoque: number | null
          fornecedor_id: string | null
          id: string
          imagens: string[] | null
          nome: string
          peso: number | null
          preco: number
          preco_promocional: number | null
          sku: string | null
          slug: string
          subcategoria: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          caracteristicas?: Json | null
          categoria: string
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          dimensoes?: Json | null
          estoque?: number | null
          fornecedor_id?: string | null
          id?: string
          imagens?: string[] | null
          nome: string
          peso?: number | null
          preco: number
          preco_promocional?: number | null
          sku?: string | null
          slug: string
          subcategoria?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          caracteristicas?: Json | null
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          dimensoes?: Json | null
          estoque?: number | null
          fornecedor_id?: string | null
          id?: string
          imagens?: string[] | null
          nome?: string
          peso?: number | null
          preco?: number
          preco_promocional?: number | null
          sku?: string | null
          slug?: string
          subcategoria?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      sobre_galeria: {
        Row: {
          alt: string
          ativo: boolean
          created_at: string
          id: string
          ordem: number
          url: string
        }
        Insert: {
          alt?: string
          ativo?: boolean
          created_at?: string
          id?: string
          ordem?: number
          url: string
        }
        Update: {
          alt?: string
          ativo?: boolean
          created_at?: string
          id?: string
          ordem?: number
          url?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          cpf_cnpj: string | null
          created_at: string | null
          email: string
          id: string
          nome_completo: string | null
          role: string | null
          tags: string[]
          telefone: string | null
          tipo_pessoa: string | null
          updated_at: string | null
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string | null
          email: string
          id: string
          nome_completo?: string | null
          role?: string | null
          tags?: string[]
          telefone?: string | null
          tipo_pessoa?: string | null
          updated_at?: string | null
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome_completo?: string | null
          role?: string | null
          tags?: string[]
          telefone?: string | null
          tipo_pessoa?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
