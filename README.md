# A2Tech - Plataforma E-commerce Industrial

Plataforma de e-commerce B2B para produtos industriais (cabos de aço, cintas de elevação, correntes, lingas, manilhas e acessórios).

## Stack Tecnológica

- **Runtime**: Node.js (LTS)
- **Package Manager**: pnpm
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Pagamentos**: Stripe
- **E-mail**: Brevo
- **Automações**: n8n self-hosted
- **Estilização**: Tailwind CSS
- **Design System**: Tokens centralizados + Componentes base

## Estrutura do Projeto

```
a2tech/
├── src/
│   ├── design/              # Tokens de design (cores, tipografia, etc.)
│   ├── components/ui/       # Componentes base reutilizáveis
│   ├── features/            # Features organizadas por MVC
│   │   ├── design-system/   # Documentação do Design System
│   │   ├── auth/            # Autenticação
│   │   ├── products/        # Catálogo de produtos
│   │   ├── cart/            # Carrinho e checkout
│   │   └── landing/         # Landing page
│   ├── lib/                 # Utilitários e instâncias (Supabase client)
│   └── types/               # Tipos globais
├── supabase/                # Migrations e Edge Functions
├── scripts/                 # Scripts Node.js (scraping, etc.)
└── public/                  # Assets estáticos
```

## Padrão de Arquitetura (MVC)

O projeto segue rigorosamente o padrão MVC adaptado para React/Vite:

- **Model** (`models/`, `services/`, `lib/`, `types/`): Tipos, schemas, chamadas ao Supabase
- **Controller** (`controllers/use*.ts`): Hooks que orquestram estado e services
- **View** (`views/`, `components/`): Componentes visuais puros, sem lógica de negócio

### Fluxo de Dependência
```
View → Controller (hook) → Service → Supabase/API
```

## Instalação

### Pré-requisitos
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Passos

1. **Instalar dependências**
   ```bash
   pnpm install
   ```

2. **Configurar variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas credenciais do Supabase, Stripe, etc.

3. **Iniciar servidor de desenvolvimento**
   ```bash
   pnpm dev
   ```
   O servidor estará disponível em `http://localhost:3000`

4. **Acessar Design System**
   ```
   http://localhost:3000/design-system
   ```

## Scripts Disponíveis

- `pnpm dev` - Inicia servidor de desenvolvimento (porta 3000)
- `pnpm build` - Gera build de produção
- `pnpm preview` - Preview do build de produção
- `pnpm start` - Inicia servidor de produção (porta 3000)
- `pnpm lint` - Executa ESLint
- `pnpm lint:fix` - Corrige problemas do ESLint automaticamente
- `pnpm format` - Formata código com Prettier
- `pnpm type-check` - Verifica erros de TypeScript sem gerar build

## Design System

O projeto possui um Design System completo acessível em `/design-system` (apenas em desenvolvimento).

### Tokens de Design

Todos os tokens estão centralizados em `src/design/tokens.ts`:
- **Cores**: Brand (roxo), estados (success, error, warning, info), neutros
- **Tipografia**: Font family, tamanhos (h1-h6, body, caption), pesos
- **Espaçamentos**: xs, sm, md, lg, xl, 2xl, 3xl, 4xl
- **Border Radius**: sm, md, lg, xl, 2xl, full
- **Shadows**: Sombras predefinidas para cards e elevações

### Componentes Base

Componentes reutilizáveis em `src/components/ui/`:
- `Button` - Botões com variantes (primary, secondary, ghost, danger)
- `Badge` - Tags e labels (MAIS VENDIDO, PROMOÇÃO, etc.)
- `Card` - Cards para produtos, benefícios, conteúdo
- `Tag` - Pequenas labels (Frete Grátis, etc.)
- `IconWithText` - Blocos de missão, certificações, estatísticas

## Qualidade de Código

- **TypeScript Strict Mode**: Ativo em todo o projeto
- **ESLint**: Configurado com regras para React e TypeScript
- **Prettier**: Formatação consistente de código
- **Validação com Zod**: Todas as entradas são validadas
- **RLS (Row Level Security)**: Ativo em todas as tabelas do Supabase

## Roadmap (Fase 1)

- [x] Setup inicial (Vite + React + TypeScript + Tailwind)
- [x] Design System e tokens de design
- [x] Componentes base UI
- [ ] Configurar Supabase (tabelas, RLS, Edge Functions)
- [ ] Landing Page
- [ ] Autenticação (cadastro, login, recuperação de senha)
- [ ] Catálogo de produtos
- [ ] Carrinho de compras
- [ ] Checkout com Stripe
- [ ] E-mails transacionais com Brevo
- [ ] Deploy em servidor Node.js

## Regras Importantes

1. **Zero secrets no código** - Apenas em `.env` (nunca commitar)
2. **Commits atômicos** - Seguir Conventional Commits
3. **Migrations versionadas** - Em `supabase/migrations/` com timestamp
4. **Padrão MVC obrigatório** - Nunca violar o fluxo View → Controller → Service
5. **Componentes puros na View** - Sem lógica de negócio, sem useEffect
6. **NUNCA usar Vercel** - Deploy via Node.js server (PM2/Docker)

## Suporte

Para dúvidas ou problemas, consulte a documentação do projeto em `docs/prd.md`.

## Licença

Proprietary - A2Tech © 2026
