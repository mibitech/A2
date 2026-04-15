/**
 * Configuração do Supabase
 */

/**
 * EMERGÊNCIA: Desabilitar queries na tabela usuarios temporariamente
 * 
 * ATIVE ISSO (true) para fazer login/cadastro funcionar AGORA mesmo
 * com o erro de recursão infinita no banco.
 * 
 * Depois que aplicar o fix 20260407000002_fix_infinite_recursion.sql,
 * mude para false para voltar ao comportamento normal.
 */
export const DISABLE_USUARIOS_TABLE = false

/**
 * Quando DISABLE_USUARIOS_TABLE = true:
 * - Login/Cadastro funcionam MAS dados complementares não são salvos
 * - Você consegue entrar no sistema
 * - Role será sempre 'cliente'
 * - Dados vêm do Auth metadata
 * 
 * Quando DISABLE_USUARIOS_TABLE = false:
 * - Comportamento normal
 * - Dados salvos na tabela usuarios
 * - Roles corretos
 * - Requer fix de recursão aplicado no banco
 */
