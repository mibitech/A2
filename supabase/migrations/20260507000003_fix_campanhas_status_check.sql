-- Corrige o CHECK de status para incluir arquivada e cancelada
ALTER TABLE public.campanhas_crm
  DROP CONSTRAINT IF EXISTS campanhas_crm_status_check;

ALTER TABLE public.campanhas_crm
  ADD CONSTRAINT campanhas_crm_status_check
  CHECK (status IN ('enviando', 'enviada', 'erro', 'arquivada', 'cancelada'));
