# Como Aplicar a Migration no Supabase

## ⚠️ Migration Corrigida (07/04/2026)

**Problema resolvido**: O erro `"relation public.usuarios does not exist"` foi corrigido!

A migration foi reorganizada para criar todas as tabelas primeiro (SEÇÃO 1) e depois adicionar as políticas RLS (SEÇÃO 2). Isso resolve a dependência circular onde as políticas da tabela [`fornecedores`](supabase/migrations/20260407000000_initial_schema.sql:14) tentavam referenciar a tabela [`usuarios`](supabase/migrations/20260407000000_initial_schema.sql:29) antes dela ser criada.

---

## Método 1: Via Dashboard (Mais Fácil) ⭐

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Faça login com sua conta
   - Selecione o projeto `a2tech`

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New query**

3. **Cole a Migration**
   - Abra o arquivo `supabase/migrations/20260407000000_initial_schema.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor do Supabase

4. **Execute a Migration**
   - Clique no botão **Run** (ou pressione Ctrl+Enter)
   - Aguarde a execução (pode levar alguns segundos)
   - Você verá "Success" quando terminar

5. **Verifique as Tabelas**
   - No menu lateral, clique em **Table Editor**
   - Você deve ver as tabelas criadas:
     - fornecedores
     - usuarios
     - enderecos
     - produtos
     - pedidos
     - itens_pedido

## Método 2: Via CLI Supabase (Opcional)

Se você já tem a CLI do Supabase instalada:

```bash
# 1. Link o projeto
supabase link --project-ref snhbrorfogpsirxrjtwq

# 2. Aplique a migration
supabase db push
```

## ✅ Checklist Pós-Migration

Após aplicar a migration, verifique:

- [ ] Tabelas criadas no Table Editor
- [ ] Fornecedor "FitaCabo" inserido em `fornecedores`
- [ ] RLS ativo em todas as tabelas (ícone de cadeado verde)
- [ ] Triggers criados (podem ver em Database > Triggers)

## 🎯 Próximos Passos

Após aplicar a migration com sucesso:

1. **Teste o Cadastro**
   ```
   http://localhost:3000/auth/cadastro
   ```
   - Crie uma conta de teste
   - Verifique o e-mail de confirmação
   - Confirme o e-mail
   - Faça login

2. **Verifique no Dashboard**
   - Vá em **Authentication > Users**
   - Você deve ver o usuário criado
   - Vá em **Table Editor > usuarios**
   - O usuário também deve aparecer aqui (trigger automático)

3. **Promover para Admin (Opcional)**
   Se quiser tornar seu usuário admin:
   
   No SQL Editor, execute:
   ```sql
   UPDATE public.usuarios
   SET role = 'admin'
   WHERE email = 'seu-email@exemplo.com';
   ```

## ❓ Troubleshooting

### ✅ Erro: "relation public.usuarios does not exist" [RESOLVIDO]
**Status**: Este erro foi corrigido na versão atual da migration!

**Causa**: A versão anterior tinha uma dependência circular - as políticas RLS da tabela `fornecedores` tentavam referenciar a tabela `usuarios` antes dela existir.

**Solução aplicada**: A migration foi reorganizada em 2 seções:
- **SEÇÃO 1**: Cria todas as tabelas (sem políticas RLS)
- **SEÇÃO 2**: Habilita RLS e cria todas as políticas

Se você ainda está vendo este erro, certifique-se de copiar a versão mais recente do arquivo [`20260407000000_initial_schema.sql`](supabase/migrations/20260407000000_initial_schema.sql:1).

### Erro: "relation already exists"
Algumas tabelas já foram criadas anteriormente. Para limpar e recomeçar:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
Depois rode a migration novamente.

### Erro: "permission denied"
Certifique-se de estar usando o SQL Editor com permissões de admin do projeto.

### Trigger não funciona
Verifique se o trigger foi criado em **Database > Triggers**.
Se não aparecer, execute manualmente a seção de Funções e Triggers da migration.

## 📊 Estrutura Criada

A migration cria:
- ✅ 6 tabelas (fornecedores, usuarios, enderecos, produtos, pedidos, itens_pedido)
- ✅ 20+ índices para performance
- ✅ RLS ativo em todas as tabelas
- ✅ 15+ políticas de segurança
- ✅ 5 triggers para updated_at
- ✅ 1 trigger para criar usuário automaticamente
- ✅ 1 fornecedor seed (FitaCabo)
