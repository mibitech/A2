-- Tabela de templates reutilizáveis de campanhas
CREATE TABLE IF NOT EXISTS public.campanhas_templates (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        text        NOT NULL,
  descricao     text,
  assunto       text        NOT NULL,
  conteudo_html text        NOT NULL,
  segmento      text        NOT NULL DEFAULT 'todos' CHECK (segmento IN ('todos','clientes','por_tag')),
  tag_filtro    text,
  ativo         boolean     NOT NULL DEFAULT true,
  criado_por    uuid        REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campanhas_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff acessa templates de campanhas"
  ON public.campanhas_templates FOR ALL
  USING (public.is_staff());

-- Referência opcional: campanha pode ter sido originada de um template
ALTER TABLE public.campanhas_crm
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.campanhas_templates(id) ON DELETE SET NULL;

-- Seed: 5 templates base (migrados dos seeds anteriores)
INSERT INTO public.campanhas_templates (titulo, descricao, assunto, conteudo_html, segmento) VALUES

('Boas-vindas ao novo cliente',
 'Enviado logo após o primeiro cadastro ou primeira compra',
 'Bem-vindo(a) à A2 Brasil Supplies!',
 '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);"><tr><td style="background:#6d28d9;padding:28px 32px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:24px;">A2 <span style="font-weight:300">Brasil Supplies</span></h1></td></tr><tr><td style="padding:32px;"><h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;">Olá, {{nome}}! 👋</h2><p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">Seja muito bem-vindo(a) à <strong>A2 Brasil Supplies</strong>! Ficamos felizes em ter você conosco.</p><p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">Somos especializados em equipamentos de elevação e amarração de cargas com qualidade e segurança que seu negócio merece.</p><table cellpadding="0" cellspacing="0"><tr><td style="background:#6d28d9;border-radius:6px;padding:12px 28px;"><a href="https://www.a2brasilsupplies.com.br/produtos" style="color:#fff;font-size:15px;font-weight:700;text-decoration:none;">Ver nossos produtos →</a></td></tr></table></td></tr><tr><td style="background:#f8f8f8;padding:20px 32px;text-align:center;border-top:1px solid #e5e5e5;"><p style="margin:0;color:#888;font-size:12px;">© 2026 A2 Brasil Supplies LTDA. Para cancelar o recebimento, <a href="#" style="color:#6d28d9;">clique aqui</a>.</p></td></tr></table></td></tr></table></body></html>',
 'todos'),

('Oferta especial — Cintas FitaCabo',
 'Promoção de produtos FitaCabo para clientes ativos',
 '🔥 Oferta exclusiva para você — Cintas FitaCabo com desconto',
 '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;"><tr><td style="background:#dc2626;padding:28px 32px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:22px;">⚡ OFERTA ESPECIAL</h1><p style="margin:8px 0 0;color:#fecaca;font-size:14px;">Válida por tempo limitado</p></td></tr><tr><td style="padding:32px;"><h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;">{{nome}}, preparamos algo especial para você!</h2><p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">Nossas <strong>Cintas de Elevação FitaCabo</strong> estão com condições exclusivas para clientes como você.</p><ul style="color:#555;font-size:14px;line-height:2;padding-left:20px;"><li>✅ Certificadas NR-11</li><li>✅ Capacidade de até 100 toneladas</li><li>✅ Entrega rápida para todo o Brasil</li></ul><table cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr><td style="background:#dc2626;border-radius:6px;padding:12px 28px;"><a href="https://www.a2brasilsupplies.com.br/produtos" style="color:#fff;font-size:15px;font-weight:700;text-decoration:none;">Ver oferta completa →</a></td></tr></table></td></tr><tr><td style="background:#f8f8f8;padding:20px 32px;text-align:center;border-top:1px solid #e5e5e5;"><p style="margin:0;color:#888;font-size:12px;">© 2026 A2 Brasil Supplies LTDA.</p></td></tr></table></td></tr></table></body></html>',
 'clientes'),

('Conteúdo educativo — Inspeção de cintas NR-11',
 'E-mail educativo sobre boas práticas de segurança',
 '📋 Você sabe quando descartar uma cinta de elevação?',
 '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;"><tr><td style="background:#1d4ed8;padding:28px 32px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:20px;">📋 Segurança em Primeiro Lugar</h1></td></tr><tr><td style="padding:32px;"><h2 style="color:#1a1a1a;font-size:18px;margin:0 0 12px;">{{nome}}, você sabia?</h2><p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">A norma <strong>NR-11</strong> exige a inspeção periódica de todos os equipamentos de elevação. Mas você sabe identificar quando uma cinta deve ser descartada?</p><div style="background:#eff6ff;border-left:4px solid #1d4ed8;padding:16px;border-radius:4px;margin-bottom:20px;"><p style="margin:0;color:#1e40af;font-size:14px;font-weight:600;">Descarte imediato se houver:</p><ul style="margin:8px 0 0;color:#1e40af;font-size:14px;line-height:1.8;padding-left:20px;"><li>Cortes ou abrasões profundas</li><li>Costuras danificadas ou abertas</li><li>Deformação permanente</li><li>Queimaduras ou fusão de fibras</li></ul></div><table cellpadding="0" cellspacing="0"><tr><td style="background:#1d4ed8;border-radius:6px;padding:12px 28px;"><a href="https://www.a2brasilsupplies.com.br/produtos" style="color:#fff;font-size:14px;font-weight:700;text-decoration:none;">Ver cintas certificadas →</a></td></tr></table></td></tr><tr><td style="background:#f8f8f8;padding:20px 32px;text-align:center;border-top:1px solid #e5e5e5;"><p style="margin:0;color:#888;font-size:12px;">© 2026 A2 Brasil Supplies LTDA.</p></td></tr></table></td></tr></table></body></html>',
 'todos'),

('Reativação — Sentimos sua falta',
 'Para clientes inativos há mais de 60 dias',
 '{{nome}}, sentimos sua falta! Temos novidades para você 💜',
 '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;"><tr><td style="background:#6d28d9;padding:28px 32px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:22px;">💜 Sentimos sua falta!</h1></td></tr><tr><td style="padding:32px;text-align:center;"><p style="font-size:40px;margin:0 0 16px;">😢</p><h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;">{{nome}}, faz tempo que não nos vemos...</h2><p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">Enquanto você estava fora, adicionamos novos produtos e melhoramos nossa entrega. Que tal dar uma olhada?</p><table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background:#6d28d9;border-radius:6px;padding:14px 32px;"><a href="https://www.a2brasilsupplies.com.br/produtos" style="color:#fff;font-size:15px;font-weight:700;text-decoration:none;">Ver novidades →</a></td></tr></table></td></tr><tr><td style="background:#f8f8f8;padding:20px 32px;text-align:center;border-top:1px solid #e5e5e5;"><p style="margin:0;color:#888;font-size:12px;">© 2026 A2 Brasil Supplies LTDA.</p></td></tr></table></td></tr></table></body></html>',
 'por_tag'),

('Alerta — Estoque limitado',
 'Aviso de disponibilidade restrita de produtos',
 '⚠️ Últimas unidades disponíveis — garanta o seu!',
 '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;"><tr><td style="background:#d97706;padding:28px 32px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:22px;">⚠️ ESTOQUE LIMITADO</h1></td></tr><tr><td style="padding:32px;"><h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;">{{nome}}, corra — últimas unidades!</h2><p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">Nosso estoque de <strong>Sling Colorida</strong> está se esgotando rapidamente. Garanta o seu antes que acabe!</p><div style="background:#fffbeb;border:2px solid #fbbf24;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;"><p style="margin:0;color:#92400e;font-size:16px;font-weight:700;">🚨 Últimas unidades disponíveis</p></div><table cellpadding="0" cellspacing="0"><tr><td style="background:#d97706;border-radius:6px;padding:12px 28px;"><a href="https://www.a2brasilsupplies.com.br/produtos" style="color:#fff;font-size:15px;font-weight:700;text-decoration:none;">Comprar agora →</a></td></tr></table></td></tr><tr><td style="background:#f8f8f8;padding:20px 32px;text-align:center;border-top:1px solid #e5e5e5;"><p style="margin:0;color:#888;font-size:12px;">© 2026 A2 Brasil Supplies LTDA.</p></td></tr></table></td></tr></table></body></html>',
 'clientes');
