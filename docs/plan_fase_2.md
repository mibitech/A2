## Fase 2 (Painel Admin + CRM/ERP)

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
Tag v1.0.0 em produção e aprovada.

## Objetivo da Fase 2
Entregar Painel Admin com Estoque, CRM, Financeiro e Automações n8n até a tag v2.0.0.

## Épicos pendentes da fase anterior
O ÉPICO 6 é sobre deploy em produção, mas ainda faltam completar:

US-13: Checkout com Stripe (integração de pagamento)
US-14: E-mail de confirmação de pedido (integração com Brevo)

## Épicos e User Stories

### ÉPICO 7 — Controle de Acesso Admin
- US-17 [Architect]: Roles: admin, funcionário, cliente
  - [ ] Supabase RLS por role
  - [ ] Middleware de autorização no frontend (React Router guards)

### ÉPICO 8 — Gestão de Estoque
- US-18 [Code + MCP Supabase]: CRUD de produtos no painel admin
  - [ ] Upload de imagens para Supabase Storage
  - [ ] Histórico de movimentações de estoque
- US-19 [Code]: Alertas de estoque mínimo
  - [ ] Trigger Supabase → n8n → WhatsApp (Twilio ou Evolution API)

### ÉPICO 9 — CRM
- US-20 [Code + MCP Supabase]: Listagem e perfil de clientes
  - [ ] Histórico de pedidos por cliente
  - [ ] Tag de segmentação manual
- US-21 [Code + MCP Brevo]: Campanhas de e-mail por segmento
  - [ ] Criação de lista Brevo via MCP
  - [ ] Envio agendado

### ÉPICO 10 — Financeiro
- US-22 [Code]: Módulo de conciliação financeira
  - [ ] Integração Stripe Dashboard (leitura de saldos e transações via API)
  - [ ] Fluxo de caixa simplificado (entradas/saídas manuais)
- US-23 [Code]: Relatório semanal automático
  - [ ] n8n: toda segunda-feira às 8h envia PDF com vendas da semana por e-mail

### ÉPICO 11 — Automações n8n Fase 2
- US-24 [Architect + MCP n8n]: Workflow abandono de carrinho
  - [ ] Trigger: 2h sem finalizar pedido → e-mail Brevo com cupom 5%
- US-25 [Code + MCP n8n]: NPS automático pós-compra
  - [ ] 7 dias após entrega → e-mail com formulário NPS

## Critério de conclusão da Fase 2
Tag `v2.0.0` após QA: todos os módulos admin funcionais, automações ativas no n8n.