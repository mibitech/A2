-- =====================================================
-- SEED: 10 Pedidos Fake para Testes
-- Executar no Supabase SQL Editor (como postgres/service_role)
-- Seguro para reaplicar — usa ON CONFLICT DO NOTHING
-- =====================================================

-- =====================================================
-- PASSO 1 — Criar 5 usuários fake em auth.users
-- =====================================================
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  is_sso_user,
  is_anonymous
) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated',
    'carlos.silva@email.com',
    '$2a$10$fakehashforcarlossilvaxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nome_completo":"Carlos Silva"}',
    false, false, false
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated',
    'ana.rodrigues@email.com',
    '$2a$10$fakehashforanarodriguesxxxxxxxxxxxxxxxxxxxxxxxxxx',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nome_completo":"Ana Rodrigues"}',
    false, false, false
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated',
    'pedro.mendes@email.com',
    '$2a$10$fakehashforpedromendesxxxxxxxxxxxxxxxxxxxxxxxxxx',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nome_completo":"Pedro Mendes"}',
    false, false, false
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'authenticated', 'authenticated',
    'mariana.costa@email.com',
    '$2a$10$fakehashformarianacostaxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nome_completo":"Mariana Costa"}',
    false, false, false
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    'authenticated', 'authenticated',
    'joao.oliveira@email.com',
    '$2a$10$fakehashforjaoliveiraxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nome_completo":"João Oliveira"}',
    false, false, false
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASSO 2 — Criar registros em public.usuarios
-- =====================================================
INSERT INTO public.usuarios (id, email, nome_completo, telefone, cpf_cnpj, tipo_pessoa, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'carlos.silva@email.com',   'Carlos Silva',    '(11) 98765-4321', '123.456.789-01', 'fisica',   'cliente'),
  ('a0000000-0000-0000-0000-000000000002', 'ana.rodrigues@email.com',  'Ana Rodrigues',   '(21) 97654-3210', '234.567.890-12', 'fisica',   'cliente'),
  ('a0000000-0000-0000-0000-000000000003', 'pedro.mendes@email.com',   'Pedro Mendes',    '(31) 96543-2109', '345.678.901-23', 'fisica',   'cliente'),
  ('a0000000-0000-0000-0000-000000000004', 'mariana.costa@email.com',  'Mariana Costa',   '(41) 95432-1098', '456.789.012-34', 'fisica',   'cliente'),
  ('a0000000-0000-0000-0000-000000000005', 'joao.oliveira@email.com',  'João Oliveira',   '(51) 94321-0987', '12.345.678/0001-90', 'juridica', 'cliente')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASSO 3 — Criar 10 pedidos com status variados
-- =====================================================
-- Endereço padrão de entrega (JSON inline)
-- Os pedidos referenciam produtos via subquery em produto_id

DO $$
DECLARE
  v_prod1 UUID; v_prod2 UUID; v_prod3 UUID; v_prod4 UUID;
  v_pid1  UUID := 'b0000000-0000-0000-0000-000000000001';
  v_pid2  UUID := 'b0000000-0000-0000-0000-000000000002';
  v_pid3  UUID := 'b0000000-0000-0000-0000-000000000003';
  v_pid4  UUID := 'b0000000-0000-0000-0000-000000000004';
  v_pid5  UUID := 'b0000000-0000-0000-0000-000000000005';
  v_pid6  UUID := 'b0000000-0000-0000-0000-000000000006';
  v_pid7  UUID := 'b0000000-0000-0000-0000-000000000007';
  v_pid8  UUID := 'b0000000-0000-0000-0000-000000000008';
  v_pid9  UUID := 'b0000000-0000-0000-0000-000000000009';
  v_pid10 UUID := 'b0000000-0000-0000-0000-000000000010';
BEGIN
  -- Buscar IDs dos produtos cadastrados
  SELECT id INTO v_prod1 FROM public.produtos WHERE sku = 'FIT-3M-001'   LIMIT 1;
  SELECT id INTO v_prod2 FROM public.produtos WHERE sku = 'CAB-FLEX-001' LIMIT 1;
  SELECT id INTO v_prod3 FROM public.produtos WHERE sku = 'ABR-NY-001'   LIMIT 1;
  SELECT id INTO v_prod4 FROM public.produtos WHERE sku = 'ELE-FLEX-001' LIMIT 1;

  -- Fallback: pega qualquer produto se os SKUs não existirem
  IF v_prod1 IS NULL THEN SELECT id INTO v_prod1 FROM public.produtos ORDER BY created_at LIMIT 1; END IF;
  IF v_prod2 IS NULL THEN SELECT id INTO v_prod2 FROM public.produtos ORDER BY created_at LIMIT 1 OFFSET 1; END IF;
  IF v_prod3 IS NULL THEN SELECT id INTO v_prod3 FROM public.produtos ORDER BY created_at LIMIT 1; END IF;
  IF v_prod4 IS NULL THEN SELECT id INTO v_prod4 FROM public.produtos ORDER BY created_at LIMIT 1; END IF;

  -- ---- PEDIDO 1 — pendente ----
  INSERT INTO public.pedidos (id, usuario_id, status, subtotal, frete, desconto, total, endereco_entrega, created_at)
  VALUES (v_pid1, 'a0000000-0000-0000-0000-000000000001', 'pendente',
    202.80, 15.00, 0, 217.80,
    '{"nome":"Carlos Silva","logradouro":"Rua das Flores","numero":"123","complemento":"Apto 4","bairro":"Centro","cidade":"São Paulo","estado":"SP","cep":"01310-100"}',
    NOW() - INTERVAL '2 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
  VALUES
    (v_pid1, v_prod1, 3,  9.90,  29.70),
    (v_pid1, v_prod3, 7, 19.90, 139.30),
    (v_pid1, v_prod4, 1, 33.80,  33.80)
  ON CONFLICT DO NOTHING;

  -- ---- PEDIDO 2 — pendente ----
  INSERT INTO public.pedidos (id, usuario_id, status, subtotal, frete, desconto, total, endereco_entrega, created_at)
  VALUES (v_pid2, 'a0000000-0000-0000-0000-000000000003', 'pendente',
    9.90, 8.00, 0, 17.90,
    '{"nome":"Pedro Mendes","logradouro":"Av. Brasil","numero":"500","complemento":null,"bairro":"Jardim América","cidade":"Belo Horizonte","estado":"MG","cep":"30140-002"}',
    NOW() - INTERVAL '1 day')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
  VALUES (v_pid2, v_prod1, 1, 9.90, 9.90)
  ON CONFLICT DO NOTHING;

  -- ---- PEDIDO 3 — pago ----
  INSERT INTO public.pedidos (id, usuario_id, status, subtotal, frete, desconto, total, endereco_entrega, created_at)
  VALUES (v_pid3, 'a0000000-0000-0000-0000-000000000002', 'pago',
    189.90, 20.00, 10.00, 199.90,
    '{"nome":"Ana Rodrigues","logradouro":"Rua Voluntários da Pátria","numero":"88","complemento":"Bloco B","bairro":"Botafogo","cidade":"Rio de Janeiro","estado":"RJ","cep":"22270-010"}',
    NOW() - INTERVAL '5 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
  VALUES (v_pid3, v_prod2, 1, 189.90, 189.90)
  ON CONFLICT DO NOTHING;

  -- ---- PEDIDO 4 — pago ----
  INSERT INTO public.pedidos (id, usuario_id, status, subtotal, frete, desconto, total, endereco_entrega, created_at)
  VALUES (v_pid4, 'a0000000-0000-0000-0000-000000000005', 'pago',
    380.00, 30.00, 0, 410.00,
    '{"nome":"João Oliveira","logradouro":"Rua XV de Novembro","numero":"1200","complemento":"Sala 3","bairro":"Centro","cidade":"Curitiba","estado":"PR","cep":"80060-000"}',
    NOW() - INTERVAL '7 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
  VALUES
    (v_pid4, v_prod2, 2, 189.90, 379.80),
    (v_pid4, v_prod1, 1,   9.90,   9.90)
  ON CONFLICT DO NOTHING;

  -- ---- PEDIDO 5 — processando ----
  INSERT INTO public.pedidos (id, usuario_id, status, subtotal, frete, desconto, total, endereco_entrega, observacoes, created_at)
  VALUES (v_pid5, 'a0000000-0000-0000-0000-000000000001', 'processando',
    164.70, 15.00, 0, 179.70,
    '{"nome":"Carlos Silva","logradouro":"Rua das Flores","numero":"123","complemento":"Apto 4","bairro":"Centro","cidade":"São Paulo","estado":"SP","cep":"01310-100"}',
    'Cliente solicitou embalagem reforçada',
    NOW() - INTERVAL '10 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
  VALUES
    (v_pid5, v_prod3, 5, 19.90,  99.50),
    (v_pid5, v_prod4, 1, 33.80,  33.80),
    (v_pid5, v_prod1, 2,  9.90,  19.80),
    (v_pid5, v_prod3, 1, 11.60,  11.60)
  ON CONFLICT DO NOTHING;

  -- ---- PEDIDO 6 — processando ----
  INSERT INTO public.pedidos (id, usuario_id, status, subtotal, frete, desconto, total, endereco_entrega, created_at)
  VALUES (v_pid6, 'a0000000-0000-0000-0000-000000000004', 'processando',
    129.90, 18.00, 0, 147.90,
    '{"nome":"Mariana Costa","logradouro":"Alameda Santos","numero":"745","complemento":"Cj 82","bairro":"Cerqueira César","cidade":"São Paulo","estado":"SP","cep":"01419-001"}',
    NOW() - INTERVAL '12 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
  VALUES (v_pid6, v_prod4, 1, 129.90, 129.90)
  ON CONFLICT DO NOTHING;

  -- ---- PEDIDO 7 — enviado ----
  INSERT INTO public.pedidos (id, usuario_id, status, subtotal, frete, desconto, total, endereco_entrega, created_at)
  VALUES (v_pid7, 'a0000000-0000-0000-0000-000000000002', 'enviado',
    59.80, 12.00, 0, 71.80,
    '{"nome":"Ana Rodrigues","logradouro":"Rua Voluntários da Pátria","numero":"88","complemento":"Bloco B","bairro":"Botafogo","cidade":"Rio de Janeiro","estado":"RJ","cep":"22270-010"}',
    NOW() - INTERVAL '15 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
  VALUES
    (v_pid7, v_prod3, 2, 19.90, 39.80),
    (v_pid7, v_prod1, 2,  9.90, 19.80)
  ON CONFLICT DO NOTHING;

  -- ---- PEDIDO 8 — enviado ----
  INSERT INTO public.pedidos (id, usuario_id, status, subtotal, frete, desconto, total, endereco_entrega, created_at)
  VALUES (v_pid8, 'a0000000-0000-0000-0000-000000000005', 'enviado',
    259.80, 25.00, 20.00, 264.80,
    '{"nome":"João Oliveira","logradouro":"Rua XV de Novembro","numero":"1200","complemento":"Sala 3","bairro":"Centro","cidade":"Curitiba","estado":"PR","cep":"80060-000"}',
    NOW() - INTERVAL '18 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
  VALUES
    (v_pid8, v_prod4, 2, 129.90, 259.80)
  ON CONFLICT DO NOTHING;

  -- ---- PEDIDO 9 — entregue ----
  INSERT INTO public.pedidos (id, usuario_id, status, subtotal, frete, desconto, total, endereco_entrega, created_at)
  VALUES (v_pid9, 'a0000000-0000-0000-0000-000000000003', 'entregue',
    199.80, 15.00, 0, 214.80,
    '{"nome":"Pedro Mendes","logradouro":"Av. Brasil","numero":"500","complemento":null,"bairro":"Jardim América","cidade":"Belo Horizonte","estado":"MG","cep":"30140-002"}',
    NOW() - INTERVAL '25 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
  VALUES
    (v_pid9, v_prod2, 1, 189.90, 189.90),
    (v_pid9, v_prod1, 1,   9.90,   9.90)
  ON CONFLICT DO NOTHING;

  -- ---- PEDIDO 10 — cancelado ----
  INSERT INTO public.pedidos (id, usuario_id, status, subtotal, frete, desconto, total, endereco_entrega, observacoes, created_at)
  VALUES (v_pid10, 'a0000000-0000-0000-0000-000000000004', 'cancelado',
    39.80, 10.00, 0, 49.80,
    '{"nome":"Mariana Costa","logradouro":"Alameda Santos","numero":"745","complemento":"Cj 82","bairro":"Cerqueira César","cidade":"São Paulo","estado":"SP","cep":"01419-001"}',
    'Cliente desistiu — produto fora de prazo',
    NOW() - INTERVAL '30 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
  VALUES
    (v_pid10, v_prod3, 2, 19.90, 39.80)
  ON CONFLICT DO NOTHING;

END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
SELECT
  p.id,
  u.nome_completo AS cliente,
  p.status,
  p.total,
  COUNT(i.id) AS qtd_itens
FROM public.pedidos p
LEFT JOIN public.usuarios u ON u.id = p.usuario_id
LEFT JOIN public.itens_pedido i ON i.pedido_id = p.id
WHERE p.id::text LIKE 'b0000000%'
GROUP BY p.id, u.nome_completo, p.status, p.total
ORDER BY p.created_at DESC;
