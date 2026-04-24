-- Migration: tabela lancamentos_caixa para fluxo de caixa manual (US-22 parcial)
-- Independente do Stripe — entradas e saídas registradas manualmente pelo admin

CREATE TABLE IF NOT EXISTS public.lancamentos_caixa (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        text NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  categoria   text NOT NULL DEFAULT 'outros',
  descricao   text NOT NULL,
  valor       numeric(10,2) NOT NULL CHECK (valor > 0),
  data_ref    date NOT NULL DEFAULT CURRENT_DATE,
  observacoes text,
  criado_por  uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Índices úteis para filtros por data e tipo
CREATE INDEX IF NOT EXISTS lancamentos_caixa_data_ref_idx ON public.lancamentos_caixa (data_ref DESC);
CREATE INDEX IF NOT EXISTS lancamentos_caixa_tipo_idx    ON public.lancamentos_caixa (tipo);

-- RLS: somente admin e funcionário podem ver/alterar lançamentos
ALTER TABLE public.lancamentos_caixa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_staff_select_lancamentos" ON public.lancamentos_caixa
  FOR SELECT USING (is_admin() OR is_staff());

CREATE POLICY "admin_staff_insert_lancamentos" ON public.lancamentos_caixa
  FOR INSERT WITH CHECK (is_admin() OR is_staff());

CREATE POLICY "admin_staff_update_lancamentos" ON public.lancamentos_caixa
  FOR UPDATE USING (is_admin() OR is_staff());

CREATE POLICY "admin_delete_lancamentos" ON public.lancamentos_caixa
  FOR DELETE USING (is_admin());

COMMENT ON TABLE public.lancamentos_caixa IS 'Fluxo de caixa manual — entradas e saídas sem depender do Stripe';
