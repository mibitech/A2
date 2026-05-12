import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Supabase não configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env'
  )
}

// Cliente Supabase puro — sem overrides, sem workarounds.
// Se houver problema com sessão/socket, vamos diagnosticar em cima do default.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Stubs para compatibilidade com código que ainda chama essas funções.
// (não fazem nada — confiamos no comportamento padrão do Supabase JS)
export function marcarInteracao(): void {}
export async function garantirSessaoFresca(): Promise<void> {}
