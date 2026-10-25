import { memo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const existMs = 150

const tones = {
  danger: {
    icon: 'bg-red-100 text-red-600',
    button: 'bg-red-600 hover:bg-red-700',
    path: 'M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  },
  success: {
    icon: 'bg-emerald-100 text-emerald-600',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    path: 'm5 13 4 4L19 7',
  },
}

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  tone?: keyof typeof tones
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const [closing, setClosing] = useState(false)
  const styles = tones[tone]

  const closeThen = (action: () => void) => {
    setClosing(true)
    setTimeout(action, existMs)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setClosing(true)
        setTimeout(onCancel, existMs)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  // Portal to <body> so the fixed overlay isn't affected by the list item's styles.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] ${
          closing ? 'animate-backdrop-out' : 'animate-backdrop-in'
        }`}
        onClick={() => closeThen(onCancel)}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className={`relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ${
          closing ? 'animate-dialog-out' : 'animate-dialog-in'
        }`}
      >
        <div className={`mb-4 flex size-11 items-center justify-center rounded-full ${styles.icon}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={styles.path} />
          </svg>
        </div>

        <h2 id="confirm-title" className="text-lg font-semibold text-slate-800">
          {title}
        </h2>
        <p id="confirm-message" className="mt-2 break-words text-sm text-slate-500">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={() => closeThen(onCancel)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => closeThen(onConfirm)}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${styles.button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default memo(ConfirmDialog)
