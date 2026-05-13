-- Migration: substituir ativo:boolean por status em lotes + trigger sync produtos.estoque

-- =====================================================
-- 1. ADICIONAR COLUNA STATUS E MIGRAR DADOS
-- =====================================================
ALTER TABLE public.lotes
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'aguardando'
    CHECK (status IN ('ativo', 'aguardando', 'encerrado'));

-- Migrar dados existentes
UPDATE public.lotes SET status = 'ativo'     WHERE ativo = true;
UPDATE public.lotes SET status = 'encerrado' WHERE ativo = false;

-- =====================================================
-- 2. SUBSTITUIR UNIQUE INDEX
-- =====================================================
DROP INDEX IF EXISTS lotes_produto_ativo_unique;

CREATE UNIQUE INDEX IF NOT EXISTS lotes_produto_status_ativo_unique
  ON public.lotes(produto_id)
  WHERE status = 'ativo';

-- =====================================================
-- 3. REMOVER COLUNA LEGADA
-- =====================================================
ALTER TABLE public.lotes DROP COLUMN IF EXISTS ativo;

-- =====================================================
-- 4. TRIGGER: SINCRONIZAR produtos.estoque
--    soma estoque_atual WHERE status IN ('ativo','aguardando')
--    dispara em INSERT / UPDATE / DELETE em lotes
-- =====================================================
CREATE OR REPLACE FUNCTION public.sync_produto_estoque_from_lotes()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  pid UUID;
BEGIN
  pid := COALESCE(NEW.produto_id, OLD.produto_id);
  UPDATE public.produtos
  SET estoque = (
    SELECT COALESCE(SUM(estoque_atual), 0)
    FROM public.lotes
    WHERE produto_id = pid
      AND status IN ('ativo', 'aguardando')
  )
  WHERE id = pid;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_estoque_on_lote_change ON public.lotes;
CREATE TRIGGER sync_estoque_on_lote_change
  AFTER INSERT OR UPDATE OR DELETE ON public.lotes
  FOR EACH ROW EXECUTE FUNCTION public.sync_produto_estoque_from_lotes();

COMMENT ON COLUMN public.lotes.status IS 'ativo=em uso | aguardando=cadastrado mas não ativo | encerrado=fechado manualmente';
