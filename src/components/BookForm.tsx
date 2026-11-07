'use client'

import { useState } from 'react'
import { buttonGhost, buttonPrimary, inputClass } from '@/lib/ui'
import type { Book } from '@/lib/types'
import BookCover from './BookCover'

export type BookFormValues = {
  title: string
  authorId: string
  genre: string
  publishedYear: string
  pages: string
  isbn: string
  description: string
}

// Formulario de libro (crear y editar). Si se pasa "fixedAuthor" no se muestra el selector de autor.
export default function BookForm({
  initial,
  authors,
  fixedAuthor,
  genres,
  submitText,
  onSubmit,
  onCancel,
}: {
  initial?: Book | null
  authors?: { id: string; name: string }[]
  fixedAuthor?: { id: string; name: string }
  genres: string[]
  submitText: string
  onSubmit: (values: BookFormValues) => Promise<boolean>
  onCancel: () => void
}) {
  const [values, setValues] = useState<BookFormValues>({
    title: initial?.title ?? '',
    authorId: fixedAuthor?.id ?? initial?.authorId ?? '',
    genre: initial?.genre ?? '',
    publishedYear: initial?.publishedYear?.toString() ?? '',
    pages: initial?.pages?.toString() ?? '',
    isbn: initial?.isbn ?? '',
    description: initial?.description ?? '',
  })
  const [busy, setBusy] = useState(false)

  const set = (field: keyof BookFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues({ ...values, [field]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    await onSubmit(values)
    setBusy(false)
  }

  const authorName = fixedAuthor?.name ?? authors?.find((a) => a.id === values.authorId)?.name

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-[1fr_150px]">
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Título *</span>
          <input className={inputClass} value={values.title} onChange={set('title')} required minLength={3} placeholder="Ej. Cien años de soledad" />
        </label>

        {fixedAuthor ? (
          <p className="text-sm text-muted">
            Autor: <span className="font-semibold text-text">{fixedAuthor.name}</span>
          </p>
        ) : (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Autor *</span>
            <select className={inputClass} value={values.authorId} onChange={set('authorId')} required>
              <option value="">Selecciona un autor</option>
              {authors?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <label className="col-span-2 block sm:col-span-1">
            <span className="mb-1.5 block text-sm font-medium">Género</span>
            <input className={inputClass} list="genres-list" value={values.genre} onChange={set('genre')} placeholder="Novela" />
            <datalist id="genres-list">
              {genres.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Año</span>
            <input className={inputClass} type="number" value={values.publishedYear} onChange={set('publishedYear')} placeholder="1967" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Páginas</span>
            <input className={inputClass} type="number" min={1} value={values.pages} onChange={set('pages')} placeholder="417" />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">ISBN</span>
          <input className={inputClass} value={values.isbn} onChange={set('isbn')} placeholder="978-0307474728" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Descripción</span>
          <textarea className={inputClass} rows={2} value={values.description} onChange={set('description')} placeholder="De qué trata el libro" />
        </label>
      </div>

      {/* Vista previa de la portada mientras se escribe */}
      <div className="hidden sm:block">
        <span className="mb-1.5 block text-sm font-medium">Vista previa</span>
        <BookCover title={values.title || 'Título del libro'} author={authorName} genre={values.genre || null} />
      </div>

      <div className="flex justify-end gap-2 sm:col-span-2">
        <button type="button" onClick={onCancel} className={buttonGhost}>
          Cancelar
        </button>
        <button disabled={busy} className={buttonPrimary}>
          {busy ? 'Guardando...' : submitText}
        </button>
      </div>
    </form>
  )
}
