import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

let toastId = 0
const listeners = new Set()

export function showToast(message, type = 'error') {
  const id = ++toastId
  listeners.forEach(fn => fn({ id, message, type }))
  return id
}

export default function Toast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const fn = (toast) => {
      setToasts(prev => [...prev, toast])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 4000)
    }
    listeners.add(fn)
    return () => listeners.delete(fn)
  }, [])

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl animate-fade-in"
          style={{
            background: '#1A1A1A',
            border: `1px solid ${toast.type === 'success' ? '#4CAF50' : '#EF4444'}`,
            minWidth: '280px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {toast.type === 'success'
            ? <CheckCircle size={18} style={{ color: '#4CAF50', flexShrink: 0 }} />
            : <XCircle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
          }
          <p className="text-sm text-white flex-1">{toast.message}</p>
          <button onClick={() => remove(toast.id)} className="text-text-secondary hover:text-white">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
