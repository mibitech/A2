-- Suporte a lista manual de destinatários em campanhas
ALTER TABLE public.campanhas_crm
  DROP CONSTRAINT IF EXISTS campanhas_crm_segmento_check;

ALTER TABLE public.campanhas_crm
  ADD CONSTRAINT campanhas_crm_segmento_check
  CHECK (segmento IN ('todos', 'clientes', 'por_tag', 'lista_manual'));

ALTER TABLE public.campanhas_crm
  ADD COLUMN IF NOT EXISTS destinatarios_manual text[];
