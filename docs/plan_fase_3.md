## Fase 3 (IA + Wireset + Marketplaces)

```markdown
## Referência obrigatória
Antes de qualquer ação, leia `docs/prd.md`.
Ele contém o PRD completo, stack, épicos, user stories e critérios de aceite do projeto A2Tech.
Nunca tome decisões de arquitetura sem consultar esse documento.
```
## Regras globais de orquestração
1. Commits atômicos com Conventional Commits
2. Migrations em `supabase/migrations/` com timestamp
3. Zero secrets no código — apenas em `.env` (nunca commitar)
4. Rollback por tag Git: v1.0.0, v2.0.0, v3.0.0
5. Delegar cada US ao agente correto: Code, Architect ou Debug
6. Ao concluir cada épico, executar checklist de QA antes de avançar
7. NUNCA usar Vercel — o deploy é via Node.js server (pnpm build + pnpm start + PM2/Docker)

## Pré-requisito
Tag v2.0.0 em produção e aprovada.

## Objetivo da Fase 3
Entregar IA generativa no admin, expansão orgânica de catálogo, marketplaces e app mobile até v3.0.0.

> **Importante**: A A2Tech não tem vínculo com outras empresas do setor. O catálogo cresce de forma orgânica — novos fornecedores e produtos são cadastrados manualmente pelo admin, sem integrações automáticas externas.

## Épicos e User Stories

### ÉPICO 12 — Assistente IA no Admin
- US-26 [Architect]: Integrar LLM (OpenAI ou local) com MCP Supabase + MCP Brevo
  - [ ] Chat no painel: "mostre vendas desta semana" → gráfico gerado dinamicamente
  - [ ] Ação via linguagem natural: "crie campanha para clientes inativos há 30 dias"

### ÉPICO 13 — Expansão de Catálogo
- US-27 [Code]: Suporte a múltiplos fornecedores ativos no catálogo
  - [ ] Filtro por fornecedor/marca na listagem de produtos
  - [ ] Admin cadastra novos fornecedores e produtos manualmente
- US-28 [Code]: Página de detalhe por fornecedor/marca
  - [ ] Listagem de produtos agrupada por fornecedor no catálogo

### ÉPICO 14 — Marketplaces
- US-29 [Code]: Integração Mercado Livre (listagem de produtos via API ML)
  - [ ] Sincronização de estoque bidirecional
- US-30 [Architect]: Webhook de pedidos ML → pedido no Supabase

### ÉPICO 15 — App Mobile
- US-31 [Architect]: PWA ou React Native (avaliar com cliente)
  - [ ] Notificações push para novos pedidos
  - [ ] Catálogo offline-first

### ÉPICO 16 — Observabilidade
- US-32 [Debug]: Logging centralizado (Supabase logs + Sentry)
  - [ ] Alertas de erro crítico via n8n → Slack/WhatsApp

## Critério de conclusão da Fase 3
Tag `v3.0.0` após QA completo, incluindo testes de carga e revisão de segurança.