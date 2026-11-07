'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

type Toast = { id: number; type: 'ok' | 'error'; text: string }

const ToastContext = createContext<(type: Toast['type'], text: string) => void>(() => {})

// Hook para mostrar notificaciones desde cualquier página: const toast = useToast()
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((type: Toast['type'], text: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, type, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-pop-in flex items-start gap-3 rounded-xl border bg-white p-4 text-sm shadow-lg ${
              t.type === 'ok' ? 'border-ink/20' : 'border-oxblood/30'
            }`}
          >
            {t.type === 'ok' ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ink-soft" />
            ) : (
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-oxblood" />
            )}
            <p className="flex-1 text-text">{t.text}</p>
            <button
              onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
              className="text-muted hover:text-text"
              aria-label="Cerrar notificación"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
