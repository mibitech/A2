# 🚨 MODO EMERGÊNCIA ATIVADO

## O Que Foi Feito

Para permitir que você use o sistema **AGORA**, sem precisar esperar ou aplicar fixes no banco, ativei um **MODO EMERGÊNCIA** que desabilita temporariamente a tabela `usuarios`.

## ✅ Como Funciona

1. **Arquivo criado**: [`src/lib/supabase/config.ts`](src/lib/supabase/config.ts)
   - `DISABLE_USUARIOS_TABLE = true` ← MODO EMERGÊNCIA ATIVO

2. **Login/Cadastro funcionam** sem acessar a tabela `usuarios`
   - Sem erro 500
   - Sem recursão infinita
   - Sem timeout
   - Sem botão travado

3. **Dados armazenados apenas no Supabase Auth**
   - E-mail, senha, metadata (nome, telefone, etc.)
   - Não salva na tabela `usuarios`

## 🎯 Como Usar AGORA

### 1. Parar e Reiniciar o Servidor

No terminal onde está rodando `pnpm dev`:
```bash
# Pressione Ctrl+C para parar
# Depois execute novamente:
pnpm dev
```

### 2. Deletar Usuários Corrompidos (Opcional)

No SQL Editor do Supabase:
```sql
DELETE FROM auth.users;
```

### 3. Aguardar Rate Limit (Se Necessário)

Se você vê erro 429, aguarde **15-20 minutos**.

### 4. Testar Cadastro/Login

- Acesse http://localhost:3000/auth/signup
- Use um **NOVO e-mail**
- Cadastre normalmente
- ✅ Deve funcionar sem travar!

## ⚠️ Limitações do Modo Emergência

Enquanto `DISABLE_USUARIOS_TABLE = true`:

| Funciona | Não Funciona |
|----------|--------------|
| ✅ Cadastro | ❌ Salvar dados na tabela usuarios |
| ✅ Login | ❌ Buscar role do banco |
| ✅ Navegação | ❌ Admin panel |
| ✅ Autenticação | ❌ Permissões avançadas |

**Todos os usuários terão**:
- Role: `cliente` (sempre)
- Dados básicos do Auth metadata
- Funcionalidades limitadas

## 🔧 Como Voltar ao Normal

Quando você aplicar o fix de recursão no banco:

### 1. Aplicar Fix no Supabase

Execute no SQL Editor:
```sql
-- Cole TODO o conteúdo de:
-- supabase/migrations/20260407000002_fix_infinite_recursion.sql
```

### 2. Desativar Modo Emergência

Edite [`src/lib/supabase/config.ts`](src/lib/supabase/config.ts):
```typescript
// Mude de true para false:
export const DISABLE_USUARIOS_TABLE = false
```

### 3. Reiniciar Servidor

```bash
# Ctrl+C no terminal
pnpm dev
```

### 4. Pronto!

Agora o sistema funciona completamente:
- ✅ Dados salvos na tabela usuarios
- ✅ Roles corretos (cliente, funcionario, admin)
- ✅ Permissões funcionando
- ✅ Admin panel habilitado

## 📊 Arquivos Modificados

| Arquivo | O Que Faz |
|---------|-----------|
| [`src/lib/supabase/config.ts`](src/lib/supabase/config.ts) | Flag `DISABLE_USUARIOS_TABLE` |
| [`src/features/auth/services/auth.service.ts`](src/features/auth/services/auth.service.ts) | Verifica flag e pula queries |
| [`src/features/auth/controllers/useAuth.ts`](src/features/auth/controllers/useAuth.ts) | Try-catch robusto |

## 🎓 Por Que Isso Funciona?

O problema era:
1. Políticas RLS com recursão infinita
2. SELECT na tabela `usuarios` trava
3. Timeout não resolvia porque `isLoading` ficava `true`
4. Botão carregando em loop

A solução:
1. **Pula completamente** as queries na tabela `usuarios`
2. Usa apenas dados do Supabase Auth
3. Sem recursão = sem erro
4. `isLoading` sempre reseta
5. Botão funciona normalmente

## 🚀 Próximos Passos

1. ✅ **Use o sistema em modo emergência** (AGORA)
2. ⏰ **Aguarde rate limit** se necessário (15-20 min)
3. 🔧 **Aplique o fix do banco** quando puder ([`supabase/FIX_URGENTE_RECURSAO.md`](supabase/FIX_URGENTE_RECURSAO.md))
4. 🔄 **Desative modo emergência** mudando flag para `false`
5. 🎉 **Sistema completo funcionando!**

## 💡 Dica

Você pode manter o modo emergência ativo por quanto tempo quiser. Quando estiver pronto para habilitar funcionalidades avançadas (roles, admin panel), aplique o fix do banco e desative.

---

**Status Atual**: 🟢 MODO EMERGÊNCIA ATIVO - Sistema funcional com limitações
