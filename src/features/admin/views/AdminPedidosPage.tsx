export default function AdminPedidosPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-neutral-800">Pedidos</h1>
      <p className="mt-1 text-sm text-neutral-500">Épico 10 — em desenvolvimento</p>

      <div className="mt-8 rounded-xl border-2 border-dashed border-neutral-200 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="mt-4 text-sm font-medium text-neutral-500">
          Módulo de pedidos será implementado no Épico 10
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Listagem, detalhes, atualização de status e conciliação financeira
        </p>
      </div>
    </div>
  )
}
