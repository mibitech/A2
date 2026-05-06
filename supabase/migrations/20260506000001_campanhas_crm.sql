-- =====================================================
-- US-21 — Campanhas CRM (Brevo)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.campanhas_crm (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        text NOT NULL,
  assunto       text NOT NULL,
  conteudo_html text NOT NULL,
  segmento      text NOT NULL DEFAULT 'todos'
                  CHECK (segmento IN ('todos', 'clientes', 'por_tag')),
  tag_filtro    text,
  total_enviados int NOT NULL DEFAULT 0,
  status        text NOT NULL DEFAULT 'rascunho'
                  CHECK (status IN ('rascunho', 'enviando', 'enviada', 'erro')),
  erro_msg      text,
  criado_por    uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  enviada_at    timestamptz
);

ALTER TABLE public.campanhas_crm ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_campanhas" ON public.campanhas_crm
  FOR ALL USING (public.is_admin() OR public.is_staff());
