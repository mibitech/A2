-- Script: limpar dados de teste (manter estrutura e templates)
-- Tabelas limpas: movimentacoes_estoque, itens_pedido, pedidos, lotes,
--                 lancamentos_caixa, campanhas_crm
-- Tabelas MANTIDAS: produtos, fornecedores, usuarios, categorias_caixa,
--                   campanhas_templates, conteudo_site, hero_slides, etc.
--
-- ATENÇÃO: irreversível — execute apenas em ambiente de homologação/teste
-- ou quando tiver certeza de que os dados podem ser descartados.

BEGIN;

-- 1. Movimentações de estoque (sem FK filha)
DELETE FROM public.movimentacoes_estoque;

-- 2. Itens do pedido (referencia pedidos + lotes)
DELETE FROM public.itens_pedido;

-- 3. Pedidos
DELETE FROM public.pedidos;

-- 4. Lotes (agora sem itens apontando para eles)
DELETE FROM public.lotes;

-- 5. Lançamentos de caixa
DELETE FROM public.lancamentos_caixa;

-- 6. Campanhas (manter templates)
DELETE FROM public.campanhas_crm;

-- Resetar estoque dos produtos para 0 (os lotes foram apagados)
UPDATE public.produtos SET estoque = 0;

COMMIT;

-- Verificação final
SELECT 'movimentacoes_estoque' AS tabela, COUNT(*) FROM public.movimentacoes_estoque
UNION ALL SELECT 'itens_pedido',   COUNT(*) FROM public.itens_pedido
UNION ALL SELECT 'pedidos',        COUNT(*) FROM public.pedidos
UNION ALL SELECT 'lotes',          COUNT(*) FROM public.lotes
UNION ALL SELECT 'lancamentos_caixa', COUNT(*) FROM public.lancamentos_caixa
UNION ALL SELECT 'campanhas_crm',  COUNT(*) FROM public.campanhas_crm;
