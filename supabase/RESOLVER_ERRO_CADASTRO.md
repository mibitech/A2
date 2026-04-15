# 🔧 Resolver Erro no Cadastro - Guia Completo

## 🎯 Situação Atual

Você aplicou o patch de INSERT com sucesso, mas ainda está vendo:
- ❌ **Erro 500**: Falha ao atualizar/buscar dados do usuário
- ❌ **Erro 429**: Too Many Requests (rate limit atingido)

## 🔍 Por Que Está Acontecendo?

1. **Usuário em estado corrompido**: O usuário `15f47c73-5e27-4ac6-9a38-07111abb9b63` foi criado parcialmente antes do fix
2. **Rate limit**: Você tentou cadastrar muitas vezes e atingiu o limite temporário
3. **Mesmo e-mail**: Você está tentando usar o mesmo e-mail que já deu erro antes

## ✅ Solução em 3 Passos

### PASSO 1: Limpar Usuário Corrompido

1. No Supabase Dashboard, vá em **Authentication** → **Users**
2. Procure pelo usuário com ID `15f47c73-5e27-4ac6-9a38-07111abb9b63` ou pelo e-mail que você tentou usar
3. Clique nos 3 pontinhos (⋮) ao lado do usuário
4. Clique em **Delete User**
5. Confirme a exclusão

**OU** execute no SQL Editor:
```sql
DELETE FROM auth.users 
WHERE id = '15f47c73-5e27-4ac6-9a38-07111abb9b63';
```

### PASSO 2: Aguardar Rate Limit Resetar

⏱️ **Aguarde 15-20 minutos** antes de tentar novamente.

O Supabase Auth tem proteção contra spam:
- Limite: ~6 tentativas de signup em 1 hora
- Após atingir o limite, precisa aguardar
- Não tente fazer mais cadastros enquanto isso

### PASSO 3: Testar com Novo E-mail

Após aguardar e limpar o usuário:

1. Acesse http://localhost:3000/auth/signup
2. **Use um e-mail DIFERENTE** (ex: `teste2@example.com`)
3. Preencha todos os campos
4. Clique em "Cadastrar"
5. ✅ Deve funcionar agora!

## 🧪 Verificação Pós-Cadastro

Após cadastro bem-sucedido:

### 1. Verificar no Supabase Dashboard

**Authentication → Users**:
- ✅ Usuário aparece na lista
- ✅ Status: "Confirmed" ou "Waiting for confirmation"

**Table Editor → usuarios**:
- ✅ Registro criado automaticamente pelo trigger
- ✅ Campos preenchidos: email, nome_completo, telefone, etc.

### 2. SQL de Verificação

Execute no SQL Editor:
```sql
-- Verificar último usuário criado
SELECT 
    u.id,
    u.email,
    u.nome_completo,
    u.role,
    u.created_at,
    au.email_confirmed_at
FROM public.usuarios u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC
LIMIT 1;
```

Deve retornar:
- ✅ ID do usuário
- ✅ E-mail correto
- ✅ Nome completo
- ✅ Role = 'cliente'
- ✅ created_at recente

## ⚠️ Se Ainda Não Funcionar

### Erro: "new row violates row-level security policy"

Significa que o trigger ainda não consegue inserir. Execute:

```sql
-- Verificar se a política existe
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuarios' AND cmd = 'INSERT';

-- Deve retornar algo como:
-- "Permitir INSERT via trigger de signup" | INSERT | true
```

Se não aparecer nada, recrie a política:
```sql
CREATE POLICY "Permitir INSERT via trigger de signup"
    ON public.usuarios FOR INSERT
    WITH CHECK (true);
```

### Erro 500 Persistente

Verifique os logs do Supabase:
1. Vá em **Logs** → **API**
2. Procure por erros recentes
3. Compartilhe o erro completo para diagnóstico

### Alternativa: Simplificar o Signup

Se nada funcionar, podemos simplificar temporariamente removendo o UPDATE:

```typescript
// Em src/features/auth/services/auth.service.ts
// Comentar linhas 45-59 (o bloco de UPDATE)
// E pular direto para o SELECT
```

## 📊 Dados de Teste Recomendados

Use estes dados para teste:

```
E-mail: teste.a2tech@mailinator.com
Senha: Teste123!@#
Nome Completo: João Silva Teste
Telefone: (11) 98765-4321
Tipo Pessoa: Física
CPF: 123.456.789-00
```

💡 **Dica**: Use o site [Mailinator](https://www.mailinator.com/) para criar e-mails de teste temporários que não precisam de cadastro prévio.

## 🎓 O Que Aprendemos

1. **RLS precisa de políticas para TODAS as operações**: SELECT, INSERT, UPDATE, DELETE
2. **Triggers precisam de política INSERT**: Mesmo com `SECURITY DEFINER`, o RLS verifica
3. **Rate limits são importantes**: Evitam spam, mas podem atrapalhar testes
4. **Estado corrompido requer limpeza**: Usuários parcialmente criados precisam ser removidos

## 📁 Arquivos Relacionados

- [`supabase/migrations/20260407000000_initial_schema.sql`](../migrations/20260407000000_initial_schema.sql:176) - Migration com fix
- [`supabase/migrations/20260407000001_fix_usuarios_insert_policy.sql`](../migrations/20260407000001_fix_usuarios_insert_policy.sql:1) - Patch aplicado
- [`supabase/LIMPAR_USUARIOS_TESTE.sql`](LIMPAR_USUARIOS_TESTE.sql) - Script de limpeza
- [`src/features/auth/services/auth.service.ts`](../../src/features/auth/services/auth.service.ts:47) - Serviço de autenticação

## 🚀 Próximos Passos

Após o cadastro funcionar:
1. ✅ Testar login
2. ✅ Testar recuperação de senha
3. ✅ Começar implementação do Catálogo de Produtos (ÉPICO 4)
