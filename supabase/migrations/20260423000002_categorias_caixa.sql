-- Migration: tabela de categorias do fluxo de caixa
-- Permite gerenciar categorias de forma dinâmica pelo admin

CREATE TABLE IF NOT EXISTS public.categorias_caixa (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text NOT NULL,
  tipo       text NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ambos')),
  ativo      boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (nome, tipo)
);

-- RLS: leitura para staff, escrita somente para admin
ALTER TABLE public.categorias_caixa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_select_categorias" ON public.categorias_caixa
  FOR SELECT USING (is_admin() OR is_staff());

CREATE POLICY "admin_insert_categorias" ON public.categorias_caixa
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "admin_update_categorias" ON public.categorias_caixa
  FOR UPDATE USING (is_admin());

CREATE POLICY "admin_delete_categorias" ON public.categorias_caixa
  FOR DELETE USING (is_admin());

-- Categorias padrão
INSERT INTO public.categorias_caixa (nome, tipo) VALUES
  -- Entradas
  ('venda',              'entrada'),
  ('reembolso recebido', 'entrada'),
  -- Saídas
  ('fornecedor',  'saida'),
  ('frete',       'saida'),
  ('marketing',   'saida'),
  ('operacional', 'saida'),
  ('impostos',    'saida'),
  -- Ambos
  ('outros',      'ambos')
ON CONFLICT (nome, tipo) DO NOTHING;

COMMENT ON TABLE public.categorias_caixa IS 'Categorias de lançamentos do fluxo de caixa — gerenciadas pelo admin';
