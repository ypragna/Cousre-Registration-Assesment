import { useEffect, useRef } from 'react'
import Icon from './Icon.jsx'

function ConfirmDialog({ learnerId, busy, onCancel, onConfirm }) {
  const confirmButtonRef = useRef(null)
  const busyRef = useRef(busy)
  busyRef.current = busy

  useEffect(() => {
    if (!learnerId) return undefined

    const previouslyFocused = document.activeElement
    confirmButtonRef.current?.focus()
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (!busyRef.current) onCancel()
      }

      if (event.key === 'Tab') {
        const dialog = confirmButtonRef.current?.closest('[role="dialog"]')
        const focusable = dialog?.querySelectorAll('button:not(:disabled)')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [learnerId, onCancel])

  if (!learnerId) return null

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onCancel()
    }}>
      <section className="confirm-dialog" role="dialog" aria-modal="true"
        aria-labelledby="drop-dialog-title" aria-describedby="drop-dialog-description"
      >
        <button className="dialog-close" type="button" onClick={onCancel} aria-label="Close dialog" disabled={busy}>
          <Icon name="x" size={19} />
        </button>
        <div className="dialog-icon"><Icon name="trash" size={22} /></div>
        <h2 id="drop-dialog-title">Drop this learner?</h2>
        <p id="drop-dialog-description">You’re about to drop <strong>{learnerId}</strong> from the course. If a learner is promoted, the backend will handle the FIFO waitlist.</p>
        <div className="dialog-actions">
          <button className="button button-secondary" type="button" onClick={onCancel} disabled={busy}>Keep learner</button>
          <button ref={confirmButtonRef} className="button button-danger" type="button" onClick={onConfirm} disabled={busy}>
            {busy ? 'Dropping…' : 'Confirm drop'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmDialog
