import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Manrope, Source_Serif_4 } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import { ToastProvider } from '@/components/Toast'
import './globals.css'

// Fuentes: serif para títulos (estilo libro) y sans para la interfaz
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif' })
const sans = Manrope({ subsets: ['latin'], variable: '--font-manrope' })

export const metadata: Metadata = {
  title: 'Biblioteca | Lab 12',
  description: 'Sistema de biblioteca con API Routes, Prisma y PostgreSQL',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable} antialiased`}>
      <body className="min-h-screen">
        <ToastProvider>
          <div className="flex min-h-screen flex-col lg:flex-row">
            <Suspense>
              <Sidebar />
            </Suspense>
            <main className="w-full min-w-0 flex-1 px-4 py-6 sm:px-8 lg:px-12 lg:py-10">
              <div className="mx-auto max-w-6xl">{children}</div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
