-- =====================================================
-- MIGRATION: Políticas RLS para role funcionario
-- Data: 2026-04-15
-- Descrição: Adiciona função is_staff() e políticas de acesso
--            para o role funcionario no painel admin
-- =====================================================

-- Função auxiliar: verifica se usuário é admin OU funcionario
-- Usa SECURITY DEFINER para evitar recursão infinita no RLS
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.usuarios
        WHERE id = auth.uid()
        AND role IN ('admin', 'funcionario')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- POLÍTICAS: pedidos
-- =====================================================

-- Funcionário pode ver todos os pedidos (leitura)
CREATE POLICY "Staff pode ver todos os pedidos"
    ON public.pedidos FOR SELECT
    USING (public.is_staff());

-- Funcionário pode atualizar pedidos (ex: marcar como enviado)
CREATE POLICY "Staff pode atualizar pedidos"
    ON public.pedidos FOR UPDATE
    USING (public.is_staff());

-- =====================================================
-- POLÍTICAS: itens_pedido
-- =====================================================

CREATE POLICY "Staff pode ver todos os itens de pedidos"
    ON public.itens_pedido FOR SELECT
    USING (public.is_staff());

-- =====================================================
-- POLÍTICAS: produtos
-- =====================================================

-- Funcionário pode ver todos os produtos, incluindo inativos (para painel admin)
CREATE POLICY "Staff pode ver todos os produtos"
    ON public.produtos FOR SELECT
    USING (public.is_staff());

-- =====================================================
-- POLÍTICAS: usuarios
-- =====================================================

-- Funcionário pode ver lista de clientes
CREATE POLICY "Staff pode ver clientes"
    ON public.usuarios FOR SELECT
    USING (public.is_staff());

-- =====================================================
-- COMENTÁRIO TÉCNICO
-- =====================================================
-- is_staff() usa SECURITY DEFINER (assim como is_admin()) para evitar
-- recursão infinita: quando RLS consulta a tabela usuarios para
-- verificar o role, sem SECURITY DEFINER isso dispararia as próprias
-- políticas da tabela, causando loop infinito.
--
-- Roles do sistema:
--   admin       → acesso total (CRUD de tudo)
--   funcionario → acesso de leitura + atualização de pedidos/estoque
--   cliente     → acesso apenas aos próprios dados e pedidos
-- =====================================================
