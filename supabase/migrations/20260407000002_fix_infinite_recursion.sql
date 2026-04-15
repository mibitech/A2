-- =====================================================
-- FIX: Recursão infinita nas políticas de usuarios
-- Data: 2026-04-07
-- Descrição: Remove políticas recursivas e cria versões seguras
-- =====================================================

-- PASSO 1: Remover políticas problemáticas
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar fornecedores" ON public.fornecedores;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar produtos" ON public.produtos;
DROP POLICY IF EXISTS "Admins podem ver todos os pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins podem atualizar pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins podem ver todos os itens" ON public.itens_pedido;

-- PASSO 2: Criar função auxiliar para verificar se usuário é admin
-- Esta função usa SECURITY DEFINER para evitar recursão
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.usuarios
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- PASSO 3: Recriar políticas usando a função auxiliar
-- Agora não haverá recursão porque a função tem SECURITY DEFINER

-- Política para usuarios
CREATE POLICY "Admins podem ver todos os usuários"
    ON public.usuarios FOR SELECT
    USING (public.is_admin());

-- Políticas para fornecedores
CREATE POLICY "Admins podem gerenciar fornecedores"
    ON public.fornecedores FOR ALL
    USING (public.is_admin());

-- Políticas para produtos  
CREATE POLICY "Admins podem gerenciar produtos"
    ON public.produtos FOR ALL
    USING (public.is_admin());

-- Políticas para pedidos
CREATE POLICY "Admins podem ver todos os pedidos"
    ON public.pedidos FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins podem atualizar pedidos"
    ON public.pedidos FOR UPDATE
    USING (public.is_admin());

-- Políticas para itens_pedido
CREATE POLICY "Admins podem ver todos os itens"
    ON public.itens_pedido FOR SELECT
    USING (public.is_admin());

-- =====================================================
-- COMENTÁRIO TÉCNICO
-- =====================================================
-- O problema da recursão infinita ocorre quando uma política RLS
-- precisa consultar a mesma tabela que está protegendo.
--
-- Exemplo problemático:
--   CREATE POLICY ... ON usuarios
--   USING (EXISTS (SELECT 1 FROM usuarios WHERE ...))
--
-- Quando você faz SELECT em usuarios, a política verifica fazendo
-- outro SELECT em usuarios, que dispara a política novamente...
--
-- Solução: Usar uma função com SECURITY DEFINER.
-- Com SECURITY DEFINER, a função executa com os privilégios do
-- owner (postgres) e não aplica RLS recursivamente.
--
-- A flag STABLE indica que a função não modifica dados e pode
-- ser otimizada pelo PostgreSQL.
-- =====================================================
