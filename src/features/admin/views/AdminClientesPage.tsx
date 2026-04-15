export default function AdminClientesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-neutral-800">Clientes</h1>
      <p className="mt-1 text-sm text-neutral-500">Épico 9 — em desenvolvimento</p>

      <div className="mt-8 rounded-xl border-2 border-dashed border-neutral-200 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="mt-4 text-sm font-medium text-neutral-500">
          Módulo de CRM será implementado no Épico 9
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Perfis de clientes, histórico de pedidos, segmentação e campanhas de e-mail
        </p>
      </div>
    </div>
  )
}
