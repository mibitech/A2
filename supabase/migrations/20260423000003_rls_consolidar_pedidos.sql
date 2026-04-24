-- =====================================================
-- FIX: Consolidar e limpar TODAS as políticas RLS
--      de pedidos, itens_pedido e usuarios
-- Motivo: políticas do schema inicial usavam EXISTS inline
--         (recursivo). O join usuario:usuarios() no admin
--         reavalua o RLS de usuarios para cada linha,
--         causando lentidão / timeout.
-- Idempotente: usa DROP IF EXISTS antes de cada CREATE
-- =====================================================

-- =====================================================
-- TABELA: pedidos — recriar todas as políticas SELECT/UPDATE
-- =====================================================

DROP POLICY IF EXISTS "Usuários podem ver seus próprios pedidos"  ON public.pedidos;
DROP POLICY IF EXISTS "Usuários podem criar pedidos"              ON public.pedidos;
DROP POLICY IF EXISTS "Admins podem ver todos os pedidos"         ON public.pedidos;
DROP POLICY IF EXISTS "Admins podem atualizar pedidos"            ON public.pedidos;
DROP POLICY IF EXISTS "Staff pode ver todos os pedidos"           ON public.pedidos;
DROP POLICY IF EXISTS "Staff pode atualizar pedidos"              ON public.pedidos;

-- Cliente vê apenas os próprios pedidos
CREATE POLICY "cliente_select_pedidos"
  ON public.pedidos FOR SELECT
  USING (auth.uid() = usuario_id OR public.is_staff());

-- Cliente pode criar pedidos próprios
CREATE POLICY "cliente_insert_pedidos"
  ON public.pedidos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Admin e staff podem atualizar qualquer pedido
CREATE POLICY "staff_update_pedidos"
  ON public.pedidos FOR UPDATE
  USING (public.is_staff());

-- =====================================================
-- TABELA: itens_pedido — recriar todas as políticas
-- =====================================================

DROP POLICY IF EXISTS "Usuários podem ver itens de seus pedidos"  ON public.itens_pedido;
DROP POLICY IF EXISTS "Usuários podem criar itens de pedido"      ON public.itens_pedido;
DROP POLICY IF EXISTS "Admins podem ver todos os itens"           ON public.itens_pedido;
DROP POLICY IF EXISTS "Admin pode gerenciar itens de pedido"      ON public.itens_pedido;
DROP POLICY IF EXISTS "Staff pode ver todos os itens de pedidos"  ON public.itens_pedido;

-- Cliente vê itens dos próprios pedidos; staff vê tudo
CREATE POLICY "cliente_select_itens_pedido"
  ON public.itens_pedido FOR SELECT
  USING (
    public.is_staff()
    OR EXISTS (
      SELECT 1 FROM public.pedidos
      WHERE id = itens_pedido.pedido_id
        AND usuario_id = auth.uid()
    )
  );

-- Cliente pode inserir itens em pedidos próprios
CREATE POLICY "cliente_insert_itens_pedido"
  ON public.itens_pedido FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pedidos
      WHERE id = itens_pedido.pedido_id
        AND usuario_id = auth.uid()
    )
  );

-- Admin pode alterar/excluir itens
CREATE POLICY "admin_manage_itens_pedido"
  ON public.itens_pedido FOR ALL
  USING (public.is_admin());

-- =====================================================
-- TABELA: usuarios — recriar políticas SELECT para
--         garantir que o JOIN admin funcione sem lentidão
-- =====================================================

DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados"   ON public.usuarios;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários"       ON public.usuarios;
DROP POLICY IF EXISTS "Staff pode ver clientes"                  ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir INSERT via trigger de signup"    ON public.usuarios;
DROP POLICY IF EXISTS "Admin pode atualizar qualquer usuário"    ON public.usuarios;

-- Qualquer usuário autenticado vê o próprio perfil;
-- staff/admin veem todos (único policy, avaliação mais rápida)
CREATE POLICY "select_usuarios"
  ON public.usuarios FOR SELECT
  USING (auth.uid() = id OR public.is_staff());

-- Usuário atualiza apenas os próprios dados
CREATE POLICY "update_proprio_usuario"
  ON public.usuarios FOR UPDATE
  USING (auth.uid() = id);

-- Admin pode atualizar qualquer usuário (ex: promover role)
CREATE POLICY "admin_update_qualquer_usuario"
  ON public.usuarios FOR UPDATE
  USING (public.is_admin());

-- INSERT liberado (trigger de signup)
CREATE POLICY "insert_usuario_signup"
  ON public.usuarios FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- VERIFICAÇÃO — retorna as políticas ativas
-- =====================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('pedidos', 'itens_pedido', 'usuarios')
ORDER BY tablename, cmd, policyname;
