## Fase 1 (Landing Page + E-commerce)

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

## Objetivo da Fase 1
Entregar Landing Page + E-commerce funcional até a tag v1.0.0.

## Referência Visual — Protótipos Aprovados

As imagens anexas ao repositório do projeto representam protótipos aprovados para a interface da Fase 1 (listagem de produtos e rodapé institucional).  
O agente **Code** deve utilizá-las como referência fiel de layout, hierarquia visual e componentes.
Imagens de referencia estão no local **/docs/img**

- `img1.png,img2.png,img3.png,img4.png,img5.png` (protótipo de listagem de produtos)  
  - Header com barra roxa, logo A2TECH e busca central.  
  - Barra superior com benefícios (frete grátis, produtos certificados, até 12x sem juros, suporte técnico).  
  - Sidebar à esquerda com categorias e filtros (categoria, preço, capacidade etc.).  
  - Carrossel hero de destaque no topo do conteúdo, com cards laterais.  
  - Grid de produtos com: imagem, nome, preço, parcelamento, badge (ex.: “MAIS VENDIDO”, “Promoção”) e nota.
  - Faixa superior com 4 blocos: Nossa Missão, Certificações, +500 Clientes, 20+ Anos.  
  - Menu de links em colunas: Produtos, Institucional, Atendimento, Contato, Redes Sociais, Baixe nosso app.  
  - Faixa inferior com ícones de confiança: Compra Segura, Até 12x sem juros, Frete Grátis acima de R$ 500.

### Regras para uso dos protótipos

1. Respeitar a **estrutura geral de layout** (disposição de header, barra de benefícios, sidebar, conteúdo e footer) conforme os protótipos.
2. Usar Tailwind CSS para aproximar **ao máximo cores, espaçamentos e tipografia** mostrados nas imagens (não precisa ser pixel-perfect, mas deve ser coerente).
3. Manter os **componentes reutilizáveis** (cards de produto, blocos de benefícios, colunas de footer) como componentes React isolados.
4. Em caso de conflito entre texto genérico de user stories e os protótipos, a **decisão visual dos protótipos prevalece**, desde que não quebre requisitos funcionais.

## Seção de Design System (Fase 1)

Crie uma área de Design System dentro do projeto para facilitar a manutenção futura de cores, fontes e componentes.  
O agente **Code** deve implementar:

### 1. Tokens de Design (cores, tipografia, espaçamentos)

- Definir um arquivo central de tokens, por exemplo: `src/design/tokens.ts` ou `src/styles/tokens.ts`, contendo:
  - Paleta principal (baseada no roxo do header e nos tons neutros dos protótipos).
  - Cores de estado (sucesso, erro, aviso, info).
  - Tipografia (font-family padrão, tamanhos, pesos para títulos, subtítulos, body, caption).
  - Espaçamentos e radius padrão (ex.: `spacing.xs/sm/md/lg/xl`, `radius.sm/md/lg/full`).

- Integrar esses tokens com o `tailwind.config.cjs`, expondo:
  - `theme.colors.brand` (principal, hover, claro, escuro).
  - `theme.fontFamily` para fontes padrão do projeto.
  - `theme.borderRadius` e `theme.spacing` conforme os tokens.

### 2. Biblioteca de Componentes Base

Criar uma pasta de componentes base reutilizáveis, por exemplo `src/components/ui/`, contendo no mínimo:

- `Button` (primário, secundário, ghost) — usado em CTAs, cards de produto, carrossel.
- `Badge` — para “MAIS VENDIDO”, “Promoção”, “Exclusivo”, etc.
- `Card` — base para cards de produto, cards de benefícios, cards de destaque.
- `Tag` ou `Pill` — para pequenas labels (ex.: “Frete Grátis”).
- `IconWithText` — componente para os blocos de missão, certificações, clientes, anos.
- `LayoutShell` — estrutura base com header, barra de benefícios, conteúdo e footer.

### 3. Página de Documentação do Design System

Criar uma rota interna (ex.: `/design-system` ou `/docs/design-system`) acessível apenas em ambiente de desenvolvimento, contendo:

- Seção de **Cores**: exibir todos os tokens de cor com nome, uso recomendado e exemplo visual.
- Seção de **Tipografia**: exemplos de headings (H1–H6), body, legendas, com classes Tailwind correspondentes.
- Seção de **Componentes UI**: preview interativo dos componentes base (Button, Card, Badge, etc.) com variações de estado (hover, disabled, loading).
- Seção de **Layout**: exemplos da aplicação dos componentes na estrutura de página (header, barra de benefícios, listagem, footer), aproximando-se dos protótipos anexos.

### 4. Boas práticas

- Qualquer novo componente visual deve **reutilizar tokens e componentes base** — evitar estilos inline ou classes Tailwind soltas que dupliquem cores e tamanhos.
- Alterações na identidade visual (cor primária, fonte) devem ser feitas **apenas via tokens** e Tailwind config.
- A documentação do Design System deve ser atualizada sempre que novos componentes base forem criados.

## Épicos e User Stories

### ÉPICO 1 — Infraestrutura & Setup
- US-01 [Architect]: Inicializar repositório com pnpm, Vite+React+TS, Tailwind, ESLint, Prettier
  - [ ] `pnpm create vite` configurado
  - [ ] `pnpm install` instala sem erros
  - [ ] Scripts: dev, build, start, lint
- US-02 [Architect]: Configurar Supabase (projeto, tabelas iniciais, RLS)
  - [ ] Tabelas: `produtos`, `fornecedores`, `usuarios`, `pedidos`, `itens_pedido`
  - [ ] Campo `fornecedor_id` em `produtos`
  - [ ] RLS ativo em todas as tabelas
- US-03 [Code]: Configurar variáveis de ambiente (.env.example documentado)
  - [ ] Nenhum secret hardcoded
  - [ ] `.env` no .gitignore

### ÉPICO 2 — Landing Page
- US-04 [Code]: Hero section com proposta de valor A2Tech
  - [ ] CTA visível acima da dobra
  - [ ] Responsivo (mobile-first)
- US-05 [Code]: Seção de produtos em destaque (FitaCabo)
  - [ ] Cards com imagem, nome, preço e botão "Ver produto"
- US-06 [Code]: Seção institucional + rodapé com contato
  - [ ] Links para redes sociais e WhatsApp

### ÉPICO 3 — Autenticação
- US-07 [Code]: Cadastro e login com Supabase Auth (e-mail + senha)
  - [ ] Fluxo: cadastro → confirmação e-mail → login
  - [ ] MCP Brevo: e-mail de boas-vindas disparado via n8n
- US-08 [Code]: Recuperação e alteração de senha
  - [ ] Link de reset expira em 1h
  - [ ] Página de nova senha com validação

### ÉPICO 4 — Catálogo de Produtos
- US-09 [Code]: Listagem de produtos com filtro por categoria e fornecedor
  - [ ] MCP Supabase: query com filtros dinâmicos
  - [ ] Paginação (20 itens/página)
- US-10 [Code]: Página de detalhe do produto
  - [ ] Imagem, descrição, preço, estoque disponível, botão "Adicionar ao carrinho"
- US-11 [Architect]: Raspagem inicial FitaCabo → seed no Supabase
  - [ ] Script Node.js em `scripts/scrape-fitacabo.ts`
  - [ ] Dados: nome, descrição, imagens, categorias, `fornecedor_id = 'fitacabo'`

### ÉPICO 5 — Carrinho e Checkout
- US-12 [Code]: Carrinho de compras (context API ou Zustand)
  - [ ] Adicionar, remover, alterar quantidade
  - [ ] Persistência em localStorage
- US-13 [Code + MCP Stripe]: Checkout com Stripe
  - [ ] Criar Stripe Checkout Session via edge function Supabase
  - [ ] Webhook Stripe → atualiza status do pedido no Supabase
- US-14 [Code + MCP Brevo]: E-mail de confirmação de pedido
  - [ ] Disparado via n8n após webhook Stripe `payment_intent.succeeded`

### ÉPICO 6 — Deploy Fase 1
- US-15 [Architect]: Configurar servidor Node.js para produção
  - [ ] `pnpm build` gera `/dist`
  - [ ] PM2 ou Docker Compose sobe o servidor
  - [ ] Variáveis de ambiente via `.env` no servidor
- US-16 [Debug]: Checklist de QA Fase 1
  - [ ] Fluxo completo: cadastro → login → catálogo → carrinho → checkout → e-mail confirmação
  - [ ] Lighthouse score ≥ 85 (mobile)
  - [ ] Nenhum secret exposto no bundle

## Critério de conclusão da Fase 1
Tag `v1.0.0` criada no Git após aprovação do checklist de QA.