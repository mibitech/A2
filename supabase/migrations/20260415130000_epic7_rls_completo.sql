-- =====================================================
-- ÉPICO 7 — Controle de Acesso Admin (US-17)
-- Data: 2026-04-15
-- Descrição: Consolida e completa todas as políticas RLS
--            por role: admin, funcionario, cliente
-- Idempotente: pode ser reaplicada sem erros
-- =====================================================

-- enderecos: staff vê todos para processar pedidos
DROP POLICY IF EXISTS "Staff pode ver todos os endereços" ON public.enderecos;
CREATE POLICY "Staff pode ver todos os endereços"
    ON public.enderecos FOR SELECT
    USING (public.is_staff());

-- usuarios: admin pode atualizar qualquer usuário (ex: promover roles)
DROP POLICY IF EXISTS "Admin pode atualizar qualquer usuário" ON public.usuarios;
CREATE POLICY "Admin pode atualizar qualquer usuário"
    ON public.usuarios FOR UPDATE
    USING (public.is_admin());

-- fornecedores: staff vê todos incluindo inativos
DROP POLICY IF EXISTS "Staff pode ver todos os fornecedores" ON public.fornecedores;
CREATE POLICY "Staff pode ver todos os fornecedores"
    ON public.fornecedores FOR SELECT
    USING (public.is_staff());

-- itens_pedido: admin gerencia tudo
DROP POLICY IF EXISTS "Admin pode gerenciar itens de pedido" ON public.itens_pedido;
CREATE POLICY "Admin pode gerenciar itens de pedido"
    ON public.itens_pedido FOR ALL
    USING (public.is_admin());
