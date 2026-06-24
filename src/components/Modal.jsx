import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          width: '100%', maxWidth: '440px',
          background: '#1C1F2E',
          border: '1px solid var(--border)',
          borderRadius: '20px', padding: '28px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,255,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>{title}</h2>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '9px', border: '1px solid var(--border)',
            background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s ease',
          }}>
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
