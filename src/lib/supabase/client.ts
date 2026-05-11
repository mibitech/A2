import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Aviso se as credenciais não estiverem configuradas
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Supabase não configurado. Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
  )
}

// Lock "passthrough" — evita deadlock do Navigator LockManager usado pelo Supabase v2.
// Em ambiente de aba única, não precisamos do lock cross-tab — apenas executa a função direto.
const passthroughLock = async <R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => fn()

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    lock: passthroughLock,
  },
})

// =====================================================================
// Anti-stale-connection: força refresh de sessão após inatividade longa.
//
// Por quê: após ~5 min sem requests, a conexão HTTP/2 com o Supabase pode
// ser silenciosamente fechada por proxies/CDN intermediários. O navegador
// tenta reutilizá-la e o próximo fetch fica em "Pending" indefinidamente —
// o AbortController nem sempre recupera a tempo nesse estado de socket.
//
// Solução: rastrear última interação e, antes de cada query crítica, chamar
// garantirSessaoFresca() — que força auth.refreshSession() se passou do
// limite, recriando a conexão de forma controlada.
// =====================================================================

const STALE_MS = 5 * 60 * 1000 // 5 min
let ultimaInteracao = Date.now()
let revalidacaoPromise: Promise<void> | null = null

/** Marca o instante de uma interação bem-sucedida com a API (reset do timer). */
export function marcarInteracao(): void {
  ultimaInteracao = Date.now()
}

/**
 * Garante que a sessão (e a conexão HTTP) estejam vivas antes de uma query.
 * Faz refresh do JWT se passou mais de 5 min desde a última interação OU
 * se o token está prestes a expirar (<60 s). Idempotente — chamadas simultâneas
 * compartilham a mesma promise.
 */
export async function garantirSessaoFresca(): Promise<void> {
  if (revalidacaoPromise) return revalidacaoPromise

  revalidacaoPromise = (async () => {
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session) return // sem sessão, nada a revalidar

      const inativoMs = Date.now() - ultimaInteracao
      const conexaoStale = inativoMs >= STALE_MS
      const expiraEm = (data.session.expires_at ?? 0) * 1000 - Date.now()
      const tokenExpirando = expiraEm < 60_000

      if (!conexaoStale && !tokenExpirando) return

      await supabase.auth.refreshSession()
      ultimaInteracao = Date.now()
    } catch (err) {
      console.warn('Falha ao revalidar sessão:', err)
    } finally {
      revalidacaoPromise = null
    }
  })()

  return revalidacaoPromise
}

if (typeof window !== 'undefined') {
  const revalidarAoVoltar = () => {
    if (document.visibilityState !== 'visible') return
    void garantirSessaoFresca()
  }

  document.addEventListener('visibilitychange', revalidarAoVoltar)
  window.addEventListener('focus', revalidarAoVoltar)
  window.addEventListener('online', revalidarAoVoltar)
}
