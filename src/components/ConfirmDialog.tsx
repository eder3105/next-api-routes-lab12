'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import Modal from './Modal'
import { buttonGhost } from '@/lib/ui'

type Props = {
  open: boolean
  title: string
  message: string
  confirmText: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

// Diálogo para confirmar eliminaciones (reemplaza al confirm() del navegador)
export default function ConfirmDialog({ open, title, message, confirmText, onConfirm, onClose }: Props) {
  const [busy, setBusy] = useState(false)

  const handle = async () => {
    setBusy(true)
    await onConfirm()
    setBusy(false)
    onClose()
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm leading-relaxed text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className={buttonGhost}>
          Cancelar
        </button>
        <button
          onClick={handle}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-oxblood px-4 py-2 text-sm font-semibold text-white hover:bg-oxblood/90 disabled:opacity-50"
        >
          <Trash2 className="size-4" />
          {busy ? 'Eliminando...' : confirmText}
        </button>
      </div>
    </Modal>
  )
}
