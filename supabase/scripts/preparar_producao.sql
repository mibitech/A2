-- =====================================================
-- SCRIPT: Preparar base para produção
-- Arquivo: supabase/scripts/preparar_producao.sql
-- Executar: Supabase Dashboard → SQL Editor
--
-- O QUE ESTE SCRIPT FAZ:
--   ✅ Mantém todos os dados de configuração/apoio
--      (produtos, fornecedores, categorias, templates,
--       conteúdo do site, carrossel, galeria)
--   🗑️  Limpa todos os dados operacionais de teste
--      (pedidos, clientes, movimentações, lançamentos, campanhas)
--   👤 Mantém rlcunha@gmail.com como único usuário admin
--   🔄 Reseta estoque dos produtos para 0
--      (histórico deletado — relançar entradas reais em produção)
--
-- ⚠️  ATENÇÃO: Esta operação é IRREVERSÍVEL.
--     Faça um backup antes de executar em caso de dúvida.
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
      'Usuário rlcunha@gmail.com não encontrado em auth.users. Abortando.';
  END IF;

  RAISE NOTICE 'Admin encontrado. Iniciando limpeza...';
END $$;

-- =====================================================
-- PASSO 1: Dados transacionais — itens antes de pedidos
--          (itens_pedido.pedido_id ON DELETE CASCADE,
--           mas deletamos explicitamente para clareza)
-- =====================================================
DELETE FROM public.itens_pedido;
RAISE NOTICE 'itens_pedido: limpos.';

DELETE FROM public.pedidos;
RAISE NOTICE 'pedidos: limpos.';

-- =====================================================
-- PASSO 2: Endereços de clientes
--          (enderecos.usuario_id ON DELETE CASCADE,
--           mas pedidos já foram deletados)
-- =====================================================
DELETE FROM public.enderecos;
RAISE NOTICE 'enderecos: limpos.';

-- =====================================================
-- PASSO 3: Histórico de estoque
--          (movimentacoes_estoque.usuario_id ON DELETE SET NULL
--           — pode ser deletado a qualquer momento)
-- =====================================================
DELETE FROM public.movimentacoes_estoque;
RAISE NOTICE 'movimentacoes_estoque: limpas.';

-- Resetar estoque dos produtos para zero
-- (o histórico foi apagado — cadastrar movimentações reais ao entrar em produção)
UPDATE public.produtos SET estoque = 0;
RAISE NOTICE 'produtos.estoque: resetado para 0.';

-- =====================================================
-- PASSO 4: Fluxo de caixa — lançamentos de teste
--          (lancamentos_caixa.criado_por ON DELETE SET NULL)
-- =====================================================
DELETE FROM public.lancamentos_caixa;
RAISE NOTICE 'lancamentos_caixa: limpos.';

-- =====================================================
-- PASSO 5: Campanhas enviadas
--          Mantém: campanhas_templates (dados de apoio)
--          Limpa: campanhas_crm (registros de envio)
-- =====================================================
DELETE FROM public.campanhas_crm;
RAISE NOTICE 'campanhas_crm: limpas. (templates mantidos)';

-- =====================================================
-- PASSO 6: NPS (se a tabela existir)
-- =====================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'nps_respostas'
  ) THEN
    DELETE FROM public.nps_respostas;
    RAISE NOTICE 'nps_respostas: limpas.';
  END IF;
END $$;

-- =====================================================
-- PASSO 7: Garantir que rlcunha@gmail.com é admin
--          (antes de deletar outros usuários)
-- =====================================================
UPDATE public.usuarios
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'rlcunha@gmail.com'
);
RAISE NOTICE 'rlcunha@gmail.com: confirmado como admin.';

-- =====================================================
-- PASSO 8: Remover usuários de teste (public.usuarios)
--          pedidos e enderecos já foram deletados,
--          então a FK RESTRICT não bloqueia mais
-- =====================================================
DELETE FROM public.usuarios
WHERE id != (
  SELECT id FROM auth.users WHERE email = 'rlcunha@gmail.com'
);
RAISE NOTICE 'usuarios de teste: removidos.';

-- =====================================================
-- PASSO 9: Remover contas de teste do Supabase Auth
--          (auth.usuarios ON DELETE CASCADE → limpa
--           qualquer registro residual em public.usuarios)
-- =====================================================
DELETE FROM auth.users
WHERE email != 'rlcunha@gmail.com';
RAISE NOTICE 'auth.users de teste: removidos.';

-- =====================================================
-- COMMIT
-- =====================================================
COMMIT;

-- =====================================================
-- VERIFICAÇÃO FINAL — conferir o resultado
-- =====================================================
SELECT
  tabela,
  registros,
  status
FROM (
  SELECT 'usuarios'            AS tabela, COUNT(*)::int AS registros, '✅ manter' AS status FROM public.usuarios
  UNION ALL
  SELECT 'pedidos',             COUNT(*)::int, '🗑️  deve ser 0' FROM public.pedidos
  UNION ALL
  SELECT 'itens_pedido',        COUNT(*)::int, '🗑️  deve ser 0' FROM public.itens_pedido
  UNION ALL
  SELECT 'enderecos',           COUNT(*)::int, '🗑️  deve ser 0' FROM public.enderecos
  UNION ALL
  SELECT 'movimentacoes_estoque', COUNT(*)::int, '🗑️  deve ser 0' FROM public.movimentacoes_estoque
  UNION ALL
  SELECT 'lancamentos_caixa',   COUNT(*)::int, '🗑️  deve ser 0' FROM public.lancamentos_caixa
  UNION ALL
  SELECT 'campanhas_crm',       COUNT(*)::int, '🗑️  deve ser 0' FROM public.campanhas_crm
  UNION ALL
  SELECT 'produtos',            COUNT(*)::int, '✅ manter' FROM public.produtos
  UNION ALL
  SELECT 'fornecedores',        COUNT(*)::int, '✅ manter' FROM public.fornecedores
  UNION ALL
  SELECT 'categorias_caixa',    COUNT(*)::int, '✅ manter' FROM public.categorias_caixa
  UNION ALL
  SELECT 'campanhas_templates', COUNT(*)::int, '✅ manter' FROM public.campanhas_templates
  UNION ALL
  SELECT 'hero_slides',         COUNT(*)::int, '✅ manter' FROM public.hero_slides
  UNION ALL
  SELECT 'conteudo_site',       COUNT(*)::int, '✅ manter' FROM public.conteudo_site
  UNION ALL
  SELECT 'sobre_galeria',       COUNT(*)::int, '✅ manter' FROM public.sobre_galeria
) t
ORDER BY status DESC, tabela;

-- Confirmar usuário admin
SELECT
  u.id,
  a.email,
  u.role,
  u.nome_completo AS nome,
  a.created_at AS criado_em
FROM public.usuarios u
JOIN auth.users a ON a.id = u.id;
