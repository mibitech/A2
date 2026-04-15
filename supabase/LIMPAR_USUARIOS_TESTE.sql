-- =====================================================
-- LIMPAR USUÁRIOS DE TESTE
-- Use este script para deletar usuários criados durante testes
-- =====================================================

-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- Isso vai deletar o usuário problemático que está causando erro 500

-- 1. Verificar usuários existentes na tabela usuarios
SELECT id, email, nome_completo, role, created_at
FROM public.usuarios
ORDER BY created_at DESC;

-- 2. Verificar usuários no Supabase Auth
-- (Você precisará fazer isso manualmente em Authentication > Users)

-- 3. Deletar usuário específico que está dando erro
-- Substitua o ID pelo ID que aparece no erro (15f47c73-5e27-4ac6-9a38-07111abb9b63)
DELETE FROM auth.users 
WHERE id = '15f47c73-5e27-4ac6-9a38-07111abb9b63';

-- 4. O DELETE CASCADE vai remover automaticamente da tabela usuarios também
-- Verifique se foi removido:
SELECT id, email FROM public.usuarios 
WHERE id = '15f47c73-5e27-4ac6-9a38-07111abb9b63';
-- Deve retornar 0 linhas

-- =====================================================
-- ALTERNATIVA: Limpar TODOS os usuários de teste
-- =====================================================
-- ⚠️ CUIDADO: Isso vai deletar TODOS os usuários!
-- Só use se quiser resetar completamente o banco

/*
-- Descomentar para executar:
DELETE FROM auth.users;
-- Isso vai automaticamente deletar tudo de public.usuarios também
*/

-- =====================================================
-- Após executar este script:
-- =====================================================
-- 1. Aguarde 10-15 minutos (rate limit resetar)
-- 2. Use um NOVO e-mail para testar
-- 3. Não use o mesmo e-mail que deu erro antes
