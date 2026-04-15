-- =====================================================
-- SEED: Produtos FitaCabo - Dados Exemplo
-- Data: 2026-04-08
-- Descrição: Inserir produtos de exemplo do fornecedor FitaCabo
-- =====================================================

-- Inserir produtos de exemplo
INSERT INTO public.produtos (
  fornecedor_id,
  nome,
  slug,
  descricao,
  preco,
  preco_promocional,
  estoque,
  imagens,
  categoria,
  subcategoria,
  sku,
  ativo,
  destaque
) VALUES
  -- Produto 1
  (
    '00000000-0000-0000-0000-000000000001',
    'Fita Isolante 3M Temflex 19mm x 20m - Preta',
    'fita-isolante-3m-temflex-19mm-preta',
    'Fita isolante de PVC de alta qualidade 3M Temflex. Ideal para isolamento elétrico residencial e comercial. Resistente a umidade e variações de temperatura.',
    12.90,
    9.90,
    150,
    ARRAY['https://via.placeholder.com/500x500/1a1a1a/ffffff?text=Fita+Isolante'],
    'Fitas',
    'Fitas Isolantes',
    'FIT-3M-001',
    true,
    true
  ),
  
  -- Produto 2
  (
    '00000000-0000-0000-0000-000000000001',
    'Cabo Flexível 2,5mm² 100m - Vermelho',
    'cabo-flexivel-2-5mm-100m-vermelho',
    'Cabo flexível de cobre com isolamento em PVC antichama. Ideal para instalações elétricas prediais. Bitola 2,5mm², rolo com 100 metros.',
    189.90,
    NULL,
    45,
    ARRAY['https://via.placeholder.com/500x500/ff0000/ffffff?text=Cabo+Vermelho'],
    'Cabos',
    'Cabos Flexíveis',
    'CAB-FLEX-001',
    true,
    true
  ),
  
  -- Produto 3
  (
    '00000000-0000-0000-0000-000000000001',
    'Abraçadeira Nylon 200mm x 3,6mm - Pacote 100un',
    'abracadeira-nylon-200mm-pacote-100un',
    'Abraçadeiras de nylon cor preta para fixação de cabos. Resistente a UV e altas temperaturas. Comprimento 200mm, largura 3,6mm. Pacote com 100 unidades.',
    24.90,
    19.90,
    200,
    ARRAY['https://via.placeholder.com/500x500/000000/ffffff?text=Abraçadeira'],
    'Acessórios',
    'Abraçadeiras',
    'ABR-NY-001',
    true,
    false
  ),
  
  -- Produto 4
  (
    '00000000-0000-0000-0000-000000000001',
    'Eletroduto Flexível Corrugado 25mm - Rolo 50m',
    'eletroduto-flexivel-corrugado-25mm-rolo-50m',
    'Eletroduto flexível corrugado em polietileno de alta densidade. Ideal para proteção de cabos elétricos. Diâmetro 25mm (3/4"), rolo com 50 metros.',
    145.00,
    129.90,
    30,
    ARRAY['https://via.placeholder.com/500x500/ffa500/ffffff?text=Eletroduto'],
    'Eletrodutos',
    'Eletrodutos Flexíveis',
    'ELE-FLEX-001',
    true,
    false
  ),
  
  -- Produto 5
  (
    '00000000-0000-0000-0000-000000000001',
    'Tomada Padrão Novo 2P+T 10A - Branca',
    'tomada-padrao-novo-2p-t-10a-branca',
    'Tomada padrão brasileiro NBR 14136 (padrão novo). 2 polos + terra, corrente nominal 10A. Cor branca. Ideal para instalações residenciais e comerciais.',
    8.90,
    NULL,
    300,
    ARRAY['https://via.placeholder.com/500x500/ffffff/000000?text=Tomada'],
    'Instalação',
    'Tomadas',
    'TOM-PAD-001',
    true,
    false
  ),
  
  -- Produto 6
  (
    '00000000-0000-0000-0000-000000000001',
    'Disjuntor Termomagnético Bipolar 32A',
    'disjuntor-termomagnetico-bipolar-32a',
    'Disjuntor termomagnético de alta performance. Bipolar, corrente nominal 32A, curva C. Ideal para proteção de circuitos elétricos. Conforme NBR NM 60898.',
    45.90,
    39.90,
    80,
    ARRAY['https://via.placeholder.com/500x500/0066cc/ffffff?text=Disjuntor'],
    'Proteção',
    'Disjuntores',
    'DIS-BIP-001',
    true,
    true
  ),
  
  -- Produto 7
  (
    '00000000-0000-0000-0000-000000000001',
    'Condulete de Alumínio X - 1/2" - Com Tampa',
    'condulete-aluminio-x-1-2-com-tampa',
    'Condulete de alumínio fundido tipo X para passagem de eletrodutos. Rosca BSP 1/2". Acompanha tampa e vedação. Resistente à corrosão.',
    15.90,
    NULL,
    120,
    ARRAY['https://via.placeholder.com/500x500/c0c0c0/000000?text=Condulete'],
    'Acessórios',
    'Conduletes',
    'CON-ALU-001',
    true,
    false
  ),
  
  -- Produto 8
  (
    '00000000-0000-0000-0000-000000000001',
    'Interruptor Simples 10A - Branco',
    'interruptor-simples-10a-branco',
    'Interruptor de comando simples, corrente nominal 10A. Cor branca. Para instalação embutida ou aparente. Fabricado conforme NBR 6527.',
    6.90,
    NULL,
    250,
    ARRAY['https://via.placeholder.com/500x500/ffffff/000000?text=Interruptor'],
    'Instalação',
    'Interruptores',
    'INT-SIM-001',
    true,
    false
  )

ON CONFLICT (fornecedor_id, slug) DO NOTHING;

-- Comentário
COMMENT ON TABLE public.produtos IS 'Produtos disponíveis no catálogo, organizados por fornecedor';

-- Verificar seed
-- SELECT COUNT(*) FROM public.produtos WHERE fornecedor_id = '00000000-0000-0000-0000-000000000001';
