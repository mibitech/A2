/**
 * Envolve uma Promise (tipicamente de query Supabase) com timeout.
 *
 * Por quê: conexões HTTP/2 idle podem ser dropadas silenciosamente por
 * firewall/NAT depois de minutos de inatividade. O navegador não detecta
 * imediatamente e a query fica "presa". Com timeout explícito, o retry
 * automático dos hooks pode disparar.
 */
export async function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number = 10_000,
  mensagem: string = 'Tempo limite excedido. Verifique sua conexão.'
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(mensagem)), ms)
  })

  try {
    return (await Promise.race([promise, timeout])) as T
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}
