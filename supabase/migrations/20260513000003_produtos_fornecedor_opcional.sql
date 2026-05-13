-- Tornar produtos.fornecedor_id opcional (nullable)
ALTER TABLE public.produtos
  ALTER COLUMN fornecedor_id DROP NOT NULL;
