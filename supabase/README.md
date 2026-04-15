# Configuração Supabase - A2Tech

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova organização (se ainda não tiver)
3. Crie um novo projeto:
   - Nome: `a2tech-prod` (ou outro nome)
   - Database Password: gere uma senha forte e guarde com segurança
   - Region: escolha a mais próxima (ex: South America - São Paulo)

## Passo 2: Executar Migration Inicial

1. Instale a CLI do Supabase:
   ```bash
   npm install -g supabase
   ```

2. Faça login:
   ```bash
   supabase login
   ```

3. Link o projeto local com o projeto remoto:
   ```bash
   supabase link --project-ref SEU_PROJECT_REF
   ```
   (Encontre o `project-ref` em Project Settings > General > Reference ID)

4. Execute a migration:
   ```bash
   supabase db push
   ```

**OU** copie e cole o conteúdo de `migrations/20260407000000_initial_schema.sql` diretamente no SQL Editor do Supabase Dashboard.

## Passo 3: Configurar Variáveis de Ambiente

1. No Supabase Dashboard, vá em Project Settings > API
2. Copie as credenciais:
   - Project URL
   - anon/public key

3. No projeto local, crie o arquivo `.env`:
   ```bash
   cp .env.example .env
   ```

4. Preencha as variáveis:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

## Passo 4: Configurar Auth

1. No Supabase Dashboard, vá em Authentication > URL Configuration
2. Configure as URLs:
   - Site URL: `http://localhost:3000` (dev) ou `https://seu-dominio.com` (prod)
   - Redirect URLs: adicione `http://localhost:3000/**` e suas URLs de produção

3. Em Authentication > Email Templates, personalize:
   - Confirm signup
   - Reset password
   - Magic Link

## Passo 5: Configurar Storage (para imagens de produtos)

1. No Supabase Dashboard, vá em Storage
2. Crie um bucket chamado `produtos-imagens`:
   - Public: `true`
   - File size limit: `5MB`
   - Allowed MIME types: `image/jpeg,image/png,image/webp`

3. Configure policies para permitir:
   - Leitura pública
   - Upload apenas para admins

## Passo 6: Criar Primeiro Admin

Após fazer signup no sistema, você precisa promover seu usuário a admin:

```sql
-- No SQL Editor do Supabase:
UPDATE public.usuarios
SET role = 'admin'
WHERE email = 'seu-email@exemplo.com';
```

## Estrutura de Tabelas

- `fornecedores` - Fornecedores (FitaCabo, Wireset)
- `produtos` - Catálogo multi-fornecedor
- `usuarios` - Usuários do sistema
- `enderecos` - Endereços de entrega
- `pedidos` - Pedidos realizados
- `itens_pedido` - Itens de cada pedido

## RLS (Row Level Security)

Todas as tabelas têm RLS ativo com as seguintes políticas:

- **Leitura pública**: produtos e fornecedores ativos
- **Leitura autenticada**: usuários veem seus próprios dados (pedidos, endereços)
- **Administração**: apenas role `admin` pode gerenciar produtos, fornecedores e todos os pedidos

## Backup e Restore

Para fazer backup manual:
```bash
supabase db dump -f backup.sql
```

Para restaurar:
```bash
supabase db reset
supabase db push
```

## Troubleshooting

### Erro: "relation does not exist"
Execute a migration novamente ou verifique se está conectado ao projeto correto.

### Erro: RLS impede acesso
Verifique se o usuário está autenticado e se as políticas RLS estão corretas para o caso de uso.

### Produtos não aparecem
Verifique se o campo `ativo = true` nos produtos e fornecedores.
