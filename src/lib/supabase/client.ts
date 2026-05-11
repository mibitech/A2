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

/**
 * Garante que a sessão seja revalidada quando a aba volta ao foco.
 *
 * Por quê: navegadores suspendem timers em abas em background. O auto-refresh
 * interno do Supabase pode falhar em disparar a tempo após inatividade longa,
 * resultando em queries que ficam "presas" tentando usar um token expirado.
 */
if (typeof window !== 'undefined') {
  let revalidando = false

  const revalidarSessao = async () => {
    if (revalidando) return
    if (document.visibilityState !== 'visible') return

    revalidando = true
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session) return

      // Renova proativamente se o token expira em menos de 60 segundos
      const expiraEm = (data.session.expires_at ?? 0) * 1000 - Date.now()
      if (expiraEm < 60_000) {
        await supabase.auth.refreshSession()
      }
    } catch (err) {
      console.warn('Falha ao revalidar sessão:', err)
    } finally {
      revalidando = false
    }
  }

  document.addEventListener('visibilitychange', revalidarSessao)
  window.addEventListener('focus', revalidarSessao)
  window.addEventListener('online', revalidarSessao)
}
