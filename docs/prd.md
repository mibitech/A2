# PRD Detalhado — Projeto A2Tech
> Versão 1.1 — Atualizado com catálogo de produtos e estratégia de raspagem
> Data de atualização: 2026-04-07

---

## 1. Visão Geral do Produto

### 1.1 Problema de Negócio
O cliente é dono da **Wireset** (www.wireset.com.br), empresa do segmento de equipamentos de elevação e amarração de cargas. Impedimentos societários impedem alterações imediatas na estrutura da Wireset. Para contornar esse bloqueio e iniciar operações de e-commerce sem atrasos, a solução é criar uma **nova empresa independente: A2Tech**.

A A2Tech atuará inicialmente como **revendedora de um subconjunto selecionado de produtos da FitaCabo** (www.fitacabo.com.br), enquanto a arquitetura já é desenhada para absorver **todo o catálogo da Wireset** sem refatoração futura.

### 1.2 Solução Proposta
Desenvolver um **site institucional + e-commerce completo** com CRM/ERP simplificado integrado, preparado para operação multi-fornecedor, com automações via n8n e assistente de IA no painel administrativo.

### 1.3 Stakeholders
| Papel | Descrição |
|-------|-----------|
| Cliente / Dono | Proprietário da Wireset e A2Tech |
| Administrador | Gestor do painel admin, estoque, CRM e financeiro |
| Funcionário | Operador com acesso limitado ao painel |
| Cliente Final | Comprador do e-commerce |
| Fornecedor FitaCabo | Fornecedor inicial — 4 produtos selecionados |
| Fornecedor Wireset | Fornecedor futuro — catálogo completo em migração planejada |

---

## 2. Objetivos e Métricas de Sucesso (OKRs)

| Objetivo | Resultado-Chave | Prazo |
|----------|----------------|-------|
| Lançar e-commerce funcional | Fase 1 concluída e em produção | 3 meses |
| Atingir primeiras vendas | 10 pedidos/mês | Mês 2 |
| Automatizar operações | 80% dos alertas via n8n | Fase 2 (6 meses) |
| Preparar integração Wireset | Migração zero-downtime executada | Fase 3 (18 meses) |

---

## 3. Catálogo de Produtos — FASE 1 (Lançamento)

> **Escopo imediato**: apenas os 4 produtos abaixo da FitaCabo serão comercializados no lançamento.
> O sistema deve ser preparado desde o início para suportar novos produtos sem refatoração.

### 3.1 Produtos Ativos no Lançamento — FitaCabo

---

#### PRODUTO 1 — Etiqueta Azul
| Campo | Valor |
|-------|-------|
| **Nome** | Etiqueta Azul |
| **Fornecedor** | FitaCabo |
| **fornecedor_id** | `fitacabo` |
| **Categoria** | Identificação e Rastreabilidade |
| **URL Fonte** | https://www.fitacabo.com.br |
| **Status no sistema** | `ativo = true` |
| **feature_flag** | nenhuma (disponível no lançamento) |

**Descrição para cadastro:**
Etiqueta de identificação obrigatória para cintas de amarração e elevação. Contém dados de identificação do produto, capacidade máxima de carga e informações de precaução. Permite rastreabilidade do equipamento ao longo de toda a sua vida útil, conforme exigências das normas técnicas brasileiras (NBR 15637). Essencial para conformidade legal no transporte e elevação de cargas.

**Observações técnicas:**
- Obrigatória em todas as cintas de carga
- Contém: código do produto, capacidade de trabalho (WLL), data de fabricação, lote, e instruções de uso
- Sem a etiqueta, a cinta não está em conformidade com as normas vigentes

---

#### PRODUTO 2 — Sling Colorida (Eslinga Redonda Tubular)
| Campo | Valor |
|-------|-------|
| **Nome** | Sling Colorida — Eslinga Redonda Tubular |
| **Fornecedor** | FitaCabo |
| **fornecedor_id** | `fitacabo` |
| **Categoria** | Cintas de Elevação de Cargas |
| **Subcategoria** | SLING / Eslinga Redonda Tubular 7:1 NBR 15637-2 |
| **URL Fonte** | https://www.fitacabo.com.br/produtos/cintas-de-elevacao-de-cargas/eslinga-redonda-tubular-7-1-nbr-15637-2 |
| **Status no sistema** | `ativo = true` |
| **Norma** | NBR 15637-2 |
| **Fator de Segurança** | 7:1 |
| **feature_flag** | nenhuma (disponível no lançamento) |

**Descrição para cadastro:**
A Sling Colorida (Eslinga Redonda Tubular) é fabricada conforme a norma NBR 15637-2 com fator de segurança 7:1. Construída em poliéster de alta tenacidade em formato tubular, permite fácil ajuste durante a operação e oferece alta performance — podendo chegar a até 100 toneladas de carga de trabalho. A codificação por cores facilita a identificação rápida da capacidade de carga no campo.

**Variações de produto (subcategorias a cadastrar):**
- Sling 5:1 Branca
- SLING 7:1 NBR 15637-1
- Eslinga Redonda Tubular 7:1 NBR 15637-2 (diversas capacidades)

**Especificações técnicas:**
- Material: Poliéster de alta tenacidade
- Formato: Tubular (loop fechado)
- Fator de segurança: 7:1 (NBR 15637-2)
- Capacidade de trabalho: de 1 tonelada até 100 toneladas (por variação)
- Identificação: codificação por cores conforme padrão internacional

**Aplicações:**
- Elevação em guindastes, pontes-rolantes e empilhadeiras
- Movimentação de cargas sensíveis que não podem ter contato com metal
- Indústria metal-mecânica, construção civil, logística portuária

---

#### PRODUTO 3 — Amarração de Cargas
| Campo | Valor |
|-------|-------|
| **Nome** | Amarração de Cargas — Cintas e Catracas |
| **Fornecedor** | FitaCabo |
| **fornecedor_id** | `fitacabo` |
| **Categoria** | Cintas e Catracas para Amarração de Cargas |
| **URL Fonte** | https://www.fitacabo.com.br/produtos/cintas-e-catracas-para-amarracao-de-cargas |
| **Status no sistema** | `ativo = true` |
| **Norma** | ABNT NBR 15883 |
| **feature_flag** | nenhuma (disponível no lançamento) |

**Descrição para cadastro:**
Linha completa de cintas e catracas para amarração de cargas durante o transporte. Garante a fixação e estabilidade da carga em caminhões, carretas e plataformas, prevenindo deslocamentos, tombamentos e danos. Fabricada conforme norma ABNT NBR 15883. Indicada para transporte rodoviário de cargas pesadas e volumosas.

**Subcategorias a cadastrar (produtos individuais):**
| Subcategoria | Descrição |
|-------------|-----------|
| Catracas Fixas | Dispositivo fixo de tensionamento de cinta |
| Catracas Móveis | Dispositivo móvel de tensionamento de cinta |
| Conjunto de Amarração 25mm – 800Kg | Kit completo para cargas leves |
| Conjunto de Amarração 35mm – 1.000Kg | Kit completo para cargas médias |
| Conjunto de Amarração 50mm | Kit para cargas médias-pesadas |
| Conjunto de Amarração 100mm – 10.000Kg | Kit para cargas pesadas até 10 toneladas |
| Conjunto de Arraste | Para amarração com sistema de arraste |
| Conjunto Tombador Caminhão Graneleiro | Específico para caminhões graneleiros |
| Conjunto Amarração Cilindro 3.000–5.000Kg | Para fixação de cilindros/tubos |
| Kit Cegonha | Para amarração de veículos em caminhão cegonha |
| Kit Guincheiro | Para amarração em caminhão guincho |
| Kit Moto com Catraca | Kit específico para motos |
| Presilhas | Acessórios de fixação (modelos PRZ-25mm Mini e outros) |
| Terminais | Terminais e conexões de cinta |
| Fivela Esticadora c/ Rabicho e Gancho Garra | Para amarração de lonas |
| Rabicho da Lona Fivela Furada | Acessório para lonas de caminhão |

**Especificações técnicas gerais:**
- Largura de cinta: 25mm, 35mm, 50mm, 100mm
- Capacidade: de 800Kg a 10.000Kg por variação
- Material: Poliéster 100%
- Norma: ABNT NBR 15883
- Componentes: catraca (fixa ou móvel) + cinta + terminal/gancho

---

#### PRODUTO 4 — Carga Cesa (Conjunto de Amarração Cesa)
| Campo | Valor |
|-------|-------|
| **Nome** | Carga Cesa — Amarração de Cargas |
| **Fornecedor** | FitaCabo |
| **fornecedor_id** | `fitacabo` |
| **Categoria** | Cintas e Catracas para Amarração de Cargas |
| **Subcategoria** | Conjunto para Amarração de Cargas (linha Cesa) |
| **URL Fonte** | https://www.fitacabo.com.br/pdf/catalogo-2024.pdf |
| **Status no sistema** | `ativo = true` |
| **Norma** | ABNT NBR 15883 |
| **feature_flag** | nenhuma (disponível no lançamento) |

**Descrição para cadastro:**
O Conjunto de Amarração Cesa é projetado para garantir a segurança durante o transporte de cargas em caminhões. Utiliza cintas de 100mm de largura com catraca fixa para tensionamento. O gancho tipo "C" ou "Gancho Bobina Especial" é o componente responsável pela conexão em X da cinta com a catraca, proporcionando maior segurança e melhor fixação ao longo de todo o trajeto. Indicado para transporte de fio-máquina (bobinas), aço e cargas industriais pesadas.

**Especificações técnicas:**
- Cinta: 100mm de largura, 10 toneladas de capacidade
- Sistema: conexão em cruz (X) com gancho C/Gancho Bobina Especial
- Indicado para: fio-máquina, bobinas de aço, cargas industriais
- Norma: ABNT NBR 15883

---

### 3.2 Estratégia de Catálogo — Produto com feature_flag

Todos os produtos são armazenados na tabela `produtos` com campo `fornecedor_id` e `ativo`.
Os 4 produtos acima têm `ativo = true` no seed inicial.
Produtos Wireset terão `ativo = false` até habilitação via feature flag `WIRESET_ENABLED=true`.

```sql
-- Estrutura da tabela produtos (campos relevantes ao catálogo)
CREATE TABLE produtos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id   text NOT NULL REFERENCES fornecedores(id),
  nome            text NOT NULL,
  slug            text UNIQUE NOT NULL,
  descricao       text,
  descricao_tecnica text,
  norma           text,           -- Ex: NBR 15637-2, NBR 15883
  fator_seguranca text,           -- Ex: 7:1, 4:1
  capacidade_min  numeric,        -- em kg
  capacidade_max  numeric,        -- em kg
  material        text,
  aplicacoes      text[],
  categoria       text NOT NULL,
  subcategoria    text,
  imagens         text[],         -- URLs no Supabase Storage
  preco           numeric,
  estoque         integer DEFAULT 0,
  ativo           boolean DEFAULT false,
  criado_em       timestamptz DEFAULT now(),
  atualizado_em   timestamptz DEFAULT now()
);
```

---

## 4. Catálogo Futuro — Wireset (Fase 3)

> **Estratégia**: raspar e catalogar AGORA no banco com `ativo = false`.
> Ativar via `WIRESET_ENABLED=true` somente na Fase 3.
> Zero impacto nos produtos FitaCabo ativos.

### 4.1 Catálogo Wireset — Mapeado por Raspagem

**Fonte**: www.wireset.com.br/catalogo

| Categoria Wireset | Subcategorias Identificadas | URL de Raspagem |
|-------------------|---------------------------|-----------------|
| **Acessórios** | Acessórios industriais para elevação | https://www.wireset.com.br/catalogo/acessorios |
| **Cabos de Aço** | Lingas de cabo, cabos simples, cabo aço linga | https://www.wireset.com.br/catalogo/cabos-de-aco |
| **Laços** | Laços de aço para elevação | https://www.wireset.com.br/catalogo/lacos |
| **Cintas de Elevação** | Cintas sling, elevação, amarração | https://www.wireset.com.br/catalogo/cintas-de-elevacao |

**Serviços Wireset (sem estoque — sob consulta):**
- Serviços técnicos especializados em elevação e transporte de cargas
- Fonte: https://www.wireset.com.br/servicos

**Contato Wireset (para referência no script de raspagem):**
- Endereço: R. Dias da Silva, 440 — Vila Maria/SP — CEP: 02114-001
- Tel: (11) 2795-3771
- WhatsApp: (11) 94805-1864
- E-mail: wireset@wireset.com.br

### 4.2 Script de Raspagem — Wireset

```typescript
// scripts/scrape-wireset.ts
// Raspa as 4 categorias do catálogo Wireset e insere no Supabase com ativo=false

const WIRESET_CATEGORIES = [
  { nome: 'Acessórios',        url: 'https://www.wireset.com.br/catalogo/acessorios' },
  { nome: 'Cabos de Aço',      url: 'https://www.wireset.com.br/catalogo/cabos-de-aco' },
  { nome: 'Laços',             url: 'https://www.wireset.com.br/catalogo/lacos' },
  { nome: 'Cintas de Elevação',url: 'https://www.wireset.com.br/catalogo/cintas-de-elevacao' },
];

const FORNECEDOR_ID = 'wireset';

// Para cada categoria:
// 1. Fazer GET na URL
// 2. Extrair lista de produtos (nome, descrição, imagens, URL do produto)
// 3. Para cada produto, acessar URL individual e extrair especificações técnicas
// 4. Inserir no Supabase com:
//    - fornecedor_id: 'wireset'
//    - ativo: false         ← NUNCA exibir no e-commerce até WIRESET_ENABLED=true
//    - categoria + subcategoria mapeadas
```

### 4.3 Script de Raspagem — FitaCabo (Produtos Ativos)

```typescript
// scripts/scrape-fitacabo.ts
// Raspa os 4 produtos ativos da FitaCabo e faz seed no Supabase

const FITACABO_PRODUTOS_ATIVOS = [
  {
    nome: 'Etiqueta Azul',
    categoria: 'Identificação e Rastreabilidade',
    url: 'https://www.fitacabo.com.br',
    ativo: true,
  },
  {
    nome: 'Sling Colorida — Eslinga Redonda Tubular',
    categoria: 'Cintas de Elevação de Cargas',
    subcategoria: 'Eslinga Redonda Tubular 7:1 NBR 15637-2',
    url: 'https://www.fitacabo.com.br/produtos/cintas-de-elevacao-de-cargas/eslinga-redonda-tubular-7-1-nbr-15637-2',
    ativo: true,
  },
  {
    nome: 'Amarração de Cargas — Cintas e Catracas',
    categoria: 'Cintas e Catracas para Amarração de Cargas',
    url: 'https://www.fitacabo.com.br/produtos/cintas-e-catracas-para-amarracao-de-cargas',
    ativo: true,
    subcategorias: [
      'Catracas Fixas',
      'Catracas Móveis',
      'Conjunto de Amarração 25mm – 800Kg',
      'Conjunto de Amarração 35mm – 1.000Kg',
      'Conjunto de Amarração de Carga 50mm',
      'Conjunto de Amarração de Carga 100mm – 10.000Kg',
      'Conjunto de Arraste',
      'Conjunto de Tombador para Caminhão Graneleiro',
      'Conjunto para Amarração de Cilindro – 3.000Kg a 5.000Kg',
      'Kit Cegonha para Amarração de Veículos',
      'Kit Guincheiro para Amarração de Veículos',
      'Kit Moto com Catraca 1 Peça',
      'Presilhas',
      'Terminais',
      'Fivela Esticadora de Plástico com Rabicho e Gancho Garra',
      'Rabicho da Lona Fivela Furada',
    ],
  },
  {
    nome: 'Carga Cesa — Amarração de Cargas',
    categoria: 'Cintas e Catracas para Amarração de Cargas',
    subcategoria: 'Conjunto para Amarração de Cargas — Linha Cesa',
    url: 'https://www.fitacabo.com.br/produtos/cintas-e-catracas-para-amarracao-de-cargas/conjunto-para-amarracao-de-cargas',
    ativo: true,
  },
];

const FORNECEDOR_ID = 'fitacabo';

// Para cada produto:
// 1. Acessar URL do produto/subcategoria
// 2. Extrair: nome, descrição, especificações técnicas, imagens, norma, capacidade
// 3. Inserir no Supabase com:
//    - fornecedor_id: 'fitacabo'
//    - ativo: true   ← exibir no e-commerce imediatamente
```

---

## 5. Seed Inicial do Banco (fornecedores)

```sql
-- supabase/migrations/20260407_seed_fornecedores.sql
INSERT INTO fornecedores (id, nome, slug, url, ativo) VALUES
  ('fitacabo', 'FitaCabo', 'fitacabo', 'https://www.fitacabo.com.br', true),
  ('wireset',  'Wireset',  'wireset',  'https://www.wireset.com.br',  false);
-- Wireset ativo=false até migração na Fase 3
```

---

## 6. Arquitetura e Stack Técnica

### 6.1 Stack Completa
| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js (LTS) |
| Package Manager | pnpm (use `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm start`) |
| Frontend | React + TypeScript + Vite |
| Backend/BaaS | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Pagamentos | Stripe |
| E-mail Transacional | Brevo (ex-Sendinblue) |
| Automações | n8n self-hosted |
| Estilo | Tailwind CSS |
| Deploy | Node.js + PM2 ou Docker (sem Vercel) |
| Documentação de Libs | Context7 MCP |

### 6.2 MCPs Integrados ao Roo Code
| MCP | Capacidades |
|-----|-------------|
| MCP Supabase | Queries, migrations, storage, RLS |
| MCP Stripe | Produtos, preços, checkout sessions, webhooks |
| MCP Brevo | E-mails transacionais, campanhas, listas |
| MCP Context7 | Documentação atualizada das libs |
| MCP n8n | Criação e ativação de workflows de automação |

### 6.3 Princípios de Arquitetura
- **Multi-fornecedor por design**: `fornecedor_id` em todas as tabelas de produto desde o início
- **Zero secrets no código**: variáveis via `.env` + Supabase Vault
- **Migrations versionadas**: `supabase/migrations/` com timestamps ISO
- **Commits atômicos**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **Rollback por tag Git**: tags `v1.0.0`, `v2.0.0`, `v3.0.0`
- **Feature flags**: `WIRESET_ENABLED` controla exibição dos produtos Wireset

---

## 7. Roadmap em 3 Fases

| Fase | Período | Foco |
|------|---------|------|
| **Fase 1** | 0–3 meses | Landing Page + E-commerce com os 4 produtos FitaCabo |
| **Fase 2** | 3–6 meses | Painel Admin + Estoque + CRM + Financeiro + Automações n8n |
| **Fase 3** | 6–18 meses | IA generativa + Integração Wireset (catálogo completo) + Marketplaces + App Mobile |

---

## 8. Funcionalidades por Fase

### FASE 1 — Landing Page + E-commerce (0–3 meses) → Tag v1.0.0

#### ÉPICO 1 — Infraestrutura & Setup
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-01 | Architect | Inicializar repositório com pnpm, Vite+React+TS, Tailwind, ESLint, Prettier | `pnpm create vite` configurado; scripts dev/build/start/lint funcionando |
| US-02 | Architect | Configurar Supabase (projeto, tabelas, RLS) | Tabelas criadas com `fornecedor_id`; RLS ativo em todas as tabelas |
| US-03 | Code | Configurar variáveis de ambiente | `.env.example` documentado; nenhum secret hardcoded |
| US-04 | Architect | Seed inicial de fornecedores e produtos | FitaCabo ativo, Wireset inativo; 4 produtos FitaCabo com `ativo=true` |

#### ÉPICO 2 — Raspagem e Seed de Produtos
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-05 | Architect | Script `scrape-fitacabo.ts` — raspa os 4 produtos ativos | Dados persistidos no Supabase: nome, descrição, imagens, norma, capacidade, `ativo=true` |
| US-06 | Architect | Script `scrape-wireset.ts` — raspa catálogo completo Wireset | Todos os produtos nas 4 categorias no Supabase com `ativo=false`; não exibidos no e-commerce |

#### ÉPICO 3 — Landing Page
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-07 | Code | Hero section com proposta de valor A2Tech | CTA visível acima da dobra; responsivo mobile-first |
| US-08 | Code | Seção de produtos em destaque (4 produtos FitaCabo) | Cards com imagem, nome, descrição curta e botão "Ver produto" |
| US-09 | Code | Seção institucional + rodapé com contato | Links para redes sociais e botão WhatsApp |

#### ÉPICO 4 — Autenticação
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-10 | Code | Cadastro e login com Supabase Auth (e-mail + senha) | Fluxo: cadastro → confirmação e-mail → login; e-mail de boas-vindas via n8n + Brevo |
| US-11 | Code | Recuperação e alteração de senha | Link de reset expira em 1h; validação de senha |

#### ÉPICO 5 — Catálogo de Produtos
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-12 | Code | Listagem de produtos — exibe apenas `ativo=true` e `fornecedor_id=fitacabo` | Query filtra `ativo=true`; Wireset nunca exibido no Fase 1; paginação 20 itens/página |
| US-13 | Code | Filtros por categoria e subcategoria | Filtros dinâmicos via MCP Supabase |
| US-14 | Code | Página de detalhe do produto | Imagem, descrição, norma, fator segurança, capacidade, preço, estoque, botão "Adicionar ao carrinho" |

#### ÉPICO 6 — Carrinho e Checkout
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-15 | Code | Carrinho de compras (Context API ou Zustand) | Adicionar/remover/alterar quantidade; persistência em localStorage |
| US-16 | Code + MCP Stripe | Checkout com Stripe | Stripe Checkout Session via edge function Supabase; webhook atualiza status do pedido |
| US-17 | Code + MCP Brevo | E-mail de confirmação de pedido | Disparado via n8n após `payment_intent.succeeded` |

#### ÉPICO 7 — Deploy Fase 1
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-18 | Architect | Configurar servidor Node.js para produção | `pnpm build` gera `/dist`; PM2 ou Docker Compose; env via `.env` no servidor |
| US-19 | Debug | Checklist de QA Fase 1 | Fluxo completo testado; Lighthouse ≥ 85 (mobile); nenhum secret exposto no bundle |

---

### FASE 2 — Painel Admin + CRM/ERP (3–6 meses) → Tag v2.0.0

**Pré-requisito**: Tag v1.0.0 em produção e aprovada.

#### ÉPICO 8 — Controle de Acesso Admin
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-20 | Architect | Roles: admin, funcionário, cliente | RLS no Supabase por role; middleware no React Router |

#### ÉPICO 9 — Gestão de Estoque
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-21 | Code + MCP Supabase | CRUD de produtos no painel admin | Upload de imagens Supabase Storage; histórico de movimentações |
| US-22 | Code | Alertas de estoque mínimo | Trigger Supabase → n8n → WhatsApp (Twilio ou Evolution API) |

#### ÉPICO 10 — CRM
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-23 | Code + MCP Supabase | Listagem e perfil de clientes | Histórico de pedidos; tag de segmentação manual |
| US-24 | Code + MCP Brevo | Campanhas de e-mail por segmento | Criação de lista Brevo via MCP; envio agendado |

#### ÉPICO 11 — Financeiro
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-25 | Code | Conciliação financeira | Integração Stripe Dashboard; fluxo de caixa simplificado |
| US-26 | Code | Relatório semanal automático | n8n: toda segunda-feira às 8h envia PDF de vendas por e-mail |

#### ÉPICO 12 — Automações n8n Fase 2
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-27 | Architect + MCP n8n | Workflow abandono de carrinho | Trigger: 2h sem checkout → e-mail Brevo com cupom 5% |
| US-28 | Code + MCP n8n | NPS automático pós-compra | 7 dias após entrega → e-mail com formulário NPS |
| US-29 | Architect + MCP n8n | Raspagem periódica do catálogo | Cron semanal re-executa `scrape-fitacabo.ts` e `scrape-wireset.ts` para manter dados atualizados |

---

### FASE 3 — IA + Wireset + Marketplaces (6–18 meses) → Tag v3.0.0

**Pré-requisito**: Tag v2.0.0 em produção e aprovada.

#### ÉPICO 13 — Assistente IA no Admin
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-30 | Architect | Integrar LLM com MCP Supabase + MCP Brevo | Chat no painel com queries em linguagem natural; ações automatizadas |

#### ÉPICO 14 — Integração Wireset
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-31 | Architect | Ativar feature flag `WIRESET_ENABLED=true` | Produtos Wireset (já no banco desde Fase 1 com `ativo=false`) passam para `ativo=true` |
| US-32 | Code | Exibição dos produtos Wireset no e-commerce | Zero impacto nos produtos FitaCabo; filtro por fornecedor no catálogo |
| US-33 | Code | Página "Sobre a Wireset" e integração de marca | Contexto histórico da Wireset disponível no site |

#### ÉPICO 15 — Marketplaces
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-34 | Code | Integração Mercado Livre (API ML) | Sincronização de estoque bidirecional |
| US-35 | Architect | Webhook de pedidos ML → Supabase | Pedidos do ML registrados automaticamente |

#### ÉPICO 16 — App Mobile
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-36 | Architect | PWA ou React Native (avaliar com cliente) | Notificações push; catálogo offline-first |

#### ÉPICO 17 — Observabilidade
| US | Responsável | Descrição | Critérios de Aceite |
|----|-------------|-----------|---------------------|
| US-37 | Debug | Logging centralizado (Supabase logs + Sentry) | Alertas de erro crítico via n8n → Slack/WhatsApp |

---

## 9. Automações n8n — Detalhamento

| Workflow | Fase | Trigger | Ação | Ferramenta |
|----------|------|---------|------|-----------|
| Boas-vindas | 1 | Novo cadastro (Supabase Auth hook) | E-mail de boas-vindas | Brevo |
| Confirmação de pedido | 1 | Webhook Stripe `payment_intent.succeeded` | E-mail com dados do pedido | Brevo |
| Abandono de carrinho | 2 | 2h sem checkout após adicionar item | E-mail com cupom 5% | Brevo |
| Alerta estoque mínimo | 2 | Trigger Supabase (estoque < mínimo) | WhatsApp para admin | Twilio/Evolution API |
| NPS pós-compra | 2 | 7 dias após status "entregue" | E-mail formulário NPS | Brevo |
| Relatório semanal | 2 | Cron toda segunda-feira às 8h | E-mail PDF de vendas | Brevo + Supabase |
| Raspagem periódica | 2 | Cron semanal | Atualiza catálogo FitaCabo e Wireset | Scripts Node.js |

---

## 10. Modelagem de Dados (Supabase/PostgreSQL)

### Tabelas Principais
| Tabela | Campos-chave | Notas |
|--------|-------------|-------|
| `fornecedores` | id, nome, slug, url, ativo | `fitacabo` ativo, `wireset` inativo até Fase 3 |
| `produtos` | id, fornecedor_id, nome, slug, descricao, descricao_tecnica, norma, fator_seguranca, capacidade_min, capacidade_max, material, aplicacoes, categoria, subcategoria, imagens, preco, estoque, ativo | ativo=false para Wireset |
| `usuarios` | id, email, role, criado_em | Supabase Auth + metadados |
| `pedidos` | id, usuario_id, status, total, stripe_session_id, criado_em | Status: pendente/pago/cancelado/entregue |
| `itens_pedido` | id, pedido_id, produto_id, quantidade, preco_unitario | Snapshot do preço |
| `movimentacoes_estoque` | id, produto_id, tipo, quantidade, motivo, criado_em | Histórico completo |
| `campanhas_crm` | id, nome, segmento, lista_brevo_id, status, agendado_em | Campanhas de e-mail |
| `nps_respostas` | id, pedido_id, usuario_id, nota, comentario, criado_em | NPS pós-compra |

---

## 11. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Mudança de nome da empresa | Alta | Médio | `COMPANY_NAME` em `.env` e i18n |
| Migração Wireset com ruptura | Média | Alto | `fornecedor_id` + feature flag `WIRESET_ENABLED` |
| Site FitaCabo/Wireset altera estrutura HTML | Média | Médio | Scripts de raspagem com seletores CSS resilientes + alertas de falha via n8n |
| Indisponibilidade de MCP externo | Baixa | Médio | Fallback via REST direto no Supabase/APIs |
| Secrets expostos acidentalmente | Baixa | Crítico | Supabase Vault + `.env` nunca commitado + pre-commit hook |
| Webhook Stripe não processado | Baixa | Alto | Idempotência no handler + retry + log de falhas |

---

## 12. Variáveis de Ambiente (.env.example)

```env
# App
COMPANY_NAME=A2Tech
VITE_APP_URL=https://a2tech.com.br

# Supabase
SUPABASE_URL=https://snhbrorfogpsirxrjtwq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuaGJyb3Jmb2dwc2lyeHJqdHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTc2OTcsImV4cCI6MjA5MTE3MzY5N30.gSjXvDBvaqbcztU3iXRLG8oDHd-calLrxOJHPvzFHbk
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Brevo
BREVO_API_KEY=

# n8n
N8N_WEBHOOK_URL=

# Feature Flags
WIRESET_ENABLED=false   # Manter false até Fase 3 aprovada

# WhatsApp (opcional - Fase 2)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
```

---

## 13. Glossário do Setor

| Termo | Definição |
|-------|-----------|
| Cinta Normativa 7:1 | Fator de segurança 7:1 conforme NBR 15637-2 |
| Sling / Eslinga | Cabo ou correia de içamento em guindastes e empilhadeiras |
| Eslinga Redonda Tubular | Cinta em formato de loop tubular para elevação; alta capacidade (até 100t) |
| Catraca | Dispositivo mecânico para tensionamento de cintas de amarração de carga |
| WLL (Working Load Limit) | Carga máxima de trabalho permitida pelo fabricante |
| BAND / LEG / RING / STEEL | Variações de cintas de elevação: extensão, perna, anel e aço |
| Carga Cesa | Conjunto de amarração para transporte de fio-máquina/bobinas industriais com gancho C |
| Raspagem (scraping) | Coleta automatizada de dados de produtos nos sites dos fornecedores |
| Feature Flag | Variável de ambiente que habilita/desabilita funcionalidades sem redeploy |
| RLS | Row Level Security — controle de acesso por linha no PostgreSQL/Supabase |
| MCP | Model Context Protocol — integração entre agente IA e serviços externos |
| Conventional Commits | Padrão de mensagens de commit: `feat:`, `fix:`, `chore:`, `docs:` |

---

*PRD v1.1 — A2Tech © 2026 — Salvar em `docs/prd.md` na raiz do projeto*
