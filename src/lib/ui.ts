// Utilidades visuales

// Tonos de "tapa de libro" para portadas, lomos y avatares
const TONES = ['#1d4a40', '#8e2f3a', '#2f4a7a', '#9a6f1f', '#5b3f6b', '#3e6b5e', '#7a4a2a', '#334155']

// Colores fijos para los géneros más comunes (sin tildes y en minúsculas)
const GENRE_COLORS: Record<string, string> = {
  novela: '#1d4a40',
  cuento: '#8e2f3a',
  periodismo: '#2f4a7a',
  cronica: '#2f4a7a',
  memorias: '#9a6f1f',
  biografia: '#9a6f1f',
  poesia: '#5b3f6b',
  ensayo: '#334155',
  teatro: '#3e6b5e',
  fantasia: '#7a4a2a',
}

const normalize = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

// Mismo texto => mismo color (así cada género o autor siempre tiene su color)
export function colorFor(text: string | null | undefined) {
  const value = text || 'Sin género'
  const known = GENRE_COLORS[normalize(value)]
  if (known) return known
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  return TONES[hash % TONES.length]
}

// "Gabriel García Márquez" => "GG"
export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

// Clases reutilizables
export const inputClass =
  'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-text placeholder:text-muted/70 focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20'

export const buttonPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-soft disabled:opacity-50'

export const buttonGhost =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-text transition-colors hover:border-ink/30 hover:bg-paper'
