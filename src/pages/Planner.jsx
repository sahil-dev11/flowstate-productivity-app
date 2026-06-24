import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useTaskStore } from '../store/useTaskStore'
import Modal from '../components/Modal'
import TaskBlock from '../components/TaskBlock'
import FocusTimer from '../components/FocusTimer'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6)
const fmtHour = h => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
const toDateStr = d => d.toISOString().split('T')[0]

const PRI_COLOR = { high: '#C8FF00', medium: '#A78BFA', low: '#475569' }
const PRI_TEXT  = { high: '#0B0D14', medium: '#0B0D14', low: '#94A3B8' }

export default function Planner() {
  const { user } = useAuthStore()
  const { fetchTasks, addTask, getTasksForDate } = useTaskStore()
  const [date, setDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', start_time: '09:00', end_time: '10:00', priority: 'medium', recurring: 'none' })

  const dateStr = toDateStr(date)
  const tasks = getTasksForDate(dateStr)
  const isToday = toDateStr(new Date()) === dateStr

  useEffect(() => { if (user) fetchTasks(user.id, dateStr) }, [user, dateStr])

  const nav = (dir) => { const d = new Date(date); d.setDate(d.getDate() + dir); setDate(d) }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!user || !form.title.trim()) return
    await addTask(user.id, { ...form, scheduled_date: dateStr })
    setShowModal(false)
    setForm({ title: '', start_time: '09:00', end_time: '10:00', priority: 'medium', recurring: 'none' })
  }

  const getTaskStyle = (task) => {
    if (!task.start_time) return null
    const [sH, sM] = task.start_time.split(':').map(Number)
    const [eH, eM] = (task.end_time || `${sH + 1}:00`).split(':').map(Number)
    const top = ((sH - 6) * 60 + sM) / 60 * 56
    const height = Math.max(((eH * 60 + eM) - (sH * 60 + sM)) / 60 * 56, 28)
    return { top, height }
  }

  const scheduled = tasks.filter(t => t.start_time)
  const unscheduled = tasks.filter(t => !t.start_time)

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1300px', margin: '0 auto' }} className="animate-fade-up">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Daily Planner</p>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {isToday && <span className="badge-lime">Today</span>}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[{ dir: -1, icon: ChevronLeft }, null, { dir: 1, icon: ChevronRight }].map((item, i) =>
              item === null ? (
                <button key="today" onClick={() => setDate(new Date())} style={{
                  padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                  color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer',
                }}>Today</button>
              ) : (
                <button key={i} onClick={() => nav(item.dir)} style={{
                  width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer',
                }}>
                  <item.icon size={16} />
                </button>
              )
            )}
          </div>
          <button id="add-task-btn" onClick={() => setShowModal(true)} className="btn-lime">
            <Plus size={15} strokeWidth={3} /> Add Task
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        {/* Timeline */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Clock size={15} style={{ color: '#C8FF00' }} strokeWidth={2.5} />
            <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: '15px' }}>Schedule</span>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>{scheduled.length} events</span>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '70vh', position: 'relative' }}>
            {HOURS.map(hour => (
              <div key={hour} style={{ display: 'flex', height: '56px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ width: '60px', flexShrink: 0, fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: '12px', paddingTop: '6px' }}>
                  {fmtHour(hour)}
                </div>
                <div style={{ flex: 1, borderLeft: '1px solid var(--border)' }} />
              </div>
            ))}
            {/* Overlaid events */}
            <div style={{ position: 'absolute', top: 0, left: '60px', right: 0, bottom: 0, pointerEvents: 'none' }}>
              {scheduled.map(task => {
                const s = getTaskStyle(task)
                if (!s) return null
                const color = PRI_COLOR[task.priority] || PRI_COLOR.medium
                const textColor = PRI_TEXT[task.priority] || '#0B0D14'
                return (
                  <div key={task.id} style={{
                    position: 'absolute', top: `${s.top}px`, height: `${s.height}px`,
                    left: '4px', right: '4px', borderRadius: '8px', padding: '4px 10px',
                    background: color, overflow: 'hidden', pointerEvents: 'auto',
                    boxShadow: `0 2px 8px ${color}40`,
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.completed ? '✓ ' : ''}{task.title}
                    </p>
                    <p style={{ fontSize: '10px', color: textColor, opacity: 0.7 }}>
                      {task.start_time?.slice(0,5)} – {task.end_time?.slice(0,5)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {unscheduled.length > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Unscheduled</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {unscheduled.map(t => <TaskBlock key={t.id} task={t} />)}
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FocusTimer />
          {tasks.length > 0 && (
            <div className="card">
              <h3 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '12px', fontSize: '14px' }}>All Tasks</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {tasks.map(t => <TaskBlock key={t.id} task={t} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Task ⚡">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Title</label>
            <input id="task-title" type="text" className="input" placeholder="What needs to be done?"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Start</label>
              <input id="task-start" type="time" className="input" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>End</label>
              <input id="task-end" type="time" className="input" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Priority</label>
            <select id="task-priority" className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="high">⚡ High</option>
              <option value="medium">🔮 Medium</option>
              <option value="low">🌫️ Low</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-lime" style={{ flex: 1, justifyContent: 'center' }}>Add Task</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
