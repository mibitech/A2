# 🚨 FIX RÁPIDO - Erro 500 no Cadastro

## Problema

Você está vendo este erro ao tentar se cadastrar:
```
Failed to load resource: the server responded with a status of 500
Error: relation public.usuarios does not exist
```

E também pode estar vendo:
```
POST /auth/v1/signup 429 (Too Many Requests)
```

## Causa

O erro 500 acontece porque a tabela `usuarios` **não tem política de INSERT**. O trigger `handle_new_user()` tenta inserir um registro quando você se cadastra, mas o RLS bloqueia porque não há permissão.

O erro 429 acontece porque você tentou se cadastrar várias vezes. O Supabase limita tentativas para evitar spam.

## Solução Rápida

### 1. Aplicar o Patch no Supabase

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto A2Tech
3. Vá em **SQL Editor** → **New query**
4. Cole este código:

```sql
-- Adicionar política de INSERT na tabela usuarios
CREATE POLICY "Permitir INSERT via trigger de signup"
    ON public.usuarios FOR INSERT
    WITH CHECK (true);
```

5. Clique em **Run** (Ctrl+Enter)
6. Aguarde a mensagem "Success"

### 2. Aguardar o Rate Limit Resetar (se necessário)

Se você ainda vê o erro 429:
- Aguarde **10-15 minutos** antes de tentar novamente
- O limite é temporário e resetará automaticamente
- Não tente fazer mais cadastros enquanto isso

### 3. Testar o Cadastro

Após aplicar o patch e aguardar o rate limit:

1. Acesse http://localhost:3000/auth/signup
2. Preencha o formulário com **um novo e-mail** (diferente dos que você já tentou)
3. Clique em "Cadastrar"
4. Verifique seu e-mail para confirmar a conta

### 4. Verificar no Dashboard

Após o cadastro:
1. Vá em **Authentication** → **Users**
2. Você deve ver seu usuário criado
3. Vá em **Table Editor** → **usuarios**
4. O registro deve aparecer automaticamente (trigger funcionou!)

## Alternativa: Reaplicar a Migration Completa

Se preferir reaplicar toda a migration com o fix incluído:

1. **Delete todas as tabelas no Supabase Dashboard**:
   - Table Editor → Selecione cada tabela → Delete
   - Ordem: itens_pedido → pedidos → produtos → enderecos → usuarios → fornecedores

2. **Execute a migration atualizada**:
   - Abra `supabase/migrations/20260407000000_initial_schema.sql`
   - Copie TODO o conteúdo (o arquivo já tem o fix incluído)
   - Cole no SQL Editor
   - Execute

## Próximos Passos

Após o cadastro funcionar:

1. ✅ Confirme seu e-mail
2. ✅ Faça login em http://localhost:3000/auth/login
3. ✅ Teste a navegação no sistema
4. 📝 Relate qualquer outro erro que encontrar

## Por Que Isso Aconteceu?

A migration inicial criou a tabela `usuarios` com RLS ativo, mas esqueceu de criar uma política de INSERT. Isso significa:

- ✅ Usuários podem **ler** seus próprios dados (SELECT)
- ✅ Usuários podem **atualizar** seus próprios dados (UPDATE)
- ❌ **Ninguém** podia inserir novos registros (INSERT) ← ESTE ERA O PROBLEMA

Mesmo a função `handle_new_user()` tendo `SECURITY DEFINER`, o Postgres ainda aplica RLS na tabela de destino. A política `WITH CHECK (true)` permite que o trigger insira, mas não permite que usuários façam INSERT direto porque no momento do signup o `auth.uid()` ainda não está autenticado.

## Arquivos Relacionados

- [`supabase/migrations/20260407000000_initial_schema.sql`](../migrations/20260407000000_initial_schema.sql) - Migration completa (já corrigida)
- [`supabase/migrations/20260407000001_fix_usuarios_insert_policy.sql`](../migrations/20260407000001_fix_usuarios_insert_policy.sql) - Patch isolado
- [`src/features/auth/services/auth.service.ts`](../../src/features/auth/services/auth.service.ts) - Service de autenticação
