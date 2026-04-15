# Como Rodar o Projeto A2Tech

## 🚀 Instalação Rápida

### 1. Instalar Dependências

```bash
pnpm install
```

Se você não tem o `pnpm` instalado:
```bash
npm install -g pnpm
```

### 2. Iniciar Servidor de Desenvolvimento

```bash
pnpm dev
```

O servidor iniciará em: **http://localhost:3000**

## 📍 Páginas Disponíveis

Você pode acessar as seguintes páginas (mesmo sem Supabase configurado):

### ✅ Páginas Funcionando Sem Backend:

- **Landing Page**: http://localhost:3000
  - Hero com carrossel
  - Barra de benefícios
  - Produtos em destaque (dados mockados)
  - Seção institucional
  - Footer completo

- **Design System**: http://localhost:3000/design-system
  - Documentação completa de cores
  - Tipografia
  - Componentes base (Button, Badge, Card, etc.)
  - Exemplos interativos

### ⚠️ Páginas que Precisam do Supabase:

- **Login**: http://localhost:3000/auth/login
- **Cadastro**: http://localhost:3000/auth/cadastro
- **Recuperar Senha**: http://localhost:3000/auth/recuperar-senha

> **Nota**: As páginas de autenticação vão exibir um aviso no console do navegador dizendo que o Supabase não está configurado, mas não vão quebrar a aplicação.

## 🎨 Explorando o Projeto

### 1. Landing Page

Acesse `http://localhost:3000` para ver:
- Header roxo com logo A2TECH, busca e carrinho
- Barra de benefícios (Frete Grátis, Certificados, 12x, Suporte)
- Hero com carrossel de slides
- Grid de produtos em destaque
- Blocos institucionais (Missão, Certificações, Clientes, Anos)
- Footer completo

### 2. Design System

Acesse `http://localhost:3000/design-system` para ver:
- Paleta de cores do projeto
- Tipografia (tamanhos, pesos)
- Componentes UI com variações
- Guia de uso dos componentes

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Inicia servidor na porta 3000

# Build
pnpm build        # Cria build de produção
pnpm preview      # Preview do build

# Qualidade
pnpm lint         # Roda ESLint
pnpm lint:fix     # Corrige problemas do ESLint
pnpm format       # Formata código com Prettier
pnpm type-check   # Verifica erros TypeScript
```

## 🔧 Configurar Supabase (Opcional)

Se quiser testar as funcionalidades de autenticação:

1. Criar conta em https://supabase.com
2. Criar novo projeto
3. Executar migration em `supabase/migrations/20260407000000_initial_schema.sql`
4. Copiar credenciais para `.env`:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon
   ```
5. Reiniciar servidor (`pnpm dev`)

Ver instruções completas em [`supabase/README.md`](supabase/README.md)

## ❓ Troubleshooting

### Porta 3000 já está em uso

Se a porta 3000 já estiver ocupada, o Vite tentará usar a próxima disponível (3001, 3002, etc.).

### Erro ao instalar dependências

Certifique-se de estar usando Node.js >= 18.0.0:
```bash
node --version
```

### Página em branco

1. Verifique o console do navegador (F12)
2. Certifique-se de que o servidor está rodando
3. Tente limpar o cache: Ctrl+Shift+R (ou Cmd+Shift+R no Mac)

### Erros de TypeScript

Execute:
```bash
pnpm type-check
```

Para ver os erros detalhados.

## 🎯 Próximos Passos

Após explorar a Landing Page:
1. Configure o Supabase para testar autenticação
2. Explore o código seguindo o padrão MVC em `src/features/`
3. Veja o Design System para entender os componentes disponíveis

## 💡 Dicas

- Use o **Hot Reload**: alterações no código atualizam automaticamente no navegador
- Abra o **DevTools** (F12) para ver console e network
- Inspecione elementos para ver classes Tailwind aplicadas
- Navegue entre as páginas pelos links no header e footer
