-- Migration: adiciona coluna tags (array de texto) na tabela usuarios
-- Idempotente: usa IF NOT EXISTS

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.usuarios.tags IS 'Tags de segmentação manual do CRM (ex: vip, atacado, inativo)';
