# CLAUDE.md — Instruções para Trabalhar no Projeto A2Tech

> **Este arquivo é a fonte da verdade para como Claude deve trabalhar neste projeto.**
> Sempre consulte antes de tomar decisões arquiteturais ou criar novos épicos.

---

## 📋 Referências Obrigatórias

1. **PRD Completo**: `docs/prd.md` — stack, épicos, user stories, 3 fases, modelagem de dados
2. **Plano Fase 2**: `docs/plan_fase_2.md` — épicos 7–11 (Admin, Estoque, CRM, Financeiro, Automações)
3. **Plano Fase 3**: `docs/plan_fase_3.md` — épicos 12–16 (IA, Wireset, Marketplaces, Mobile, Observabilidade)
4. **Memória do Projeto**: `C:\Users\rlcun\.claude\projects\C--Projetos-a2tech\memory\MEMORY.md`

**NUNCA** tome decisões sem consultar o PRD. Atualizar este arquivo (CLAUDE.md) quando iniciar cada fase.

---

## 🎯 Objetivo Geral — Fase 2

Entregar **Painel Admin + CRM/ERP** (Fase 2) até a tag **v2.0.0**.

**Pré-requisito**: Tag v1.0.0 já está em produção e aprovada.

---

## 📊 Visão 3 Fases (Contexto Geral)

| Fase | Período | Foco | Tag |
|------|---------|------|-----|
| **Fase 1** ✅ | 0–3 meses | Landing Page + E-commerce (4 produtos FitaCabo) | v1.0.0 |
| **Fase 2** 🚀 | 3–6 meses | Painel Admin + Estoque + CRM + Financeiro + Automações n8n | v2.0.0 |
| **Fase 3** | 6–18 meses | IA generativa + Integração Wireset + Marketplaces + App Mobile | v3.0.0 |

**Estamos na Fase 2.** Detalhes da Fase 3 em `docs/plan_fase_3.md` — apenas informativo por agora.

---

## 🏢 Contexto do Negócio

### Problema & Solução

**Cliente**: Proprietário da **Wireset** (equipamentos de elevação/amarração) com impedimentos societários

**Solução**: Criar empresa independente **A2Tech** como revendedora

**Fase Atual**:
- A2Tech vende 4 produtos iniciais da **FitaCabo** (https://fitacabo.com.br)
- Arquitetura preparada desde o início para absorver **todo catálogo da Wireset** (quando for aprovado na Fase 3)
- Zero impacto entre fornecedores: usamos `fornecedor_id` em todas as tabelas

### Produtos (Fase 1 — FitaCabo)

1. **Etiqueta Azul** — Identificação de cintas de elevação
2. **Sling Colorida** — Eslinga redonda tubular (até 100t)
3. **Amarração de Cargas** — Cintas e catracas para transporte
4. **Carga Cesa** — Conjunto para fio-máquina/bobinas

**OKRs**:
- Lançar e-commerce (✅ Fase 1)
- Atingir 10 pedidos/mês (Mês 2)
- Automatizar 80% dos alertas via n8n (Fase 2)
- Preparar integração Wireset (Fase 3)

---

## 🏗️ Regras Globais de Orquestração

### Commits & Versionamento
- ✅ **Commits Atômicos** com [Conventional Commits](https://www.conventionalcommits.org/)
- ✅ **Migrations** em `supabase/migrations/` com timestamp (YYYYMMDDHHMMSS)
- ✅ **Tags**: v1.0.0, v2.0.0, v3.0.0 para marcar releases

### Segurança
- ✅ **ZERO secrets no código** — apenas em `.env` (nunca commitar `.env`)
- ✅ Não fazer hardcode de API keys, tokens, senhas
- ✅ Variáveis confidenciais: `VITE_` para frontend, sem `VITE_` para backend

### Deploy
- ✅ **NUNCA usar Vercel** para deploy
- ✅ Deploy via Node.js server: `pnpm build` → `pnpm start` → PM2 ou Docker
- ✅ Rollback por tag Git (revert seguro)

### QA & Checklist
- ✅ **Ao concluir cada épico**, executar checklist de QA antes de avançar
- ✅ Testar: autenticação, fluxos de usuário, integração com APIs externas

### Delegação de User Stories

| Tipo de US | Agente | Exemplos |
|-----------|--------|----------|
| Arquitetura, RLS, autorização, patterns | **Architect** | US-17 (roles), US-24 (abandono de carrinho) |
| Implementação de features, CRUD, integração | **Code** | US-18 (estoque), US-19 (alertas), US-25 (NPS) |
| Bugs, debugging, testes, logging | **Debug** | Erros em produção, testes e-2-e |

---

## 📌 Status do Projeto Hoje (2026-04-23)

### ✅ Concluído (Fase 1 — base)
- Hero section + proposta de valor
- Catálogo de produtos (4 SKUs FitaCabo)
- Cadastro/login com Supabase Auth (bug de lock corrigido)
- Carrinho de compras (Context API, localStorage)
- Tabelas de pedidos criadas no Supabase
- Header com dropdown de conta (primeiro nome, Minha Conta, Painel Admin, Sair)
- Rebranding completo: A2TECH → **A2** + **Brasil Supplies LTDA** (header, admin, auth, landing, footer, title)
- ❌ **Checkout com Stripe (US-13) — NÃO IMPLEMENTADO**
- ❌ **E-mail de confirmação com Brevo (US-14) — NÃO IMPLEMENTADO**

### ✅ Concluído (Fase 2 — parcial)

#### Épico 7 — Controle de Acesso ✅
- `is_admin()` e `is_staff()` com SECURITY DEFINER (anti-recursão)
- RLS consolidado em migration `20260423000003` — elimina timeout por recursão nos pedidos
- Rotas admin protegidas: `/admin`, `/admin/estoque`, `/admin/pedidos`, `/admin/clientes`, `/admin/financeiro`, `/admin/site`

#### Épico 8 — Gestão de Estoque ✅
- Tabela `movimentacoes_estoque` + bucket Storage `produtos`
- CRUD completo de produtos, upload de imagens, histórico de movimentações

#### Épico 9 — CRM ✅ (US-20 + tags concluídos)
- `AdminClientesPage`: tabela com busca, filtro por role, stats totais
- `PerfilModal`: abas Info (role management + tags de segmentação) + Pedidos (lazy-load)
- Tags: chips visuais, input com Enter, sugestões, salvar via `updateTagsCliente`
- US-21 (campanhas por Brevo) — bloqueado aguardando chave Brevo

#### Admin Pedidos ✅
- `AdminPedidosPage`: tabela + cards de status + busca; DetalheModal com Itens, Entrega, Observações
- Fluxo de avanço de status manual (sem Stripe)
- Seed de 10 pedidos fake em `supabase/seeds/seed_pedidos_fake.sql` (pendente aplicação pelo usuário)

#### Dashboard Admin ✅ (dados reais)
- 4 cards ao vivo, últimos 5 pedidos, estoque baixo, módulos com status real

#### Minha Conta (/conta) ✅
- Abas: Dados pessoais (editar), Meus pedidos (histórico), Segurança (alterar senha)

#### US-22 parcial — Fluxo de Caixa Manual ✅
- Tabela `lancamentos_caixa` + `categorias_caixa` com seed padrão
- `AdminFinanceiroPage`: abas Lançamentos + Categorias; modal com seleção de categoria por tipo

#### Conteúdo Dinâmico do Site ✅
- Bucket `site` + tabelas `hero_slides`, `conteudo_site`, `sobre_galeria`
- `AdminSitePage`: 5 abas — Carrossel (CRUD de slides + upload), Sobre Nós (textos + galeria), Contatos, Institucional, WhatsApp
- Carrossel da home (`HeroSection`) carrega slides do banco com fallback
- Páginas públicas `/sobre` e `/contatos` com conteúdo parcialmente dinâmico
- Redirect `/contato` → `/contatos`

#### WhatsApp Bubble ✅
- `WhatsAppBubble.tsx` — botão flutuante global, toggle liga/desliga pelo admin
- Configuração em `/admin/site` → aba WhatsApp (número, mensagem, label, toggle)

### ❌ Pendente (travado por dependência externa)
- **US-13** — Checkout Stripe (sem chaves configuradas)
- **US-14** — E-mail Brevo (sem chaves configuradas)
- **US-19** — Alertas estoque mínimo (n8n + WhatsApp)
- **US-21** — Campanhas CRM (Brevo)
- **Épico 10 completo** — Financeiro Stripe (conciliação automática)
- **Épico 11** — Automações n8n

#### Carrinho — Frete Mockado ✅
- `CartPage.tsx` — componente `CalcFrete` com input de CEP, 10 faixas regionais (PAC + SEDEX), frete grátis ≥ R$ 500
- Estrutura pronta para substituir por API real (Melhor Envio / Correios) quando disponível
- Botão "Finalizar Compra" bloqueado até frete ser selecionado

#### Cards de pedido com cores por status ✅
- `AdminPedidosPage.tsx` — `STATUS_CARD` com borda + fundo + texto coloridos por status (mesmo padrão do financeiro)

#### Rebranding completo ✅
- "A2 Brasil Supplies" em todos os pontos: Header, Admin, Auth, Landing, Footer, Design System, Dashboard

### ❌ Pendente (travado por dependência externa)
- **US-13** — Checkout Stripe (sem chaves configuradas)
- **US-14** — E-mail Brevo (sem chaves configuradas)
- **US-19** — Alertas estoque mínimo (n8n + WhatsApp)
- **US-21** — Campanhas CRM (Brevo)
- **Épico 10 completo** — Financeiro Stripe (conciliação automática)
- **Épico 11** — Automações n8n

### 🚀 Próximas Ações (sem bloqueio externo)
1. **Aplicar migration** `20260423000005_whatsapp_bubble.sql` no Supabase SQL Editor
2. **Configurar WhatsApp**: `/admin/site` → aba WhatsApp → número real
3. **Deploy**: `pnpm build && pm2 restart a2tech` no servidor `54.232.189.113`
4. **Aplicar seed de pedidos fake**: `supabase/seeds/seed_pedidos_fake.sql`
5. **Frete real**: integrar API Melhor Envio ou Correios quando disponível
6. Quando chaves disponíveis: US-13 (Stripe) + US-14 (Brevo) + Épico 10

---

## 🔑 Chaves & Configuração

### Ambiente: `.env`

**Configuradas** ✅
- `VITE_SUPABASE_URL` — Supabase (já funciona)
- `VITE_SUPABASE_ANON_KEY` — Supabase (já funciona)
- `VITE_APP_ENV=development`
- `VITE_APP_URL=http://localhost:3000`

**Pendentes** 🟡 (Adicionar quando tiver as chaves)
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe (placeholder atual)
- `STRIPE_SECRET_KEY` — Stripe (backend)
- `BREVO_API_KEY` — Brevo para e-mails
- `N8N_WEBHOOK_URL` — n8n self-hosted (quando configurado)
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` — WhatsApp (opcional, Evolution API é alternativa)

**Nunca commitar** ❌
- Qualquer chave real no repositório
- `.env` (já está em `.gitignore`)

---

## 🛠️ Stack Técnica (Resumo)

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS |
| **Backend** | Node.js (Supabase Edge Functions) |
| **Banco de Dados** | Supabase (PostgreSQL) |
| **Autenticação** | Supabase Auth |
| **Pagamentos** | Stripe (MCP) |
| **E-mail** | Brevo (MCP) |
| **Automações** | n8n (MCP, self-hosted) |
| **Armazenamento** | Supabase Storage |
| **Deploy** | Node.js + PM2/Docker (NÃO Vercel) |
| **Package Manager** | pnpm |
| **Linting/Format** | ESLint + Prettier |

### Princípios Arquiteturais

- **Multi-fornecedor por design**: `fornecedor_id` em todas as tabelas desde o início
- **Feature flags**: `WIRESET_ENABLED` controla exibição de produtos Wireset (Fase 3)
- **Zero secrets**: variáveis via `.env` + Supabase Vault
- **RLS (Row Level Security)**: controle de acesso por linha no PostgreSQL
- **Idempotência**: webhooks Stripe testam duplicidade antes de processar

---

## 📊 MCPs (Model Context Protocol) Disponíveis

Ferramentas para integração com serviços externos. Claude pode usar MCPs para ler/escrever dados sem código manual.

| MCP | Função | Exemplos de Uso |
|-----|--------|-----------------|
| **MCP Supabase** | Queries, migrations, RLS, Storage | CRUD de produtos, histórico estoque |
| **MCP Stripe** | Produtos, preços, checkout, webhooks | Checkout session, confirmação pagamento |
| **MCP Brevo** | E-mails transacionais, campanhas, listas | E-mail boas-vindas, campanhas segmento |
| **MCP n8n** | Criar workflows, ativar automações | Workflow abandono carrinho, NPS |
| **MCP Context7** | Documentação libs | Referência rápida de bibliotecas |

**Futuro (Fase 3)**:
- **MCP OpenAI** — Integração LLM para assistente IA no admin
- **MCP Mercado Livre** — Sincronização marketplace

---

## 🎯 Próximas Ações (Ordenadas)

### 1. IMEDIATO — Aplicar seed de pedidos fake
- Abrir `supabase/seeds/seed_pedidos_fake.sql` no Supabase SQL Editor
- Executar para criar 5 clientes + 10 pedidos de teste
- Testar `/admin/pedidos` e `/conta` com os dados

### 2. US-20 complemento — Tags de segmentação de clientes
- Adicionar coluna `tags` (array text) na tabela `usuarios`
- UI no PerfilModal do AdminClientesPage para adicionar/remover tags
- Útil para US-21 (campanhas segmentadas por Brevo)

### 3. US-22 parcial — Fluxo de caixa manual
- Criar tabela `lancamentos_caixa` (migration)
- CRUD de entradas e saídas manuais no AdminFinanceiroPage
- Totalizador de saldo sem depender do Stripe

### 4. Quando tiver as chaves Stripe/Brevo
- **US-13** [Stripe]: Edge Function + Frontend Checkout + Webhook
- **US-14** [Brevo]: n8n workflow + template e-mail
- **Épico 10 completo** + **Épico 11** (automações n8n)

---

## 📝 Comunicação

- **Usuário**: Profissional não técnico, prefere explicações simples
- **Idioma**: Português (Brasil)
- **Estilo**: Evitar jargões, explicar fluxos de forma visual

---

## ✨ Boas Práticas

- **Leia o PRD antes de começar qualquer US**
- **Consulte este arquivo antes de tomar decisões arquiteturais**
- **Sempre execute checklist de QA ao terminar um épico**
- **Use tags Git para marcar versões (v1.0.0, v2.0.0, etc)**
- **Revise commits: devem ser atômicos e com mensagem clara**
- **Teste integração com APIs externas antes de marcar como "done"**

---

## 📚 Modelagem de Dados (Resumo)

**Tabelas principais** (ver PRD para detalhes completos):

- `fornecedores` — Sellers (FitaCabo, Wireset)
- `produtos` — Catálogo com `fornecedor_id` + `ativo` (feature flag)
- `usuarios` — Clientes + staff (role: client, employee, admin)
- `pedidos` — Vendas com status (pending/paid/cancelled/delivered)
- `itens_pedido` — Linhas de pedido (snapshot do preço)
- `movimentacoes_estoque` — Histórico completo de entrada/saída
- `campanhas_crm` — Campanhas de e-mail com segmento
- `nps_respostas` — Respostas NPS pós-compra

---

## 🚀 Quando Atualizar Este Arquivo

- ✅ Quando iniciar **Fase 3** → detalhar épicos 12–16, MCPs futuros
- ✅ Quando mudarem **chaves de API** → adicionar variáveis necessárias
- ✅ Quando surgirem **decisões arquiteturais** → documentar aqui
- ✅ Quando completar **checklist QA de fase** → marcar como concluída

---

## 📌 Status da Sessão (2026-04-10)

### ✅ Concluído
- Lido PRD completo (visão 360°)
- Explorado código fonte (Cart, Services, DB, Routes)
- Criado plano detalhado (US-13 + US-14)
- Documentado uso de MCPs (ferramentas de dev)

### 🎯 Bloqueante Descoberto
**Fase 1 não está completa!**

Faltam 2 USs críticas:
- **US-13**: Checkout com Stripe (Edge Functions + Webhook)
- **US-14**: E-mail de confirmação (n8n + Brevo)

**Decisão**: Implementar US-13 + US-14 ANTES de começar Fase 2

### 📋 Próximos Passos
1. Obter chaves do Stripe (PUBLISHABLE_KEY + SECRET_KEY)
2. Obter chave do Brevo (API_KEY)
3. Ler plano: `C:\Users\rlcun\.claude\plans\cozy-percolating-glacier.md`
4. Implementar US-13 (Edge Functions) com MCP Stripe
5. Implementar US-14 (n8n + Brevo) com MCP Brevo
6. QA completo
7. Tag v1.0.0

### 💾 Memória Sessão
Salvo em: `C:\Users\rlcun\.claude\projects\C--Projetos-a2tech\memory\sessao_atual.md`
→ **Leia isso amanhã para retomar!**

---

**Última atualização**: 2026-04-10  
**Versão**: Fase 1 Final (US-13 + US-14 em planejamento)  
**Lido**: PRD completo + plan_fase_2.md + plan_fase_3.md  
**Explorado**: Estrutura completa do código (patterns, services, DB schema)
