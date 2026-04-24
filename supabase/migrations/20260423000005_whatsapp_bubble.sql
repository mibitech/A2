-- =====================================================
-- Migration: Configurações do WhatsApp Bubble
-- =====================================================

-- Expande o CHECK de secao para incluir 'whatsapp'
ALTER TABLE public.conteudo_site
  DROP CONSTRAINT IF EXISTS conteudo_site_secao_check;

ALTER TABLE public.conteudo_site
  ADD CONSTRAINT conteudo_site_secao_check
  CHECK (secao IN ('contatos', 'sobre', 'institucional', 'whatsapp'));

-- Seed padrão
INSERT INTO public.conteudo_site (chave, valor, tipo, secao, rotulo) VALUES
  ('whatsapp_ativo',    'true',                                                 'texto',       'whatsapp', 'Exibir botão WhatsApp no site'),
  ('whatsapp_numero',   '5511999999999',                                        'telefone',    'whatsapp', 'Número (DDI+DDD+número, só dígitos)'),
  ('whatsapp_mensagem', 'Olá! Gostaria de mais informações sobre os produtos.', 'texto_longo', 'whatsapp', 'Mensagem pré-preenchida'),
  ('whatsapp_label',    'Fale conosco',                                         'texto',       'whatsapp', 'Texto do botão (tooltip)')
ON CONFLICT (chave) DO NOTHING;
