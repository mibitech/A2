-- =====================================================
-- DIAGNÓSTICO: verificar estado das políticas RLS
-- Rodar no Supabase SQL Editor (não altera nada)
-- =====================================================

-- 1. Listar todas as políticas ativas nas tabelas críticas
SELECT
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('pedidos', 'itens_pedido', 'usuarios')
ORDER BY tablename, cmd, policyname;

-- 2. Verificar se is_admin() e is_staff() existem e funcionam
SELECT
  public.is_admin() AS sou_admin,
  public.is_staff() AS sou_staff;

-- 3. Ver meu usuário e role na tabela pública
SELECT id, email, role
FROM public.usuarios
WHERE id = auth.uid();

-- 4. Contar pedidos visíveis para o usuário atual
SELECT COUNT(*) AS pedidos_visiveis FROM public.pedidos;

-- 5. Contar usuários visíveis (JOIN usado na tela admin)
SELECT COUNT(*) AS usuarios_visiveis FROM public.usuarios;
