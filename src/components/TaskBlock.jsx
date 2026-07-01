import { useState } from 'react'
import { Check, Trash2, Pencil, X, Save } from 'lucide-react'
import { useTaskStore } from '../store/useTaskStore'
import ConfirmDialog from './ConfirmDialog'

const PRIORITY_CONFIG = {
  high:   { bg: 'rgba(200,255,0,0.08)',  border: 'rgba(200,255,0,0.35)',  dot: '#C8FF00',  text: '#C8FF00'  },
  medium: { bg: 'rgba(157,126,240,0.08)', border: 'rgba(157,126,240,0.3)', dot: '#9D7EF0', text: '#9D7EF0' },
  low:    { bg: 'rgba(74,144,184,0.08)',  border: 'rgba(74,144,184,0.25)', dot: '#4A90B8',  text: '#4A90B8'  },
}

export default function TaskBlock({ task, compact = false }) {
  const { toggleTask, deleteTask, updateTask } = useTaskStore()
  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium

  const [editing, setEditing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [form, setForm] = useState({
    title: task.title,
    start_time: task.start_time || '',
    end_time: task.end_time || '',
    priority: task.priority || 'medium',
  })

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    await updateTask(task.id, form)
    setEditing(false)
  }

  const handleDeleteConfirmed = async () => {
    setShowConfirm(false)
    setIsDeleting(true)
    // Animate out, then remove
    setTimeout(async () => {
      await deleteTask(task.id)
    }, 280)
  }

  if (editing) {
    return (
      <div style={{
        padding: '12px', borderRadius: '11px',
        background: p.bg, border: `1px solid ${p.border}`,
        display: 'flex', flexDirection: 'column', gap: '10px',
        animation: 'fadeUp 0.2s ease both',
      }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            autoFocus
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="input"
            style={{ fontSize: '13px', padding: '6px 10px' }}
            placeholder="Task title"
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <input
              type="time"
              value={form.start_time}
              onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
              className="input"
              style={{ fontSize: '12px', padding: '5px 8px' }}
            />
            <input
              type="time"
              value={form.end_time}
              onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
              className="input"
              style={{ fontSize: '12px', padding: '5px 8px' }}
            />
          </div>
          <select
            value={form.priority}
            onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            className="input"
            style={{ fontSize: '12px', padding: '5px 8px' }}
          >
            <option value="high">⚡ High</option>
            <option value="medium">🔮 Medium</option>
            <option value="low">🌊 Low</option>
          </select>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setEditing(false)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                padding: '6px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', cursor: 'pointer',
              }}
            >
              <X size={12} /> Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                padding: '6px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                background: '#C8FF00', border: 'none', color: '#0B0D14', cursor: 'pointer',
              }}
            >
              <Save size={12} /> Save
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <>
      <div
        className="task-block-row"
        style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '10px 12px', borderRadius: '11px',
          background: task.completed ? 'transparent' : p.bg,
          border: `1px solid ${task.completed ? 'var(--border)' : p.border}`,
          opacity: isDeleting ? 0 : (task.completed ? 0.5 : 1),
          transform: isDeleting ? 'scaleY(0.5) translateY(-4px)' : 'scaleY(1)',
          transition: isDeleting
            ? 'opacity 0.25s ease, transform 0.25s ease, margin 0.25s ease'
            : 'all 0.2s ease',
          marginBottom: isDeleting ? '-44px' : '0',
          overflow: 'hidden',
        }}
      >
        {/* Checkbox */}
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

        {/* Content */}
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

        {/* Edit button */}
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(true) }}
          className="task-action-btn"
          onMouseEnter={e => { e.currentTarget.style.color = '#C8FF00'; e.currentTarget.style.background = 'rgba(200,255,0,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          title="Edit task"
        >
          <Pencil size={12} />
        </button>

        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowConfirm(true) }}
          className="task-action-btn"
          onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          title="Delete task"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        message={`"${task.title}" will be permanently deleted.`}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
