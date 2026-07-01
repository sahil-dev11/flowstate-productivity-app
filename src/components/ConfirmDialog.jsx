import { useEffect, useRef } from 'react'
import { AlertTriangle, X, Trash2 } from 'lucide-react'

/**
 * ConfirmDialog — lightweight inline confirmation prompt.
 * Renders inside a fixed overlay so it always stays visible.
 */
export default function ConfirmDialog({ isOpen, onConfirm, onCancel, message = 'Delete this task?' }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (isOpen && confirmRef.current) {
      confirmRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onConfirm, onCancel])

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="animate-scale-in"
        ref={confirmRef}
        tabIndex={-1}
        style={{
          width: '100%', maxWidth: '340px',
          background: '#1C1F2E',
          border: '1px solid rgba(248,113,113,0.25)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 16px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(248,113,113,0.08)',
          outline: 'none',
        }}
      >
        {/* Icon + message */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '18px' }}>
          <div style={{
            flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(248,113,113,0.12)',
            border: '1px solid rgba(248,113,113,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={16} style={{ color: '#F87171' }} strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
              Confirm Delete
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '9px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--text-dim)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <X size={13} /> Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '9px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              background: 'rgba(248,113,113,0.15)',
              border: '1px solid rgba(248,113,113,0.35)',
              color: '#F87171', cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)' }}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}
