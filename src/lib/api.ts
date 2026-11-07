import type { AuthorFormValues } from '@/components/AuthorForm'
import type { BookFormValues } from '@/components/BookForm'

// Envía JSON a una API Route y devuelve { ok, data } sin romperse si la respuesta viene vacía
export async function sendJson(url: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown) {
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, data, error: data.error ?? `Error ${res.status}` }
  } catch {
    return { ok: false, data: {}, error: 'No se pudo conectar con el servidor' }
  }
}

// Convierte los valores del formulario al formato que esperan las API Routes
export const authorPayload = (v: AuthorFormValues) => ({
  ...v,
  birthYear: v.birthYear ? Number(v.birthYear) : null,
})

export const bookPayload = (v: BookFormValues) => ({
  ...v,
  isbn: v.isbn || null,
  genre: v.genre || null,
  pages: v.pages ? Number(v.pages) : null,
  publishedYear: v.publishedYear ? Number(v.publishedYear) : null,
})
