-- =====================================================
-- MIGRATION INICIAL - A2Tech
-- Data: 2026-04-07
-- Descrição: Criação das tabelas principais e RLS
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- SEÇÃO 1: CRIAÇÃO DAS TABELAS
-- =====================================================

-- TABELA: fornecedores
CREATE TABLE IF NOT EXISTS public.fornecedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    url_site VARCHAR(500),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_fornecedores_slug ON public.fornecedores(slug);
CREATE INDEX idx_fornecedores_ativo ON public.fornecedores(ativo);

-- TABELA: usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    nome_completo VARCHAR(255),
    telefone VARCHAR(20),
    cpf_cnpj VARCHAR(18),
    tipo_pessoa VARCHAR(10) DEFAULT 'fisica' CHECK (tipo_pessoa IN ('fisica', 'juridica')),
    role VARCHAR(20) DEFAULT 'cliente' CHECK (role IN ('cliente', 'funcionario', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_usuarios_email ON public.usuarios(email);
CREATE INDEX idx_usuarios_role ON public.usuarios(role);

-- TABELA: enderecos
CREATE TABLE IF NOT EXISTS public.enderecos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    padrao BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_enderecos_usuario_id ON public.enderecos(usuario_id);
CREATE INDEX idx_enderecos_padrao ON public.enderecos(usuario_id, padrao);

-- TABELA: produtos
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
    preco_promocional DECIMAL(10, 2) CHECK (preco_promocional >= 0),
    estoque INTEGER DEFAULT 0 CHECK (estoque >= 0),
    imagens TEXT[] DEFAULT '{}',
    categoria VARCHAR(100) NOT NULL,
    subcategoria VARCHAR(100),
    sku VARCHAR(100),
    peso DECIMAL(10, 2),
    dimensoes JSONB,
    caracteristicas JSONB,
    ativo BOOLEAN DEFAULT true,
    destaque BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fornecedor_id, slug)
);

-- Índices
CREATE INDEX idx_produtos_fornecedor ON public.produtos(fornecedor_id);
CREATE INDEX idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX idx_produtos_slug ON public.produtos(slug);
CREATE INDEX idx_produtos_ativo ON public.produtos(ativo);
CREATE INDEX idx_produtos_destaque ON public.produtos(destaque);
CREATE INDEX idx_produtos_preco ON public.produtos(preco);

-- TABELA: pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (
        status IN ('pendente', 'pago', 'processando', 'enviado', 'entregue', 'cancelado')
    ),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    frete DECIMAL(10, 2) DEFAULT 0 CHECK (frete >= 0),
    desconto DECIMAL(10, 2) DEFAULT 0 CHECK (desconto >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    endereco_entrega JSONB NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    stripe_session_id VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pedidos_usuario ON public.pedidos(usuario_id);
CREATE INDEX idx_pedidos_status ON public.pedidos(status);
CREATE INDEX idx_pedidos_created ON public.pedidos(created_at DESC);
CREATE INDEX idx_pedidos_stripe_session ON public.pedidos(stripe_session_id);

-- TABELA: itens_pedido
CREATE TABLE IF NOT EXISTS public.itens_pedido (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(10, 2) NOT NULL CHECK (preco_unitario >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_itens_pedido_pedido ON public.itens_pedido(pedido_id);
CREATE INDEX idx_itens_pedido_produto ON public.itens_pedido(produto_id);

-- =====================================================
-- SEÇÃO 2: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;

-- Políticas: fornecedores
CREATE POLICY "Fornecedores ativos são visíveis para todos"
    ON public.fornecedores FOR SELECT
    USING (ativo = true);

CREATE POLICY "Apenas admins podem gerenciar fornecedores"
    ON public.fornecedores FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas: usuarios
CREATE POLICY "Usuários podem ver seus próprios dados"
    ON public.usuarios FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados"
    ON public.usuarios FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Permitir INSERT via trigger de signup"
    ON public.usuarios FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins podem ver todos os usuários"
    ON public.usuarios FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas: enderecos
CREATE POLICY "Usuários podem gerenciar seus próprios endereços"
    ON public.enderecos FOR ALL
    USING (auth.uid() = usuario_id);

-- Políticas: produtos
CREATE POLICY "Produtos ativos são visíveis para todos"
    ON public.produtos FOR SELECT
    USING (ativo = true);

CREATE POLICY "Apenas admins podem gerenciar produtos"
    ON public.produtos FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas: pedidos
CREATE POLICY "Usuários podem ver seus próprios pedidos"
    ON public.pedidos FOR SELECT
    USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar pedidos"
    ON public.pedidos FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Admins podem ver todos os pedidos"
    ON public.pedidos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins podem atualizar pedidos"
    ON public.pedidos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas: itens_pedido
CREATE POLICY "Usuários podem ver itens de seus pedidos"
    ON public.itens_pedido FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.pedidos
            WHERE id = pedido_id AND usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar itens de pedido"
    ON public.itens_pedido FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pedidos
            WHERE id = pedido_id AND usuario_id = auth.uid()
        )
    );

CREATE POLICY "Admins podem ver todos os itens"
    ON public.itens_pedido FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON public.fornecedores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enderecos_updated_at BEFORE UPDATE ON public.enderecos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON public.produtos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON public.pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar usuário automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir fornecedor FitaCabo
INSERT INTO public.fornecedores (id, nome, slug, url_site, ativo)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'FitaCabo',
    'fitacabo',
    'https://www.fitacabo.com.br',
    true
) ON CONFLICT (slug) DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE public.fornecedores IS 'Fornecedores de produtos (FitaCabo, Wireset, etc)';
COMMENT ON TABLE public.usuarios IS 'Usuários do sistema (clientes, funcionários, admins)';
COMMENT ON TABLE public.enderecos IS 'Endereços de entrega dos usuários';
COMMENT ON TABLE public.produtos IS 'Catálogo de produtos multi-fornecedor';
COMMENT ON TABLE public.pedidos IS 'Pedidos realizados pelos clientes';
COMMENT ON TABLE public.itens_pedido IS 'Itens de cada pedido';
