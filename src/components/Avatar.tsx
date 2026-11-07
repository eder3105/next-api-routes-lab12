import { colorFor, initials } from '@/lib/ui'

// Avatar con iniciales del autor y un color fijo según su nombre
export default function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'xl' }) {
  const sizes = {
    sm: 'size-9 text-xs',
    md: 'size-11 text-sm',
    xl: 'size-24 text-3xl',
  }
  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full font-serif font-semibold text-white ring-2 ring-white`}
      style={{ backgroundColor: colorFor(name) }}
      aria-hidden
    >
      {initials(name)}
    </div>
  )
}
