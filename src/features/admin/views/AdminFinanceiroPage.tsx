export default function AdminFinanceiroPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-neutral-800">Financeiro</h1>
      <p className="mt-1 text-sm text-neutral-500">Épico 10 — em desenvolvimento</p>

      <div className="mt-8 rounded-xl border-2 border-dashed border-neutral-200 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-4 text-sm font-medium text-neutral-500">
          Módulo financeiro será implementado no Épico 10
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Conciliação Stripe, fluxo de caixa e relatório semanal automático
        </p>
      </div>
    </div>
  )
}
