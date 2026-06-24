import { Check, Trash2 } from 'lucide-react'
import { useTaskStore } from '../store/useTaskStore'

const PRIORITY_CONFIG = {
  high:   { bg: 'rgba(200,255,0,0.08)',  border: 'rgba(200,255,0,0.35)',  dot: '#C8FF00',  text: '#C8FF00'  },
  medium: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.35)', dot: '#A78BFA', text: '#A78BFA' },
  low:    { bg: 'rgba(100,116,139,0.06)', border: 'rgba(100,116,139,0.2)', dot: '#64748B', text: '#64748B' },
}

export default function TaskBlock({ task, compact = false }) {
  const { toggleTask, deleteTask } = useTaskStore()
  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium

  return (
    <div
      className="group"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '10px 12px', borderRadius: '11px',
        background: task.completed ? 'transparent' : p.bg,
        border: `1px solid ${task.completed ? 'var(--border)' : p.border}`,
        opacity: task.completed ? 0.5 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); toggleTask(task.id) }}
        style={{
          flexShrink: 0, marginTop: '1px', width: '18px', height: '18px', borderRadius: '5px',
          background: task.completed ? '#34D399' : 'transparent',
          border: `1.5px solid ${task.completed ? '#34D399' : p.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s ease',
        }}
      >
        {task.completed && <Check size={9} strokeWidth={3} style={{ color: '#0B0D14' }} />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '13px', fontWeight: 600,
          color: task.completed ? 'var(--text-muted)' : 'var(--text)',
          textDecoration: task.completed ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task.title}
        </p>
        {!compact && (task.start_time || task.priority) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
            {task.start_time && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                {task.start_time.slice(0, 5)}{task.end_time ? ` – ${task.end_time.slice(0, 5)}` : ''}
              </span>
            )}
            <span style={{
              fontSize: '10px', fontWeight: 700, textTransform: 'capitalize',
              color: p.text,
            }}>
              ● {task.priority}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}
        style={{
          flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', opacity: 0, transition: 'all 0.2s ease',
          padding: '2px',
        }}
        className="group-hover:opacity-100"
        onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.opacity = 1 }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.opacity = 0 }}
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}
