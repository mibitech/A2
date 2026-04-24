-- =====================================================
-- Migration: Conteúdo dinâmico do site
-- hero_slides, conteudo_site, sobre_galeria + bucket site
-- =====================================================

-- =====================================================
-- BUCKET DE STORAGE PÚBLICO: site
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('site', 'site', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: leitura pública, upload somente staff
CREATE POLICY "site_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site');

CREATE POLICY "site_staff_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site' AND (public.is_admin() OR public.is_staff()));

CREATE POLICY "site_staff_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site' AND (public.is_admin() OR public.is_staff()));

-- =====================================================
-- TABELA: hero_slides (carrossel da home)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo     text NOT NULL DEFAULT '',
  subtitulo  text NOT NULL DEFAULT '',
  badge      text,
  cta_texto  text NOT NULL DEFAULT 'Ver Produtos',
  cta_url    text NOT NULL DEFAULT '/produtos',
  imagem_url text NOT NULL,
  ordem      int NOT NULL DEFAULT 0,
  ativo      boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hero_slides_ordem_idx ON public.hero_slides (ordem);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hero_slides_public_select" ON public.hero_slides
  FOR SELECT USING (true);

CREATE POLICY "hero_slides_staff_insert" ON public.hero_slides
  FOR INSERT WITH CHECK (public.is_admin() OR public.is_staff());

CREATE POLICY "hero_slides_staff_update" ON public.hero_slides
  FOR UPDATE USING (public.is_admin() OR public.is_staff());

CREATE POLICY "hero_slides_admin_delete" ON public.hero_slides
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- TABELA: conteudo_site (chave-valor para textos)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conteudo_site (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave      text NOT NULL UNIQUE,
  valor      text NOT NULL DEFAULT '',
  tipo       text NOT NULL DEFAULT 'texto'
               CHECK (tipo IN ('texto', 'texto_longo', 'email', 'telefone', 'url', 'numero')),
  secao      text NOT NULL
               CHECK (secao IN ('contatos', 'sobre', 'institucional')),
  rotulo     text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conteudo_site_secao_idx ON public.conteudo_site (secao);

ALTER TABLE public.conteudo_site ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conteudo_site_public_select" ON public.conteudo_site
  FOR SELECT USING (true);

CREATE POLICY "conteudo_site_staff_update" ON public.conteudo_site
  FOR UPDATE USING (public.is_admin() OR public.is_staff());

CREATE POLICY "conteudo_site_admin_insert" ON public.conteudo_site
  FOR INSERT WITH CHECK (public.is_admin());

-- =====================================================
-- TABELA: sobre_galeria (imagens da página Sobre Nós)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sobre_galeria (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url        text NOT NULL,
  alt        text NOT NULL DEFAULT '',
  ordem      int NOT NULL DEFAULT 0,
  ativo      boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sobre_galeria_ordem_idx ON public.sobre_galeria (ordem);

ALTER TABLE public.sobre_galeria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sobre_galeria_public_select" ON public.sobre_galeria
  FOR SELECT USING (true);

CREATE POLICY "sobre_galeria_staff_insert" ON public.sobre_galeria
  FOR INSERT WITH CHECK (public.is_admin() OR public.is_staff());

CREATE POLICY "sobre_galeria_staff_update" ON public.sobre_galeria
  FOR UPDATE USING (public.is_admin() OR public.is_staff());

CREATE POLICY "sobre_galeria_admin_delete" ON public.sobre_galeria
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- SEED: conteúdo padrão
-- =====================================================
INSERT INTO public.conteudo_site (chave, valor, tipo, secao, rotulo) VALUES
  -- Contatos
  ('contato_telefone',  '(11) 99999-9999',             'telefone',    'contatos', 'Telefone'),
  ('contato_email',     'contato@a2tech.com.br',         'email',       'contatos', 'E-mail'),
  ('contato_whatsapp',  '5511999999999',                 'telefone',    'contatos', 'WhatsApp (somente número)'),
  ('contato_endereco',  'Av. Paulista, 1000',            'texto',       'contatos', 'Endereço'),
  ('contato_bairro',    'Bela Vista',                    'texto',       'contatos', 'Bairro'),
  ('contato_cidade',    'São Paulo',                     'texto',       'contatos', 'Cidade'),
  ('contato_estado',    'SP',                            'texto',       'contatos', 'Estado (sigla)'),
  ('contato_cep',       '01310-100',                     'texto',       'contatos', 'CEP'),
  ('contato_horario',   'Segunda a Sexta, 9h às 18h',   'texto',       'contatos', 'Horário de Atendimento'),

  -- Sobre Nós
  ('sobre_titulo',      'Sobre a A2 Brasil Supplies',   'texto',       'sobre',    'Título da página'),
  ('sobre_subtitulo',   'Especialistas em equipamentos de elevação e amarração',
                                                          'texto',       'sobre',    'Subtítulo'),
  ('sobre_historia',
    'A A2 Brasil Supplies nasceu da necessidade de oferecer ao mercado brasileiro equipamentos de elevação e amarração de alta qualidade, com certificação e suporte técnico especializado. Atuamos como revendedores autorizados, garantindo produtos confiáveis e dentro das normas ABNT e ISO.',
                                                          'texto_longo', 'sobre',    'Nossa História'),
  ('sobre_missao',
    'Fornecer soluções de elevação e amarração seguras, certificadas e de alta qualidade para a indústria brasileira, com suporte técnico e atendimento consultivo.',
                                                          'texto_longo', 'sobre',    'Nossa Missão'),
  ('sobre_visao',
    'Ser reconhecida como a principal distribuidora de equipamentos de elevação e amarração do Brasil, referência em qualidade e segurança.',
                                                          'texto_longo', 'sobre',    'Nossa Visão'),
  ('sobre_valores',
    'Segurança em primeiro lugar, Qualidade sem concessões, Transparência com clientes e parceiros, Comprometimento com prazos e resultados.',
                                                          'texto_longo', 'sobre',    'Nossos Valores'),
  ('sobre_stat_clientes', '500+',                        'texto',       'sobre',    'Clientes atendidos'),
  ('sobre_stat_anos',     '20+',                         'texto',       'sobre',    'Anos de experiência'),
  ('sobre_stat_pedidos',  '10.000+',                     'texto',       'sobre',    'Pedidos entregues'),
  ('sobre_stat_estados',  '27',                          'texto',       'sobre',    'Estados atendidos'),

  -- Seção Institucional (cards da home)
  ('inst_card1_titulo',   'Nossa Missão',                'texto',       'institucional', 'Card 1 — Título'),
  ('inst_card1_descricao','Soluções de elevação seguras e certificadas para a indústria.',
                                                          'texto_longo', 'institucional', 'Card 1 — Descrição'),
  ('inst_card2_titulo',   'Certificações',               'texto',       'institucional', 'Card 2 — Título'),
  ('inst_card2_descricao','Produtos certificados ISO 9001 e ABNT para máxima segurança.',
                                                          'texto_longo', 'institucional', 'Card 2 — Descrição'),
  ('inst_card3_titulo',   'Clientes Satisfeitos',        'texto',       'institucional', 'Card 3 — Título'),
  ('inst_card3_numero',   '500+',                        'texto',       'institucional', 'Card 3 — Número'),
  ('inst_card3_descricao','Empresas confiam na qualidade e suporte técnico da A2.',
                                                          'texto_longo', 'institucional', 'Card 3 — Descrição'),
  ('inst_card4_titulo',   'Anos de Mercado',             'texto',       'institucional', 'Card 4 — Título'),
  ('inst_card4_numero',   '20+',                         'texto',       'institucional', 'Card 4 — Número'),
  ('inst_card4_descricao','Experiência consolidada em equipamentos de elevação e amarração.',
                                                          'texto_longo', 'institucional', 'Card 4 — Descrição')
ON CONFLICT (chave) DO NOTHING;
