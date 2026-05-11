-- =====================================================
-- SCRIPT: Preparar base para produção
-- Arquivo: supabase/scripts/preparar_producao.sql
-- Executar: Supabase Dashboard → SQL Editor → Run
--
-- O QUE ESTE SCRIPT FAZ:
--   ✅ Mantém dados de apoio/configuração
--      (produtos, fornecedores, categorias_caixa,
--       campanhas_templates, hero_slides, conteudo_site,
--       sobre_galeria)
--   🗑️  Limpa dados operacionais de teste
--      (pedidos, clientes, endereços, movimentações de
--       estoque, lançamentos do caixa, campanhas enviadas)
--   👤 Mantém rlcunha@gmail.com como único usuário admin
--   🔄 Reseta estoque dos produtos para 0
--
-- ⚠️  IRREVERSÍVEL — faça backup antes se necessário.
-- =====================================================

BEGIN;

-- =====================================================
-- PASSO 0: Verificar que o admin existe antes de começar
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'rlcunha@gmail.com'
  ) THEN
    RAISE EXCEPTION
      'Usuário rlcunha@gmail.com não encontrado. Abortando.';
  END IF;
  RAISE NOTICE '✔ Admin encontrado. Iniciando limpeza...';
END $$;

-- =====================================================
-- PASSO 1: Dados transacionais
--   itens_pedido antes de pedidos (FK RESTRICT em produtos)
-- =====================================================
DELETE FROM public.itens_pedido;
DELETE FROM public.pedidos;

-- =====================================================
-- PASSO 2: Endereços de clientes
-- =====================================================
DELETE FROM public.enderecos;

-- =====================================================
-- PASSO 3: Histórico de estoque + reset do saldo
-- =====================================================
DELETE FROM public.movimentacoes_estoque;
UPDATE public.produtos SET estoque = 0;

-- =====================================================
-- PASSO 4: Fluxo de caixa
-- =====================================================
DELETE FROM public.lancamentos_caixa;

-- =====================================================
-- PASSO 5: Campanhas enviadas (mantém templates)
-- =====================================================
DELETE FROM public.campanhas_crm;

-- =====================================================
-- PASSO 6: NPS — apaga se a tabela existir
-- =====================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'nps_respostas'
  ) THEN
    DELETE FROM public.nps_respostas;
    RAISE NOTICE '✔ nps_respostas: limpas.';
  END IF;
END $$;

-- =====================================================
-- PASSO 7: Garantir role admin ANTES de deletar outros
-- =====================================================
UPDATE public.usuarios
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'rlcunha@gmail.com');

-- =====================================================
-- PASSO 8: Remover usuários de teste
--   pedidos e endereços já foram deletados,
--   então a FK RESTRICT não bloqueia
-- =====================================================
DELETE FROM public.usuarios
WHERE id != (SELECT id FROM auth.users WHERE email = 'rlcunha@gmail.com');

-- =====================================================
-- PASSO 9: Remover contas de teste do Supabase Auth
--   ON DELETE CASCADE limpa qualquer resíduo em public.usuarios
-- =====================================================
DELETE FROM auth.users
WHERE email != 'rlcunha@gmail.com';

COMMIT;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
SELECT tabela, registros, esperado
FROM (
  SELECT 'usuarios'               AS tabela, COUNT(*)::int AS registros, '1 (admin)'  AS esperado FROM public.usuarios
  UNION ALL
  SELECT 'pedidos',                COUNT(*)::int, '0' FROM public.pedidos
  UNION ALL
  SELECT 'itens_pedido',           COUNT(*)::int, '0' FROM public.itens_pedido
  UNION ALL
  SELECT 'enderecos',              COUNT(*)::int, '0' FROM public.enderecos
  UNION ALL
  SELECT 'movimentacoes_estoque',  COUNT(*)::int, '0' FROM public.movimentacoes_estoque
  UNION ALL
  SELECT 'lancamentos_caixa',      COUNT(*)::int, '0' FROM public.lancamentos_caixa
  UNION ALL
  SELECT 'campanhas_crm',          COUNT(*)::int, '0' FROM public.campanhas_crm
  UNION ALL
  SELECT 'produtos',               COUNT(*)::int, 'intacto' FROM public.produtos
  UNION ALL
  SELECT 'fornecedores',           COUNT(*)::int, 'intacto' FROM public.fornecedores
  UNION ALL
  SELECT 'categorias_caixa',       COUNT(*)::int, 'intacto' FROM public.categorias_caixa
  UNION ALL
  SELECT 'campanhas_templates',    COUNT(*)::int, 'intacto' FROM public.campanhas_templates
  UNION ALL
  SELECT 'hero_slides',            COUNT(*)::int, 'intacto' FROM public.hero_slides
  UNION ALL
  SELECT 'conteudo_site',          COUNT(*)::int, 'intacto' FROM public.conteudo_site
  UNION ALL
  SELECT 'sobre_galeria',          COUNT(*)::int, 'intacto' FROM public.sobre_galeria
) t
ORDER BY esperado, tabela;

-- Confirmar dados do usuário admin
SELECT
  u.id,
  a.email,
  u.role,
  u.nome_completo AS nome
FROM public.usuarios u
JOIN auth.users a ON a.id = u.id;
