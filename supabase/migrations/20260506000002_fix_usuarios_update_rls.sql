-- Fix: Allow staff (admin + funcionario) to update usuarios table
-- Previously only is_admin() was allowed; silent RLS block prevented tag saves

DROP POLICY IF EXISTS "Admin pode atualizar qualquer usuário" ON public.usuarios;
DROP POLICY IF EXISTS "Staff pode atualizar usuário" ON public.usuarios;

CREATE POLICY "Staff pode atualizar usuário"
    ON public.usuarios FOR UPDATE
    USING (public.is_staff());
