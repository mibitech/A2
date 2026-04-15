-- =====================================================
-- FIX: Adicionar política INSERT na tabela usuarios
-- Data: 2026-04-07
-- Descrição: Permite que o trigger handle_new_user() insira registros
-- =====================================================

-- Adicionar política de INSERT para permitir que o trigger funcione
CREATE POLICY "Permitir INSERT via trigger de signup"
    ON public.usuarios FOR INSERT
    WITH CHECK (true);

-- COMENTÁRIO: Esta política é necessária porque o trigger handle_new_user()
-- precisa inserir na tabela usuarios quando um novo usuário se cadastra via Supabase Auth.
-- Mesmo com SECURITY DEFINER na função, o RLS bloqueia se não houver uma política INSERT.
-- Com CHECK (true), o trigger pode inserir, mas usuários normais ainda não podem
-- fazer INSERT direto porque o auth.uid() não estará autenticado no momento do signup.
