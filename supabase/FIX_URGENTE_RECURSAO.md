
# 🚨 FIX URGENTE - Recursão Infinita

## ⚠️ Erro Crítico Identificado

```
"infinite recursion detected in policy for relation \"usuarios\""
```

Este é o **erro real** que está impedindo o cadastro e login!

## 🔍 O Que Está Acontecendo?

As políticas RLS da tabela `usuarios` estão causando **recursão infinita**:

```sql
-- Esta política é PROBLEMÁTICA ❌
CREATE POLICY "Admins podem ver todos os usuários"
    ON public.usuarios FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios  -- ← FAZ SELECT NA MESMA TABELA!
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

**O que acontece**:
1. Você tenta fazer SELECT em `usuarios`
2. A política verifica se você é admin fazendo SELECT em `usuarios`
3. Esse SELECT dispara a mesma política novamente
4. Loop infinito! 💥

## ✅ Solução Imediata

### PASSO 1: Aplicar o Fix no Supabase

1. Vá em **SQL Editor** no Supabase Dashboard
2. **Copie e cole TODO o conteúdo** do arquivo [`20260407000002_fix_infinite_recursion.sql`](migrations/20260407000002_fix_infinite_recursion.sql)
3. Execute (Ctrl+Enter)
4. Aguarde "Success"

### PASSO 2: Limpar Usuários de Teste

Execute no SQL Editor:
```sql
-- Deletar todos os usuários de teste corrompidos
DELETE FROM auth.users;
```

### PASSO 3: Testar Cadastro

1. Acesse http://localhost:3000/auth/signup
2. Use um novo e-mail
3. Preencha o formulário
4. **Agora deve funcionar!** ✅

## 🔧 O Que o Fix Faz?

1. **Remove todas as políticas problemáticas** que causam recursão
2. **Cria uma função auxiliar `is_admin()`** com `SECURITY DEFINER`
3. **Recria as políticas** usando a função auxiliar (sem recursão)

### Por Que Funciona?

A função `is_admin()` tem `SECURITY DEFINER`, que significa:
- Executa com privilégios do owner (postgres)
- **Não aplica RLS recursivamente**
- Retorna apenas TRUE/FALSE (seguro)

```sql
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

Agora as políticas usam a função:
```sql
CREATE POLICY "Admins podem ver todos os usuários"
    ON public.usuarios FOR SELECT
    USING (public.is_admin());  -- ✅ Sem recursão!
```

## 📊 Verificar se Funcionou

Após aplicar o fix, execute para testar:

```sql
-- Deve retornar FALSE (você não está logado como admin ainda)
SELECT public.is_admin();

-- Deve listar as políticas sem recursão
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'usuarios';
```

## 🎯 Ordem Completa de Execução

Se você está começando do zero:

```sql
-- 1. Limpar tudo
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 2. Executar migration principal atualizada
-- Cole o conteúdo de: supabase/migrations/20260407000000_initial_schema.sql

-- 3. Aplicar fix de INSERT (se ainda não aplicou)
-- Cole o conteúdo de: supabase/migrations/20260407000001_fix_usuarios_insert_policy.sql

-- 4. Aplicar fix de recursão (CRÍTICO!)
-- Cole o conteúdo de: supabase/migrations/20260407000002_fix_infinite_recursion.sql
```

## ⏱️ Aguardar Rate Limit

Se você ainda vê erro 429:
- Aguarde **15-20 minutos**
- O limite resetará automaticamente
- Não tente fazer mais tentativas enquanto isso

## 🧪 Dados de Teste

Use estes dados para testar:

```
E-mail: admin@a2tech.com.br
Senha: Admin123!@#
Nome: Administrador A2Tech
Telefone: (11) 99999-9999
Tipo: Física
CPF: 000.000.000-00
```

## 🎓 Lição Aprendida

**NUNCA faça queries na mesma tabela dentro de políticas RLS sem `SECURITY DEFINER`!**

❌ Errado:
```sql
CREATE POLICY ... ON tabela
USING (EXISTS (SELECT 1 FROM tabela WHERE ...));
```

✅ Correto:
```sql
-- Criar função auxiliar
CREATE FUNCTION check_permission() 
RETURNS BOOLEAN
SECURITY DEFINER STABLE;

-- Usar na política
CREATE POLICY ... ON tabela
USING (check_permission());
```

## 📁 Arquivos Relacionados

- [`20260407000002_fix_infinite_recursion.sql`](migrations/20260407000002_fix_infinite_recursion.sql) - **APLIQUE ESTE URGENTE!**
- [`20260407000001_fix_usuarios_insert_policy.sql`](migrations/20260407000001_fix_usuarios_insert_policy.sql) - Fix de INSERT
- [`20260407000000_initial_schema.sql`](migrations/20260407000000_initial_schema.sql) - Migration principal
