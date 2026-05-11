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

## 📌 Status do Projeto — v2.0.0 (2026-05-11)

### ✅ Concluído (Fase 1 — base)
- Hero section + proposta de valor
- Catálogo de produtos (4 SKUs FitaCabo)
- Cadastro/login com Supabase Auth (bug de lock corrigido)
- Carrinho de compras (Context API, localStorage)
- Tabelas de pedidos criadas no Supabase
- Header com dropdown de conta (primeiro nome, Minha Conta, Painel Admin, Sair)
- Rebranding completo: A2TECH → **A2** + **Brasil Supplies LTDA** (header, admin, auth, landing, footer, title)
- ❌ **Checkout com Stripe (US-13) — pendente** (chaves configuradas, falta Edge Function)
- ❌ **E-mail de confirmação com Brevo (US-14) — pendente**

### ✅ Concluído (Fase 2 — COMPLETA 🎉) — tag v2.0.0

#### Épico 7 — Controle de Acesso ✅
- `is_admin()` e `is_staff()` com SECURITY DEFINER (anti-recursão)
- RLS consolidado em migration `20260423000003` — elimina timeout por recursão nos pedidos
- Rotas admin protegidas: `/admin`, `/admin/estoque`, `/admin/pedidos`, `/admin/clientes`, `/admin/financeiro`, `/admin/site`

#### Épico 8 — Gestão de Estoque ✅
- Tabela `movimentacoes_estoque` + bucket Storage `produtos`
- CRUD completo de produtos, upload de imagens, histórico de movimentações
- Ordenação clicável (Produto, Categoria, Preço, Estoque) + paginação (10/20/50/100)

#### Épico 9 — CRM ✅ (US-20 + tags + campanhas completo)
- `AdminClientesPage`: tabela com busca, filtro por role, stats totais
- `PerfilModal`: edição completa — nome, telefone, CPF/CNPJ, tipo pessoa, role, tags
- Tags: chips visuais, input com Enter, sugestões da base + salvar (RLS corrigido)
- **Campanhas — sistema completo** (`/admin/campanhas`):
  - Aba Templates: CRUD com mini-preview (scale 35%), modal editor + toggle preview
  - Aba Campanhas: tabela com filtros de status, ações por lifecycle + paginação
  - Segmentos: todos / clientes / por_tag / lista_manual
  - Lista manual: textarea com parsing robusto, preview chips verde/laranja, deduplicação
  - Lifecycle: Enviando → Enviada → Arquivada; botão Reenviar gera novo registro
- Fix RLS: `20260506000002` — UPDATE em `usuarios` permite `is_staff()` (não só admin)
- US-21: Edge Function `send-campaign` com envio paralelo (`Promise.allSettled`), BREVO_API_KEY configurada
  → Verificar app.brevo.com → Contacts → Blocklist se e-mails não chegarem

#### Admin Pedidos ✅
- `AdminPedidosPage`: tabela + cards mobile + busca; DetalheModal com Itens, Entrega, Observações
- Fluxo de avanço de status manual (sem Stripe)
- Ordenação clicável (Cliente, Status, Total, Data) + paginação

#### Integração Pedido → Caixa ✅
- Pedido marcado como "pago" cria `lancamento_caixa` do tipo `entrada` automaticamente
- Idempotente: verifica `observacoes LIKE '%pedido:ID%'` antes de inserir (evita duplicatas)

#### Dashboard Admin ✅ (dados reais)
- 5 cards ao vivo: Pedidos, Clientes, Produtos, Receita, Saldo do Caixa
- Últimos 5 pedidos, estoque baixo, módulos com status real

#### Minha Conta (/conta) ✅
- Abas: Dados pessoais (editar), Meus pedidos (histórico), Segurança (alterar senha)

#### Acompanhe seu Pedido (/rastrear-pedido) ✅
- Progresso visual 5 etapas (pendente → entregue), caso especial "cancelado"

#### US-22 — Fluxo de Caixa Manual ✅
- Tabela `lancamentos_caixa` + `categorias_caixa` com seed padrão
- `AdminFinanceiroPage`: filtro por data (De/Até), gráfico SVG 6 meses, abas Lançamentos + Categorias
- Paginação na aba Lançamentos (10/20/50/100)

#### Frete ViaCEP ✅
- `frete.service.ts`: ViaCEP para validar CEP + exibir cidade/UF, tabela preços por UF
- Frete grátis se subtotal ≥ R$500

#### Conteúdo Dinâmico do Site ✅
- Bucket `site` + tabelas `hero_slides`, `conteudo_site`, `sobre_galeria`
- `AdminSitePage`: 5 abas — Carrossel, Sobre Nós, Contatos, Institucional, WhatsApp

#### Responsividade Mobile ✅ (todas as 5 telas admin)
- Tabela desktop (`hidden md:block`) + Cards mobile (`md:hidden`) em: Pedidos, Estoque, Clientes, Financeiro, Campanhas

#### Qualidade de Código ✅
- Tipos Supabase regenerados via CLI (inclui todas as tabelas da Fase 2)
- Zero erros TypeScript (`pnpm tsc --noEmit` limpo)
- AbortController 10s em todos os SELECTs admin

#### Script de Produção ✅
- `supabase/scripts/preparar_producao.sql` — limpa dados de teste, mantém tabelas de apoio, reseta estoque

### ❌ Bloqueados por dependência externa
- **US-13** — Checkout Stripe (chaves configuradas, falta implementar Edge Function + webhook)
- **US-14** — E-mail confirmação de pedido (Brevo OK, falta implementar o fluxo)
- **US-19** — Alertas estoque mínimo (n8n + WhatsApp)
- **Épico 10** — Financeiro Stripe (conciliação automática)
- **Épico 11** — Automações n8n

### 🚀 Próximas Ações (sem bloqueio externo)
1. **Deploy produção** — `git push && git pull && pnpm build && pm2 restart a2tech` em `91.99.217.157`
2. **Brevo Blocklist** — verificar app.brevo.com → Contacts → Blocklist se e-mails de campanha não chegarem
3. **Configurar WhatsApp** — `/admin/site` → aba WhatsApp → número real
4. **US-13 + US-14** — Stripe checkout + e-mail confirmação (chaves já configuradas)

---

## 🔑 Chaves & Configuração

### Ambiente: `.env`

**Configuradas** ✅
- `VITE_SUPABASE_URL` — Supabase
- `VITE_SUPABASE_ANON_KEY` — Supabase
- `VITE_APP_ENV=production`
- `VITE_APP_URL=https://www.a2brasilsupplies.com.br`
- `BREVO_API_KEY` — Brevo (configurada em `.env` e como secret Supabase)
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe (test mode)
- `STRIPE_SECRET_KEY` — Stripe (test mode)

**Pendentes** 🟡
- `N8N_WEBHOOK_URL` — n8n self-hosted (quando configurado)
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` — WhatsApp (opcional, Evolution API é alternativa)
- Chaves Stripe **produção** (hoje estão em test mode)

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

### 1. IMEDIATO — Deploy v2.0.0
- `git push origin main && git push origin v2.0.0`
- No servidor `91.99.217.157`: `git pull && pnpm build && pm2 restart a2tech`
- Executar `supabase/scripts/preparar_producao.sql` no Supabase SQL Editor antes do go-live

### 2. Configuração pós-deploy
- WhatsApp: `/admin/site` → aba WhatsApp → número real
- Frete real: substituir tabela ViaCEP por Melhor Envio/Correios quando tiver credenciais + pesos dos produtos

### 3. Quando tiver as chaves Stripe/Brevo
- **US-13** [Stripe]: Edge Function + Frontend Checkout + Webhook
- **US-14** [Brevo]: n8n workflow + template e-mail confirmação
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
- `pedidos` — Vendas com status (`pendente` → `pago` → `processando` → `enviado` → `entregue` | `cancelado`)
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

---

**Última atualização**: 2026-05-11  
**Versão**: v2.0.0 — Fase 2 completa (Épicos 7–9 + Financeiro + Responsividade + Qualidade de Código)  
**Commit**: ver `git log --oneline -5`
