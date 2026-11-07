'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Feather, Layers, Pencil, Plus, Search, Ruler, Trash2, UserPlus, Users } from 'lucide-react'
import Avatar from '@/components/Avatar'
import Bookshelf from '@/components/Bookshelf'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import AuthorForm, { type AuthorFormValues } from '@/components/AuthorForm'
import { useToast } from '@/components/Toast'
import { authorPayload, sendJson } from '@/lib/api'
import { buttonPrimary, colorFor, inputClass } from '@/lib/ui'
import type { Author } from '@/lib/types'

export default function DashboardPage() {
  const toast = useToast()
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [today, setToday] = useState('')

  // Modales
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Author | null>(null)
  const [deleting, setDeleting] = useState<Author | null>(null)

  // Cada vez que "reload" cambia se vuelve a pedir GET /api/authors
  const [reload, setReload] = useState(0)
  const refresh = () => setReload((n) => n + 1)

  useEffect(() => {
    fetch('/api/authors')
      .then((res) => res.json())
      .then((data) => {
        setAuthors(Array.isArray(data) ? data : [])
        setLoading(false)
        // La fecha se calcula en el navegador al cargar los datos
        setToday(new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
      })
      .catch(() => setLoading(false))
  }, [reload])

  // ---------- Estadísticas generales ----------
  const stats = useMemo(() => {
    const books = authors.flatMap((a) => a.books.map((b) => ({ ...b, authorName: a.name })))
    const withPages = books.filter((b) => b.pages)
    const byGenre = new Map<string, number>()
    books.forEach((b) => byGenre.set(b.genre || 'Sin género', (byGenre.get(b.genre || 'Sin género') ?? 0) + 1))
    const genres = [...byGenre.entries()].sort((a, b) => b[1] - a[1])
    const shelf = [...books].sort((a, b) => (a.genre ?? '').localeCompare(b.genre ?? '') || (a.publishedYear ?? 0) - (b.publishedYear ?? 0))
    const ranking = [...authors].sort((a, b) => b.books.length - a.books.length).filter((a) => a.books.length > 0).slice(0, 5)
    return {
      totalBooks: books.length,
      totalGenres: genres.filter(([g]) => g !== 'Sin género').length,
      avgPages: withPages.length ? Math.round(withPages.reduce((s, b) => s + (b.pages ?? 0), 0) / withPages.length) : 0,
      genres,
      shelf,
      ranking,
    }
  }, [authors])

  const filtered = authors.filter((a) =>
    `${a.name} ${a.email} ${a.nationality ?? ''}`.toLowerCase().includes(query.toLowerCase())
  )

  // ---------- Acciones ----------
  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (author: Author) => {
    setEditing(author)
    setFormOpen(true)
  }

  const handleSave = async (values: AuthorFormValues) => {
    const { ok, error } = editing
      ? await sendJson(`/api/authors/${editing.id}`, 'PUT', authorPayload(values))
      : await sendJson('/api/authors', 'POST', authorPayload(values))
    if (!ok) {
      toast('error', error)
      return false
    }
    toast('ok', editing ? `Se guardaron los cambios de ${values.name}` : `${values.name} se agregó a la biblioteca`)
    setFormOpen(false)
    refresh()
    return true
  }

  const handleDelete = async () => {
    if (!deleting) return
    const { ok, error } = await sendJson(`/api/authors/${deleting.id}`, 'DELETE')
    toast(ok ? 'ok' : 'error', ok ? `${deleting.name} se eliminó junto con sus libros` : error)
    refresh()
  }

  const maxGenre = stats.genres[0]?.[1] ?? 1

  return (
    <div className="space-y-10">
      {/* Encabezado */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="h-5 text-sm text-muted first-letter:uppercase">{today}</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink sm:text-4xl">Panel de la biblioteca</h1>
          <p className="mt-2 max-w-xl text-muted">
            Administra a los autores, revisa la colección y entra al detalle de cada uno.
          </p>
        </div>
        <button onClick={openCreate} className={buttonPrimary}>
          <UserPlus className="size-4" />
          Nuevo autor
        </button>
      </header>

      {/* Estadísticas generales */}
      <section className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-white lg:grid-cols-4">
        {[
          { label: 'Autores registrados', value: authors.length, icon: Users },
          { label: 'Libros en la colección', value: stats.totalBooks, icon: BookOpen },
          { label: 'Géneros distintos', value: stats.totalGenres, icon: Layers },
          { label: 'Páginas en promedio', value: stats.avgPages, icon: Ruler },
        ].map(({ label, value, icon: Icon }, i) => (
          <div
            key={label}
            className={`flex items-center gap-4 p-5 sm:p-6 ${i % 2 === 1 ? 'border-l border-line' : ''} ${
              i >= 2 ? 'border-t border-line lg:border-t-0' : ''
            } ${i === 2 ? 'lg:border-l' : ''}`}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brass-soft text-brass">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-serif text-3xl font-semibold text-ink">{loading ? '–' : value}</p>
              <p className="text-sm text-muted">{label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Estante */}
      <section className="rounded-2xl border border-line bg-white p-5 sm:p-7">
        <div className="mb-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-ink">El estante</h2>
            <p className="text-sm text-muted">Cada lomo es un libro: el grosor indica sus páginas y el color su género.</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {stats.genres.map(([g]) => (
              <span key={g} className="flex items-center gap-1.5 text-xs text-muted">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: colorFor(g === 'Sin género' ? null : g) }} />
                {g}
              </span>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="h-52 animate-pulse rounded-xl bg-paper" />
        ) : (
          <Bookshelf books={stats.shelf} emptyText="El estante está vacío. Agrega un autor y luego sus libros." />
        )}
      </section>

      {/* Géneros y ranking */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-serif text-xl font-semibold text-ink">Libros por género</h2>
          <div className="mt-5 space-y-3">
            {stats.genres.length === 0 && <p className="text-sm text-muted">Aún no hay libros registrados.</p>}
            {stats.genres.map(([genre, count]) => (
              <div key={genre}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{genre}</span>
                  <span className="text-muted">{count} {count === 1 ? 'libro' : 'libros'}</span>
                </div>
                <div className="h-2.5 rounded-full bg-paper">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(count / maxGenre) * 100}%`, backgroundColor: colorFor(genre === 'Sin género' ? null : genre) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-serif text-xl font-semibold text-ink">Autores con más libros</h2>
          <ol className="mt-4 divide-y divide-line">
            {stats.ranking.length === 0 && <p className="text-sm text-muted">Cuando agregues libros, aquí verás el ranking.</p>}
            {stats.ranking.map((a, i) => (
              <li key={a.id}>
                <Link href={`/authors/${a.id}`} className="flex items-center gap-3 py-3 hover:text-ink-soft">
                  <span className={`w-5 font-serif text-lg font-semibold ${i === 0 ? 'text-brass' : 'text-muted'}`}>{i + 1}</span>
                  <Avatar name={a.name} size="sm" />
                  <span className="flex-1 font-medium">{a.name}</span>
                  <span className="text-sm text-muted">{a.books.length} {a.books.length === 1 ? 'libro' : 'libros'}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Lista de autores */}
      <section className="rounded-2xl border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink">Autores</h2>
            <p className="text-sm text-muted">{filtered.length} de {authors.length} autores</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Buscar por nombre, email o país"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-paper" />
            ))}
          </div>
        ) : authors.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <Feather className="size-10 text-brass" />
            <p className="font-serif text-lg text-ink">Todavía no hay autores</p>
            <p className="max-w-sm text-sm text-muted">Registra el primer autor para empezar a armar la colección.</p>
            <button onClick={openCreate} className={`${buttonPrimary} mt-2`}>
              <Plus className="size-4" />
              Agregar autor
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted">Ningún autor coincide con “{query}”.</p>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((author) => (
              <li key={author.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:px-6">
                <div className="flex flex-1 items-center gap-4">
                  <Avatar name={author.name} />
                  <div className="min-w-0">
                    <Link href={`/authors/${author.id}`} className="font-semibold text-text hover:text-ink-soft hover:underline">
                      {author.name}
                    </Link>
                    <p className="truncate text-sm text-muted">{author.email}</p>
                  </div>
                </div>
                <div className="flex gap-6 text-sm sm:w-64">
                  <div className="w-28">
                    <p className="text-muted">País</p>
                    <p className="font-medium">{author.nationality || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted">Libros</p>
                    <p className="font-medium">{author.books.length}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/authors/${author.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-ink-soft"
                  >
                    <BookOpen className="size-4" />
                    Ver libros
                  </Link>
                  <button
                    onClick={() => openEdit(author)}
                    className="rounded-lg border border-line p-2 text-muted hover:border-brass hover:text-brass"
                    aria-label={`Editar a ${author.name}`}
                    title="Editar"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(author)}
                    className="rounded-lg border border-line p-2 text-muted hover:border-oxblood hover:text-oxblood"
                    aria-label={`Eliminar a ${author.name}`}
                    title="Eliminar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modal crear / editar */}
      <Modal
        open={formOpen}
        title={editing ? 'Editar autor' : 'Nuevo autor'}
        description={editing ? 'Actualiza los datos del autor.' : 'Completa los datos para registrarlo en la biblioteca.'}
        onClose={() => setFormOpen(false)}
      >
        <AuthorForm
          key={editing?.id ?? 'new'}
          initial={editing}
          submitText={editing ? 'Guardar cambios' : 'Agregar autor'}
          onSubmit={handleSave}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar autor"
        message={`Se eliminará a ${deleting?.name} y sus ${deleting?.books.length ?? 0} libro(s). Esta acción no se puede deshacer.`}
        confirmText="Eliminar autor"
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
