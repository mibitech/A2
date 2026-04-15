-- =====================================================
-- ÉPICO 8 — Gestão de Estoque (US-18)
-- Data: 2026-04-15
-- Idempotente: pode ser reaplicada sem erros
-- =====================================================

-- =====================================================
-- TABELA: movimentacoes_estoque
-- =====================================================

CREATE TABLE IF NOT EXISTS public.movimentacoes_estoque (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste')),
    quantidade INTEGER NOT NULL,
    estoque_anterior INTEGER NOT NULL,
    estoque_posterior INTEGER NOT NULL,
    motivo VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto ON public.movimentacoes_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_created ON public.movimentacoes_estoque(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON public.movimentacoes_estoque(tipo);

ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff pode ver movimentações de estoque" ON public.movimentacoes_estoque;
CREATE POLICY "Staff pode ver movimentações de estoque"
    ON public.movimentacoes_estoque FOR SELECT
    USING (public.is_staff());

DROP POLICY IF EXISTS "Staff pode registrar movimentações" ON public.movimentacoes_estoque;
CREATE POLICY "Staff pode registrar movimentações"
    ON public.movimentacoes_estoque FOR INSERT
    WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admin pode gerenciar todas as movimentações" ON public.movimentacoes_estoque;
CREATE POLICY "Admin pode gerenciar todas as movimentações"
    ON public.movimentacoes_estoque FOR ALL
    USING (public.is_admin());

-- =====================================================
-- STORAGE: bucket para imagens de produtos
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'produtos',
    'produtos',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Imagens de produtos são públicas" ON storage.objects;
CREATE POLICY "Imagens de produtos são públicas"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'produtos');

DROP POLICY IF EXISTS "Staff pode fazer upload de imagens" ON storage.objects;
CREATE POLICY "Staff pode fazer upload de imagens"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'produtos' AND public.is_staff());

DROP POLICY IF EXISTS "Staff pode atualizar imagens" ON storage.objects;
CREATE POLICY "Staff pode atualizar imagens"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'produtos' AND public.is_staff());

DROP POLICY IF EXISTS "Admin pode deletar imagens" ON storage.objects;
CREATE POLICY "Admin pode deletar imagens"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'produtos' AND public.is_admin());
