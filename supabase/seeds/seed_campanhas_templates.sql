-- =====================================================
-- Seed: Templates de Campanhas CRM
-- Aplique no Supabase SQL Editor
-- Status = 'rascunho' — prontas para envio no painel
-- =====================================================

INSERT INTO public.campanhas_crm (titulo, assunto, conteudo_html, segmento, tag_filtro, status)
VALUES

-- 1. Boas-vindas
(
  'Boas-vindas ao novo cliente',
  'Bem-vindo(a) à A2 Brasil Supplies, {{nome}}!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
  <div style="background: #1d4ed8; padding: 32px 24px; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 24px;">A2 Brasil Supplies</h1>
    <p style="color: #93c5fd; margin: 8px 0 0;">Equipamentos de elevação e amarração</p>
  </div>
  <div style="padding: 32px 24px;">
    <p style="font-size: 16px;">Olá, <strong>{{nome}}</strong>!</p>
    <p>Seja bem-vindo(a) à <strong>A2 Brasil Supplies</strong>. Estamos felizes em tê-lo(a) conosco.</p>
    <p>Somos distribuidores de equipamentos de elevação e amarração de cargas com certificação NR-11, ideais para:</p>
    <ul style="line-height: 1.8;">
      <li>Movimentação e içamento de cargas pesadas</li>
      <li>Amarração para transporte rodoviário</li>
      <li>Identificação e rastreamento de cintas (Etiqueta Azul)</li>
      <li>Içamento de bobinas e fio-máquina</li>
    </ul>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://a2brasilsupplies.com.br/produtos" style="background: #1d4ed8; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Ver catálogo completo</a>
    </div>
    <p style="color: #666; font-size: 14px;">Dúvidas? Responda este e-mail ou fale pelo WhatsApp.</p>
  </div>
  <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
    A2 Brasil Supplies LTDA · Para cancelar o recebimento, entre em contato conosco.
  </div>
</div>',
  'todos',
  NULL,
  'rascunho'
),

-- 2. Oferta especial cintas
(
  'Oferta — Cintas FitaCabo',
  'Oferta especial em cintas de elevação — apenas esta semana',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
  <div style="background: #dc2626; padding: 32px 24px; text-align: center;">
    <p style="color: #fecaca; margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Oferta especial</p>
    <h1 style="color: #fff; margin: 0; font-size: 28px;">Cintas de Elevação FitaCabo</h1>
    <p style="color: #fecaca; margin: 8px 0 0;">Válido até domingo · Enquanto durar o estoque</p>
  </div>
  <div style="padding: 32px 24px;">
    <p>Olá, <strong>{{nome}}</strong>!</p>
    <p>Esta semana temos condições especiais nas nossas cintas de elevação certificadas. Aproveite para repor o estoque da sua equipe.</p>
    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0; font-weight: bold; font-size: 18px;">Desconto especial para clientes recorrentes</p>
      <p style="margin: 8px 0 0; color: #dc2626;">Entre em contato e informe seu e-mail cadastrado.</p>
    </div>
    <p><strong>Produtos em destaque:</strong></p>
    <ul style="line-height: 2;">
      <li><strong>Sling Colorida</strong> — Eslinga redonda tubular até 100t</li>
      <li><strong>Amarração de Cargas</strong> — Cintas e catracas para transporte</li>
      <li><strong>Etiqueta Azul</strong> — Identificação de cintas NR-11</li>
    </ul>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://a2brasilsupplies.com.br/produtos" style="background: #dc2626; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Aproveitar oferta agora</a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
    A2 Brasil Supplies LTDA · Para cancelar o recebimento, entre em contato conosco.
  </div>
</div>',
  'clientes',
  NULL,
  'rascunho'
),

-- 3. Conteúdo educativo NR-11
(
  'Conteúdo — Inspeção de cintas NR-11',
  'Sua cinta de elevação está dentro da validade? Veja como verificar',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
  <div style="background: #1d4ed8; padding: 32px 24px; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 22px;">Segurança em primeiro lugar</h1>
    <p style="color: #93c5fd; margin: 8px 0 0;">Guia rápido de inspeção de cintas — NR-11</p>
  </div>
  <div style="padding: 32px 24px;">
    <p>Olá, <strong>{{nome}}</strong>!</p>
    <p>A NR-11 exige que todas as cintas de elevação sejam inspecionadas periodicamente. Veja os principais pontos a verificar antes de cada uso:</p>
    <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 12px; font-weight: bold;">Checklist de inspeção rápida</p>
      <ul style="margin: 0; padding-left: 20px; line-height: 2; color: #1e40af;">
        <li>Etiqueta de identificação legível e dentro da validade</li>
        <li>Ausência de cortes, abrasão ou desgaste visível</li>
        <li>Costuras íntegras, sem fios soltos ou rompidos</li>
        <li>Sem manchas de óleo, produtos químicos ou queimaduras</li>
        <li>Argolas e ganchos sem deformação ou ferrugem</li>
      </ul>
    </div>
    <p><strong>Cinta com algum desses problemas?</strong> Descarte imediatamente e substitua. O uso de EPI danificado é infração à NR-11 e risco de acidente grave.</p>
    <p>Nossa <strong>Etiqueta Azul</strong> facilita o controle de validade de todo o seu inventário de cintas.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://a2brasilsupplies.com.br/produtos" style="background: #1d4ed8; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Ver Etiqueta Azul</a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
    A2 Brasil Supplies LTDA · Para cancelar o recebimento, entre em contato conosco.
  </div>
</div>',
  'todos',
  NULL,
  'rascunho'
),

-- 4. Reativação de clientes inativos
(
  'Reativação — Sentimos sua falta',
  '{{nome}}, sentimos sua falta! Veja o que há de novo',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
  <div style="background: #0f172a; padding: 32px 24px; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 24px;">Sentimos sua falta, {{nome}}!</h1>
    <p style="color: #94a3b8; margin: 8px 0 0;">Há um tempo que não nos falamos…</p>
  </div>
  <div style="padding: 32px 24px;">
    <p>Olá, <strong>{{nome}}</strong>!</p>
    <p>Faz um tempo que você não visita a A2 Brasil Supplies. Gostaríamos de contar o que temos de novo e oferecer uma condição especial para você voltar.</p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-weight: bold;">Novidades desde sua última visita</p>
      <ul style="line-height: 1.9; margin: 0; padding-left: 20px;">
        <li>Novos kits de amarração para transporte rodoviário</li>
        <li>Sling Colorida em novas capacidades (até 100t)</li>
        <li>Conjunto Carga Cesa para fio-máquina e bobinas</li>
      </ul>
    </div>
    <p style="text-align: center; font-size: 18px; font-weight: bold; color: #1d4ed8;">Fale conosco e ganhe condições exclusivas no seu próximo pedido.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://a2brasilsupplies.com.br/produtos" style="background: #0f172a; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Voltar a explorar o catálogo</a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
    A2 Brasil Supplies LTDA · Para cancelar o recebimento, entre em contato conosco.
  </div>
</div>',
  'por_tag',
  'inativo',
  'rascunho'
),

-- 5. Alerta de estoque limitado
(
  'Alerta — Estoque limitado Sling Colorida',
  'Últimas unidades disponíveis — garanta o seu',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
  <div style="background: #d97706; padding: 32px 24px; text-align: center;">
    <p style="color: #fef3c7; margin: 0 0 8px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Estoque limitado</p>
    <h1 style="color: #fff; margin: 0; font-size: 26px;">Últimas unidades disponíveis</h1>
  </div>
  <div style="padding: 32px 24px;">
    <p>Olá, <strong>{{nome}}</strong>!</p>
    <p>Informamos que o estoque de alguns itens está chegando ao fim. Se você precisa desses produtos nos próximos meses, recomendamos garantir já.</p>
    <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 12px; font-weight: bold; color: #92400e;">Produtos com estoque crítico:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #fde68a;">
          <td style="padding: 8px 0; font-weight: bold;">Sling Colorida</td>
          <td style="padding: 8px 0; text-align: right; color: #dc2626; font-weight: bold;">Poucas unidades</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Carga Cesa</td>
          <td style="padding: 8px 0; text-align: right; color: #dc2626; font-weight: bold;">Poucas unidades</td>
        </tr>
      </table>
    </div>
    <p>O próximo lote tem prazo de entrega de <strong>30 a 45 dias</strong>. Para não ficar sem o produto, faça seu pedido agora.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://a2brasilsupplies.com.br/produtos" style="background: #d97706; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Garantir meu pedido agora</a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
    A2 Brasil Supplies LTDA · Para cancelar o recebimento, entre em contato conosco.
  </div>
</div>',
  'clientes',
  NULL,
  'rascunho'
);
