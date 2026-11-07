'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookPlus, Cake, Globe, Mail, Pencil, Trash2 } from 'lucide-react'
import Avatar from '@/components/Avatar'
import BookCover from '@/components/BookCover'
import Bookshelf from '@/components/Bookshelf'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import AuthorForm, { type AuthorFormValues } from '@/components/AuthorForm'
import BookForm, { type BookFormValues } from '@/components/BookForm'
import { useToast } from '@/components/Toast'
import { authorPayload, bookPayload, sendJson } from '@/lib/api'
import { buttonGhost, buttonPrimary, colorFor } from '@/lib/ui'
import type { Author, AuthorStats, Book } from '@/lib/types'

export default function AuthorDetail() {
  const { id } = useParams<{ id: string }>()
  const toast = useToast()

  const [author, setAuthor] = useState<Author | null>(null)
  const [stats, setStats] = useState<AuthorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Modales
  const [editOpen, setEditOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [deletingBook, setDeletingBook] = useState<Book | null>(null)

  // Cada vez que "reload" cambia se vuelven a pedir el autor y sus estadísticas
  const [reload, setReload] = useState(0)
  const refresh = () => setReload((n) => n + 1)

  useEffect(() => {
    Promise.all([fetch(`/api/authors/${id}`), fetch(`/api/authors/${id}/stats`)]).then(async ([authorRes, statsRes]) => {
      if (!authorRes.ok) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setAuthor(await authorRes.json())
      setStats(await statsRes.json())
      setLoading(false)
    })
  }, [id, reload])

  // ---------- Acciones ----------
  const handleUpdateAuthor = async (values: AuthorFormValues) => {
    const { ok, error } = await sendJson(`/api/authors/${id}`, 'PUT', authorPayload(values))
    if (!ok) {
      toast('error', error)
      return false
    }
    toast('ok', 'Se guardaron los cambios del autor')
    setEditOpen(false)
    refresh()
    return true
  }

  const handleSaveBook = async (values: BookFormValues) => {
    const { ok, error } = editingBook
      ? await sendJson(`/api/books/${editingBook.id}`, 'PUT', bookPayload(values))
      : await sendJson('/api/books', 'POST', bookPayload({ ...values, authorId: id }))
    if (!ok) {
      toast('error', error)
      return false
    }
    toast('ok', editingBook ? `Se guardaron los cambios de “${values.title}”` : `“${values.title}” se agregó a sus libros`)
    setBookOpen(false)
    refresh()
    return true
  }

  const handleDeleteBook = async () => {
    if (!deletingBook) return
    const { ok, error } = await sendJson(`/api/books/${deletingBook.id}`, 'DELETE')
    toast(ok ? 'ok' : 'error', ok ? `“${deletingBook.title}” se eliminó` : error)
    refresh()
  }

  // ---------- Estados de carga ----------
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-56 animate-pulse rounded-2xl bg-line/60" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-line/60" />
          ))}
        </div>
      </div>
    )
  }

  if (notFound || !author) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="font-serif text-2xl text-ink">Este autor no existe</p>
        <p className="text-muted">Puede que se haya eliminado. Vuelve al panel para ver la lista de autores.</p>
        <Link href="/" className={`${buttonPrimary} mt-2`}>
          <ArrowLeft className="size-4" />
          Volver al panel
        </Link>
      </div>
    )
  }

  // Libros en orden cronológico (de más antiguo a más reciente)
  const chronological = [...author.books].sort((a, b) => (a.publishedYear ?? 9999) - (b.publishedYear ?? 9999))
  const genres = [...new Set(author.books.map((b) => b.genre).filter((g): g is string => !!g))]

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" />
        Volver al panel
      </Link>

      {/* Perfil del autor */}
      <section className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="h-24 bg-ink sm:h-28" style={{ backgroundImage: `linear-gradient(120deg, #13322b 55%, ${colorFor(author.name)})` }} />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <Avatar name={author.name} size="xl" />
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setEditOpen(true)} className={buttonGhost}>
                <Pencil className="size-4" />
                Editar autor
              </button>
              <button
                onClick={() => {
                  setEditingBook(null)
                  setBookOpen(true)
                }}
                className={buttonPrimary}
              >
                <BookPlus className="size-4" />
                Agregar libro
              </button>
            </div>
          </div>

          <h1 className="mt-4 font-serif text-3xl font-semibold text-ink sm:text-4xl">{author.name}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Globe className="size-4" />
              {author.nationality || 'Nacionalidad sin registrar'}
            </span>
            {author.birthYear && (
              <span className="inline-flex items-center gap-1.5">
                <Cake className="size-4" />
                Nació en {author.birthYear}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-4" />
              {author.email}
            </span>
          </div>
          {author.bio && <p className="mt-4 max-w-2xl font-serif text-lg leading-relaxed text-text/90">{author.bio}</p>}
        </div>
      </section>

      {/* Estadísticas del autor (GET /api/authors/[id]/stats) */}
      {stats && (
        <section className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <div className="flex flex-row gap-4 lg:flex-col">
            <div className="flex-1 rounded-2xl bg-ink p-6 text-white">
              <p className="font-serif text-5xl font-semibold">{stats.totalBooks}</p>
              <p className="mt-1 text-sm text-white/70">{stats.totalBooks === 1 ? 'libro publicado' : 'libros publicados'}</p>
            </div>
            <div className="flex-1 rounded-2xl border border-line bg-white p-6">
              <p className="font-serif text-5xl font-semibold text-ink">{stats.averagePages}</p>
              <p className="mt-1 text-sm text-muted">páginas en promedio</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6">
            <h2 className="font-serif text-xl font-semibold text-ink">Estadísticas</h2>
            <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
              {[
                { label: 'Primer libro', value: stats.firstBook && `${stats.firstBook.title}`, extra: stats.firstBook?.year },
                { label: 'Último libro', value: stats.latestBook && `${stats.latestBook.title}`, extra: stats.latestBook?.year },
                { label: 'Libro con más páginas', value: stats.longestBook?.title, extra: stats.longestBook && `${stats.longestBook.pages} págs.` },
                { label: 'Libro con menos páginas', value: stats.shortestBook?.title, extra: stats.shortestBook && `${stats.shortestBook.pages} págs.` },
              ].map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <dt className="text-sm text-muted">{row.label}</dt>
                  <dd className="text-right">
                    <span className="font-serif font-semibold">{row.value || '—'}</span>
                    {row.extra && <span className="ml-2 text-sm text-brass">{row.extra}</span>}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">Géneros que ha escrito:</span>
              {stats.genres.length === 0 && <span className="text-sm">—</span>}
              {stats.genres.map((g) => (
                <span key={g} className="rounded-full px-3 py-1 text-sm text-white" style={{ backgroundColor: colorFor(g) }}>
                  {g}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Estante del autor */}
      <section className="rounded-2xl border border-line bg-white p-5 sm:p-7">
        <h2 className="font-serif text-xl font-semibold text-ink">Su estante</h2>
        <p className="mb-2 text-sm text-muted">Ordenado por año de publicación.</p>
        <Bookshelf
          books={chronological.map((b) => ({ ...b, authorId: author.id, authorName: author.name }))}
          emptyText="Este autor todavía no tiene libros. Usa “Agregar libro” para registrar el primero."
        />
      </section>

      {/* Lista de libros (línea de tiempo) */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold text-ink">Obras</h2>
          <span className="text-sm text-muted">
            {author.books.length} {author.books.length === 1 ? 'libro' : 'libros'}
            {genres.length > 0 && ` en ${genres.length} ${genres.length === 1 ? 'género' : 'géneros'}`}
          </span>
        </div>

        {chronological.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
            Aún no hay obras registradas.
          </div>
        ) : (
          <ol className="relative space-y-5 border-l-2 border-line pl-6 sm:ml-14 sm:pl-8">
            {chronological.map((book) => (
              <li key={book.id} className="relative">
                {/* Año en la línea de tiempo */}
                <span className="absolute top-3 -left-[33px] size-4 rounded-full border-4 border-paper bg-brass sm:-left-[41px]" />
                <span className="mb-1 block font-serif text-sm font-semibold text-brass sm:absolute sm:top-2 sm:-left-[104px] sm:w-14 sm:text-right">
                  {book.publishedYear ?? 's/f'}
                </span>
                <article className="flex gap-4 rounded-2xl border border-line bg-white p-4 sm:gap-5">
                  <BookCover title={book.title} genre={book.genre} className="w-20 shrink-0 p-2 sm:w-24 [&_p]:text-[11px]" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="font-serif text-lg font-semibold leading-snug">{book.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                      {book.genre && (
                        <span className="rounded-full px-2 py-0.5 text-white" style={{ backgroundColor: colorFor(book.genre) }}>
                          {book.genre}
                        </span>
                      )}
                      {book.pages && <span className="rounded-full bg-line/60 px-2 py-0.5">{book.pages} págs.</span>}
                      {book.isbn && <span className="rounded-full bg-line/60 px-2 py-0.5">ISBN {book.isbn}</span>}
                    </div>
                    {book.description && <p className="mt-2 line-clamp-2 text-sm text-muted">{book.description}</p>}
                    <div className="mt-auto flex gap-2 pt-3">
                      <button
                        onClick={() => {
                          setEditingBook(book)
                          setBookOpen(true)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm hover:border-brass hover:text-brass"
                      >
                        <Pencil className="size-3.5" />
                        Editar
                      </button>
                      <button
                        onClick={() => setDeletingBook(book)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:border-oxblood hover:text-oxblood"
                      >
                        <Trash2 className="size-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Modales */}
      <Modal open={editOpen} title="Editar autor" description="Actualiza la información del autor." onClose={() => setEditOpen(false)}>
        <AuthorForm key={author.id + reload} initial={author} submitText="Guardar cambios" onSubmit={handleUpdateAuthor} onCancel={() => setEditOpen(false)} />
      </Modal>

      <Modal
        open={bookOpen}
        size="lg"
        title={editingBook ? 'Editar libro' : `Agregar libro de ${author.name}`}
        description={editingBook ? 'Actualiza los datos del libro.' : 'El libro quedará asignado a este autor.'}
        onClose={() => setBookOpen(false)}
      >
        <BookForm
          key={editingBook?.id ?? 'new'}
          initial={editingBook}
          fixedAuthor={{ id: author.id, name: author.name }}
          genres={genres}
          submitText={editingBook ? 'Guardar cambios' : 'Agregar libro'}
          onSubmit={handleSaveBook}
          onCancel={() => setBookOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deletingBook}
        title="Eliminar libro"
        message={`“${deletingBook?.title}” se eliminará de las obras de ${author.name}. Esta acción no se puede deshacer.`}
        confirmText="Eliminar libro"
        onConfirm={handleDeleteBook}
        onClose={() => setDeletingBook(null)}
      />
    </div>
  )
}
