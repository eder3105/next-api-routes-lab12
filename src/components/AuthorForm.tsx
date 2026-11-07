'use client'

import { useState } from 'react'
import { buttonGhost, buttonPrimary, inputClass } from '@/lib/ui'
import type { Author } from '@/lib/types'

export type AuthorFormValues = {
  name: string
  email: string
  nationality: string
  birthYear: string
  bio: string
}

// Formulario de autor (sirve para crear y para editar)
export default function AuthorForm({
  initial,
  submitText,
  onSubmit,
  onCancel,
}: {
  initial?: Author | null
  submitText: string
  onSubmit: (values: AuthorFormValues) => Promise<boolean>
  onCancel: () => void
}) {
  const [values, setValues] = useState<AuthorFormValues>({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    nationality: initial?.nationality ?? '',
    birthYear: initial?.birthYear?.toString() ?? '',
    bio: initial?.bio ?? '',
  })
  const [busy, setBusy] = useState(false)

  const set = (field: keyof AuthorFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues({ ...values, [field]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    await onSubmit(values)
    setBusy(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Nombre completo *</span>
        <input className={inputClass} value={values.name} onChange={set('name')} required placeholder="Ej. Gabriel García Márquez" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Email *</span>
        <input className={inputClass} type="email" value={values.email} onChange={set('email')} required placeholder="autor@correo.com" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Nacionalidad</span>
          <input className={inputClass} value={values.nationality} onChange={set('nationality')} placeholder="Ej. Perú" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Año de nacimiento</span>
          <input className={inputClass} type="number" value={values.birthYear} onChange={set('birthYear')} placeholder="Ej. 1936" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Biografía</span>
        <textarea className={inputClass} rows={3} value={values.bio} onChange={set('bio')} placeholder="Una breve reseña del autor" />
      </label>
      <div className="flex justify-end gap-2 pt-2">
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
