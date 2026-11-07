'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  BookPlus,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Pencil,
  Search,
  SearchX,
  Trash2,
  X,
} from 'lucide-react'
import BookCover from '@/components/BookCover'
import BookForm, { type BookFormValues } from '@/components/BookForm'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { bookPayload, sendJson } from '@/lib/api'
import { buttonGhost, buttonPrimary, colorFor, inputClass } from '@/lib/ui'
import type { Author, Book, Pagination } from '@/lib/types'

const SORT_LABELS: Record<string, string> = {
  createdAt: 'Fecha de registro',
  title: 'Título',
  publishedYear: 'Año de publicación',
}

// Números de página con "..." cuando hay muchas: 1 … 4 5 6 … 10
function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p)
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}

export default function BooksPage() {
  const toast = useToast()

  // Datos para los selectores
  const [authors, setAuthors] = useState<Author[]>([])
  const genres = [...new Set(authors.flatMap((a) => a.books.map((b) => b.genre)).filter((g): g is string => !!g))].sort()

  // Filtros
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  // Resultados
  const [books, setBooks] = useState<Book[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loadedQuery, setLoadedQuery] = useState('')

  // Modales
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState<Book | null>(null)

  // "refresh" cambia después de crear/editar/eliminar para recargar
  const [refresh, setRefresh] = useState(0)
  const reloadAll = () => setRefresh((n) => n + 1)

  // Autores y géneros para los dropdowns
  useEffect(() => {
    fetch('/api/authors')
      .then((r) => r.json())
      .then((data) => setAuthors(Array.isArray(data) ? data : []))
  }, [refresh])

  // Búsqueda en tiempo real: espera 350 ms después de dejar de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  // URL para GET /api/books/search
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy, order })
  if (debouncedSearch) params.set('search', debouncedSearch)
  if (genre) params.set('genre', genre)
  if (authorName) params.set('authorName', authorName)
  const query = `${params.toString()}#${refresh}`

  useEffect(() => {
    const [qs] = query.split('#')
    fetch(`/api/books/search?${qs}`)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.data ?? [])
        setPagination(data.pagination ?? null)
        setLoadedQuery(query)
      })
  }, [query])

  // Está cargando mientras la búsqueda terminada no coincide con los filtros actuales
  const loading = loadedQuery !== query || search !== debouncedSearch

  // Cambiar un filtro siempre vuelve a la página 1
  const withReset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setPage(1)
  }

  const activeFilters = [
    debouncedSearch && { label: `Título: “${debouncedSearch}”`, clear: () => setSearch('') },
    genre && { label: `Género: ${genre}`, clear: () => withReset(setGenre)('') },
    authorName && { label: `Autor: ${authorName}`, clear: () => withReset(setAuthorName)('') },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  const clearAll = () => {
    setSearch('')
    setGenre('')
    setAuthorName('')
    setPage(1)
  }

  // ---------- Acciones ----------
  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleSave = async (values: BookFormValues) => {
    const { ok, error } = editing
      ? await sendJson(`/api/books/${editing.id}`, 'PUT', bookPayload(values))
      : await sendJson('/api/books', 'POST', bookPayload(values))
    if (!ok) {
      toast('error', error)
      return false
    }
    toast('ok', editing ? `Se guardaron los cambios de “${values.title}”` : `“${values.title}” se agregó al catálogo`)
    setFormOpen(false)
    reloadAll()
    return true
  }

  const handleDelete = async () => {
    if (!deleting) return
    const { ok, error } = await sendJson(`/api/books/${deleting.id}`, 'DELETE')
    toast(ok ? 'ok' : 'error', ok ? `“${deleting.title}” se eliminó del catálogo` : error)
    reloadAll()
  }

  const from = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">Catálogo de libros</h1>
          <p className="mt-2 max-w-xl text-muted">Busca por título, filtra por género o autor y ordena los resultados.</p>
        </div>
        <button onClick={openCreate} className={buttonPrimary} disabled={authors.length === 0}>
          <BookPlus className="size-4" />
          Nuevo libro
        </button>
      </header>

      {/* Barra de búsqueda y filtros */}
      <section className="space-y-4 rounded-2xl border border-line bg-white p-4 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
          <input
            className="w-full rounded-xl border border-line bg-paper py-3.5 pr-11 pl-12 text-base placeholder:text-muted/70 focus:border-brass focus:bg-white focus:outline-none focus:ring-2 focus:ring-brass/20"
            placeholder="Buscar libros por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar por título"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted hover:bg-line/60"
              aria-label="Borrar búsqueda"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_1fr_1fr_auto_auto]">
          <select className={inputClass} value={genre} onChange={(e) => withReset(setGenre)(e.target.value)} aria-label="Filtrar por género">
            <option value="">Todos los géneros</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select className={inputClass} value={authorName} onChange={(e) => withReset(setAuthorName)(e.target.value)} aria-label="Filtrar por autor">
            <option value="">Todos los autores</option>
            {authors.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
          <select className={inputClass} value={sortBy} onChange={(e) => withReset(setSortBy)(e.target.value)} aria-label="Ordenar por">
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                Ordenar: {label}
              </option>
            ))}
          </select>
          <button
            onClick={() => withReset(setOrder)(order === 'asc' ? 'desc' : 'asc')}
            className={buttonGhost}
            title="Cambiar orden"
          >
            {order === 'asc' ? <ArrowUpNarrowWide className="size-4" /> : <ArrowDownWideNarrow className="size-4" />}
            {order === 'asc' ? 'Ascendente' : 'Descendente'}
          </button>
          <div className="col-span-2 flex rounded-lg border border-line p-1 md:col-span-1" role="group" aria-label="Tipo de vista">
            {[
              { v: 'grid' as const, icon: LayoutGrid, label: 'Portadas' },
              { v: 'list' as const, icon: List, label: 'Lista' },
            ].map(({ v, icon: Icon, label }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${
                  view === v ? 'bg-ink text-white' : 'text-muted hover:text-text'
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
            {activeFilters.map((f) => (
              <span key={f.label} className="inline-flex items-center gap-1 rounded-full bg-brass-soft py-1 pr-1.5 pl-3 text-sm text-ink">
                {f.label}
                <button onClick={f.clear} className="rounded-full p-0.5 hover:bg-brass/20" aria-label={`Quitar filtro ${f.label}`}>
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
            <button onClick={clearAll} className="text-sm font-medium text-oxblood hover:underline">
              Limpiar filtros
            </button>
          </div>
        )}
      </section>

      {/* Total de resultados */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <p className="text-sm text-muted" aria-live="polite">
          {loading ? (
            'Buscando libros...'
          ) : (
            <>
              <span className="font-serif text-lg font-semibold text-ink">{pagination?.total ?? 0}</span>{' '}
              {pagination?.total === 1 ? 'libro encontrado' : 'libros encontrados'}
              {pagination && pagination.total > 0 && `, mostrando del ${from} al ${to}`}
            </>
          )}
        </p>
        <label className="flex items-center gap-2 text-sm text-muted">
          Por página
          <select
            className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
            value={limit}
            onChange={(e) => withReset(setLimit)(Number(e.target.value))}
          >
            {[6, 12, 24, 48].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Resultados */}
      {loading && books.length === 0 ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: limit > 12 ? 12 : limit }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] animate-pulse rounded-md bg-line/70" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-line/70" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <SearchX className="size-10 text-brass" />
          <p className="font-serif text-lg text-ink">No encontramos libros con esos filtros</p>
          <p className="max-w-sm text-sm text-muted">Prueba con otro título o quita algún filtro para ver más resultados.</p>
          {activeFilters.length > 0 && (
            <button onClick={clearAll} className={`${buttonGhost} mt-2`}>
              Limpiar filtros
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className={`grid grid-cols-2 gap-x-5 gap-y-8 transition-opacity sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 ${loading ? 'opacity-50' : ''}`}>
          {books.map((book) => (
            <article key={book.id} className="group flex flex-col">
              <BookCover title={book.title} author={book.author?.name} genre={book.genre} />
              <div className="mt-3 flex-1">
                <h3 className="line-clamp-2 font-serif font-semibold leading-snug text-text">{book.title}</h3>
                <Link href={`/authors/${book.authorId}`} className="text-sm text-ink-soft hover:underline">
                  {book.author?.name}
                </Link>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  {book.genre && (
                    <span className="rounded-full px-2 py-0.5 text-white" style={{ backgroundColor: colorFor(book.genre) }}>
                      {book.genre}
                    </span>
                  )}
                  {book.publishedYear && <span className="rounded-full bg-line/60 px-2 py-0.5">{book.publishedYear}</span>}
                  {book.pages && <span className="rounded-full bg-line/60 px-2 py-0.5">{book.pages} págs.</span>}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setEditing(book)
                    setFormOpen(true)
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line py-1.5 text-sm hover:border-brass hover:text-brass"
                >
                  <Pencil className="size-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => setDeleting(book)}
                  className="rounded-lg border border-line px-2.5 text-muted hover:border-oxblood hover:text-oxblood"
                  aria-label={`Eliminar ${book.title}`}
                  title="Eliminar"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-2xl border border-line bg-white transition-opacity ${loading ? 'opacity-50' : ''}`}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-paper/60 text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Título</th>
                <th className="px-5 py-3 font-medium">Autor</th>
                <th className="px-5 py-3 font-medium">Género</th>
                <th className="px-5 py-3 font-medium">Año</th>
                <th className="px-5 py-3 font-medium">Páginas</th>
                <th className="px-5 py-3 font-medium">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-paper/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-1.5 rounded-full" style={{ backgroundColor: colorFor(book.genre) }} />
                      <span className="font-serif font-semibold">{book.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/authors/${book.authorId}`} className="text-ink-soft hover:underline">
                      {book.author?.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{book.genre ?? '—'}</td>
                  <td className="px-5 py-3">{book.publishedYear ?? '—'}</td>
                  <td className="px-5 py-3">{book.pages ?? '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(book)
                          setFormOpen(true)
                        }}
                        className="rounded-lg border border-line p-2 text-muted hover:border-brass hover:text-brass"
                        aria-label={`Editar ${book.title}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(book)}
                        className="rounded-lg border border-line p-2 text-muted hover:border-oxblood hover:text-oxblood"
                        aria-label={`Eliminar ${book.title}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Paginación">
          <button
            disabled={!pagination.hasPrev}
            onClick={() => setPage(page - 1)}
            className={`${buttonGhost} disabled:pointer-events-none disabled:opacity-40`}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </button>
          {pageNumbers(pagination.page, pagination.totalPages).map((n, i) =>
            n === '…' ? (
              <span key={`dots-${i}`} className="px-2 text-muted">
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => setPage(n)}
                aria-current={n === pagination.page ? 'page' : undefined}
                className={`size-10 rounded-lg text-sm font-semibold ${
                  n === pagination.page ? 'bg-ink text-white' : 'border border-line bg-white hover:border-ink/30'
                }`}
              >
                {n}
              </button>
            )
          )}
          <button
            disabled={!pagination.hasNext}
            onClick={() => setPage(page + 1)}
            className={`${buttonGhost} disabled:pointer-events-none disabled:opacity-40`}
          >
            Siguiente
            <ChevronRight className="size-4" />
          </button>
        </nav>
      )}

      {/* Modal crear / editar */}
      <Modal
        open={formOpen}
        size="lg"
        title={editing ? 'Editar libro' : 'Nuevo libro'}
        description={editing ? 'Actualiza los datos del libro.' : 'Elige el autor y completa los datos del libro.'}
        onClose={() => setFormOpen(false)}
      >
        <BookForm
          key={editing?.id ?? 'new'}
          initial={editing}
          authors={authors}
          genres={genres}
          submitText={editing ? 'Guardar cambios' : 'Agregar libro'}
          onSubmit={handleSave}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar libro"
        message={`“${deleting?.title}” se eliminará del catálogo. Esta acción no se puede deshacer.`}
        confirmText="Eliminar libro"
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
