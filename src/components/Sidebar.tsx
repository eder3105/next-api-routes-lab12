'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Library, BookOpen } from 'lucide-react'

const links = [
  { href: '/', label: 'Panel', icon: LayoutDashboard },
  { href: '/books', label: 'Catálogo de libros', icon: BookOpen },
]

// Navegación lateral (escritorio) y barra superior (celular)
export default function Sidebar() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/authors') : pathname.startsWith(href)

  return (
    <>
      {/* Escritorio */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink text-white lg:flex">
        <Link href="/" className="flex items-center gap-3 px-6 pt-8 pb-10">
          <span className="flex size-10 items-center justify-center rounded-lg bg-brass text-ink">
            <Library className="size-5" />
          </span>
          <span>
            <span className="block font-serif text-xl font-semibold leading-tight">Biblioteca</span>
            <span className="text-xs text-white/60">Sistema de gestión</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1 px-3">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(href) ? 'bg-white/12 text-white' : 'text-white/65 hover:bg-white/6 hover:text-white'
              }`}
            >
              <Icon className={`size-[18px] ${isActive(href) ? 'text-brass' : ''}`} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 px-6 py-5 text-xs leading-relaxed text-white/50">
          Laboratorio 12: API Routes con Next.js, Prisma y PostgreSQL
        </div>
      </aside>

      {/* Celular / tablet */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-ink px-4 py-3 text-white lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-brass text-ink">
            <Library className="size-4" />
          </span>
          <span className="font-serif text-lg font-semibold">Biblioteca</span>
        </Link>
        <nav className="flex gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${
                isActive(href) ? 'bg-white/15 text-white' : 'text-white/70'
              }`}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </header>
    </>
  )
}
