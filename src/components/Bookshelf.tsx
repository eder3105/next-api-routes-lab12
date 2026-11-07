import Link from 'next/link'
import { colorFor } from '@/lib/ui'

type ShelfBook = {
  id: string
  title: string
  genre: string | null
  pages: number | null
  publishedYear: number | null
  authorId: string
  authorName?: string
}

// Estante: cada libro es un lomo. El grosor depende de sus páginas y el color de su género.
export default function Bookshelf({ books, emptyText }: { books: ShelfBook[]; emptyText: string }) {
  if (books.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-line text-sm text-muted">
        {emptyText}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-end gap-[3px] overflow-x-auto px-2 pt-4 pb-0">
        {books.map((b, i) => {
          const width = Math.min(58, 22 + Math.round((b.pages ?? 200) / 18))
          const height = 150 + ((b.title.length * 7 + i * 13) % 60)
          return (
            <Link
              key={b.id}
              href={`/authors/${b.authorId}`}
              title={`${b.title}${b.authorName ? ` — ${b.authorName}` : ''}${b.pages ? ` (${b.pages} págs.)` : ''}`}
              className="group relative flex shrink-0 items-center justify-center rounded-t-[3px] text-white transition-transform hover:-translate-y-2 focus-visible:-translate-y-2"
              style={{ width, height, backgroundColor: colorFor(b.genre) }}
            >
              {/* Bandas doradas del lomo */}
              <span className="absolute inset-x-0 top-3 h-[3px] bg-brass/70" />
              <span className="absolute inset-x-0 bottom-3 h-[3px] bg-brass/70" />
              <span
                className="max-h-[75%] overflow-hidden px-1 font-serif text-[11px] font-semibold whitespace-nowrap text-ellipsis"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {b.title}
              </span>
            </Link>
          )
        })}
      </div>
      {/* Tabla del estante */}
      <div className="h-3 rounded-sm bg-ink shadow-[0_6px_10px_-4px_rgba(19,50,43,0.6)]" />
    </div>
  )
}
