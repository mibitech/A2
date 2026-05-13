-- Migration: expandir fornecedores + criar lotes + rastreabilidade por itens_pedido

-- =====================================================
-- 1. EXPANDIR TABELA FORNECEDORES
-- =====================================================
ALTER TABLE public.fornecedores
  ADD COLUMN IF NOT EXISTS cnpj          VARCHAR(18),
  ADD COLUMN IF NOT EXISTS email         VARCHAR(255),
  ADD COLUMN IF NOT EXISTS telefone      VARCHAR(20),
  ADD COLUMN IF NOT EXISTS contato       VARCHAR(255),
  ADD COLUMN IF NOT EXISTS endereco      JSONB;

-- =====================================================
-- 2. TABELA LOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lotes (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id        UUID        NOT NULL REFERENCES public.produtos(id)     ON DELETE RESTRICT,
  fornecedor_id     UUID        NOT NULL REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
  numero_lote       VARCHAR(100) NOT NULL,
  quantidade_inicial INTEGER    NOT NULL CHECK (quantidade_inicial > 0),
  estoque_atual     INTEGER     NOT NULL DEFAULT 0 CHECK (estoque_atual >= 0),
  ativo             BOOLEAN     NOT NULL DEFAULT true,
  observacoes       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Apenas um lote ativo por produto por vez
CREATE UNIQUE INDEX IF NOT EXISTS lotes_produto_ativo_unique
  ON public.lotes(produto_id)
  WHERE ativo = true;

CREATE INDEX IF NOT EXISTS lotes_produto_idx      ON public.lotes(produto_id);
CREATE INDEX IF NOT EXISTS lotes_fornecedor_idx   ON public.lotes(fornecedor_id);
CREATE INDEX IF NOT EXISTS lotes_ativo_idx        ON public.lotes(ativo);

-- trigger updated_at
CREATE OR REPLACE FUNCTION public.update_lotes_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS update_lotes_updated_at ON public.lotes;
CREATE TRIGGER update_lotes_updated_at
  BEFORE UPDATE ON public.lotes
  FOR EACH ROW EXECUTE FUNCTION public.update_lotes_updated_at();

-- =====================================================
-- 3. RASTREABILIDADE EM ITENS_PEDIDO
-- =====================================================
ALTER TABLE public.itens_pedido
  ADD COLUMN IF NOT EXISTS lote_id      UUID        REFERENCES public.lotes(id)       ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fornecedor_id UUID       REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS numero_lote  VARCHAR(100); -- snapshot imutável no momento da venda

CREATE INDEX IF NOT EXISTS itens_pedido_lote_idx ON public.itens_pedido(lote_id);

-- =====================================================
-- 4. RLS
-- =====================================================
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "publico_select_lotes"         ON public.lotes;
DROP POLICY IF EXISTS "admin_staff_insert_lotes"     ON public.lotes;
DROP POLICY IF EXISTS "admin_staff_update_lotes"     ON public.lotes;
DROP POLICY IF EXISTS "admin_delete_lotes"           ON public.lotes;

CREATE POLICY "publico_select_lotes"
  ON public.lotes FOR SELECT USING (true);

CREATE POLICY "admin_staff_insert_lotes"
  ON public.lotes FOR INSERT WITH CHECK (is_admin() OR is_staff());

CREATE POLICY "admin_staff_update_lotes"
  ON public.lotes FOR UPDATE USING (is_admin() OR is_staff());

CREATE POLICY "admin_delete_lotes"
  ON public.lotes FOR DELETE USING (is_admin());

COMMENT ON TABLE public.lotes IS 'Lotes de produtos por fornecedor — rastreabilidade completa de vendas';
COMMENT ON COLUMN public.itens_pedido.numero_lote IS 'Snapshot do número do lote no momento da venda (imutável)';
