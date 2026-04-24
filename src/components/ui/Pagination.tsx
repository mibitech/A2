const PAGE_SIZES = [10, 20, 50, 100]

interface PaginationProps {
  total: number
  page: number
  pageSize: number
  onPage: (p: number) => void
  onPageSize: (s: number) => void
}

export default function Pagination({ total, page, pageSize, onPage, onPageSize }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (total === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <span>{from}–{to} de {total}</span>
        <span className="text-neutral-300">|</span>
        <label className="flex items-center gap-1.5">
          Exibir
          <select
            value={pageSize}
            onChange={e => { onPageSize(Number(e.target.value)); onPage(1) }}
            className="rounded border border-neutral-300 px-1.5 py-0.5 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {PAGE_SIZES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          por página
        </label>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage(1)}
            disabled={page === 1}
            className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
            aria-label="Primeira página"
          >
            «
          </button>
          <button
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
            aria-label="Página anterior"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | '...')[]>((acc, p, i, arr) => {
              if (i > 0 && typeof arr[i - 1] === 'number' && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-1 text-xs text-neutral-300">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPage(p as number)}
                  className={`min-w-[28px] rounded px-2 py-1 text-xs font-medium transition-colors ${
                    page === p
                      ? 'bg-brand text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {p}
                </button>
              )
            )}

          <button
            onClick={() => onPage(page + 1)}
            disabled={page === totalPages}
            className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
            aria-label="Próxima página"
          >
            ›
          </button>
          <button
            onClick={() => onPage(totalPages)}
            disabled={page === totalPages}
            className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
            aria-label="Última página"
          >
            »
          </button>
        </div>
      )}
    </div>
  )
}
