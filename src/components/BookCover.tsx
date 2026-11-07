import { colorFor } from '@/lib/ui'

// Portada generada: color según el género, título en serif y nombre del autor
export default function BookCover({
  title,
  author,
  genre,
  className = '',
}: {
  title: string
  author?: string
  genre: string | null
  className?: string
}) {
  return (
    <div
      className={`relative flex aspect-[2/3] flex-col justify-between overflow-hidden rounded-r-md rounded-l-sm p-3 text-white shadow-[inset_6px_0_0_rgba(0,0,0,0.18),0_6px_14px_-6px_rgba(19,50,43,0.5)] ${className}`}
      style={{ backgroundColor: colorFor(genre) }}
    >
      {/* Marco dorado */}
      <div className="pointer-events-none absolute inset-2 rounded-sm border border-white/25" />
      <p className="relative line-clamp-4 font-serif text-[15px] font-semibold leading-snug">{title}</p>
      <div className="relative">
        <div className="mb-1.5 h-px w-8 bg-brass" />
        {author && <p className="line-clamp-2 text-[11px] text-white/80">{author}</p>}
      </div>
    </div>
  )
}
