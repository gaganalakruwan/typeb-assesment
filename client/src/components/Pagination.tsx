import { memo } from 'react'

interface PaginationProps {
  page: number // 1-based
  totalPages: number
  onChange: (page: number) => void
}

const pageList = (page: number, totalPages: number): (number | 'gap')[] => {
  const pages: (number | 'gap')[] = []
  for (let p = 1; p <= totalPages; p++) {
    const nearCurrent = Math.abs(p - page) <= 1
    if (p === 1 || p === totalPages || nearCurrent) pages.push(p)
    else if (pages.at(-1) !== 'gap') pages.push('gap')
  }
  return pages
}

const button =
  'flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40'

const Pagination = ({ page, totalPages, onChange }: PaginationProps) => {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={`${button} text-slate-600 hover:bg-slate-100`}
      >
        ‹ Prev
      </button>

      {pageList(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${button} ${
              p === page ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={`${button} text-slate-600 hover:bg-slate-100`}
      >
        Next ›
      </button>
    </nav>
  )
}

export default memo(Pagination)
