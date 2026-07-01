import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, Pencil } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useTaskStore } from '../store/useTaskStore'
import Modal from '../components/Modal'
import TaskBlock from '../components/TaskBlock'
import FocusTimer from '../components/FocusTimer'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6)
const fmtHour = h => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
const toDateStr = d => d.toISOString().split('T')[0]

// ── Priority color system ──────────────────────────────────────────────────
// Each priority has two alternating shades for consecutive same-priority blocks
const PRI_CONFIG = {
  high: {
    shades:    ['#C8FF00', '#B0E000'],
    text:      '#0B0D14',
    border:    '#C8FF00',
    glow:      'rgba(200,255,0,0.35)',
    gradient:  ['rgba(200,255,0,0.92)', 'rgba(168,216,0,0.82)'],
  },
  medium: {
    shades:    ['#9D7EF0', '#8564D8'],
    text:      '#FFFFFF',
    border:    '#9D7EF0',
    glow:      'rgba(157,126,240,0.3)',
    gradient:  ['rgba(157,126,240,0.9)', 'rgba(133,100,216,0.82)'],
  },
  low: {
    shades:    ['#4A90B8', '#3A7A9E'],
    text:      '#FFFFFF',
    border:    '#4A90B8',
    glow:      'rgba(74,144,184,0.25)',
    gradient:  ['rgba(74,144,184,0.88)', 'rgba(58,122,158,0.8)'],
  },
}

const EMPTY_FORM = { title: '', start_time: '09:00', end_time: '10:00', priority: 'medium', recurring: 'none' }

export default function Planner() {
  const { user } = useAuthStore()
  const { fetchTasks, addTask, updateTask, getTasksForDate } = useTaskStore()
  const [date, setDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)   // null = new task, task obj = editing
  const [form, setForm] = useState(EMPTY_FORM)

  const dateStr = toDateStr(date)
  const tasks = getTasksForDate(dateStr)
  const isToday = toDateStr(new Date()) === dateStr

  useEffect(() => { if (user) fetchTasks(user.id, dateStr) }, [user, dateStr])

  const nav = (dir) => { const d = new Date(date); d.setDate(d.getDate() + dir); setDate(d) }

  // Open modal to add a brand-new task
  const openAddModal = () => {
    setEditingTask(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  // Open modal pre-filled to edit an existing task
  const openEditModal = (task) => {
    setEditingTask(task)
    setForm({
      title:     task.title,
      start_time: task.start_time || '',
      end_time:   task.end_time   || '',
      priority:   task.priority   || 'medium',
      recurring:  task.recurring  || 'none',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user || !form.title.trim()) return

    if (editingTask) {
      // Update existing — no duplicate
      await updateTask(editingTask.id, form)
    } else {
      // Create new
      await addTask(user.id, { ...form, scheduled_date: dateStr })
    }
    setShowModal(false)
    setEditingTask(null)
    setForm(EMPTY_FORM)
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

  // Track per-priority index to alternate shades
  const priorityCount = { high: 0, medium: 0, low: 0 }

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
          <button id="add-task-btn" onClick={openAddModal} className="btn-lime">
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
              {scheduled.map((task) => {
                const s = getTaskStyle(task)
                if (!s) return null

                const cfg = PRI_CONFIG[task.priority] || PRI_CONFIG.medium
                const idx = priorityCount[task.priority] ?? 0
                priorityCount[task.priority] = idx + 1

                const isAlt = idx % 2 === 1
                const bg = `linear-gradient(160deg, ${cfg.gradient[isAlt ? 1 : 0]}, ${cfg.gradient[isAlt ? 0 : 1]})`

                // Add extra top spacing for consecutive same-priority blocks to prevent merge
                const prevSamePriority = scheduled
                  .slice(0, scheduled.indexOf(task))
                  .reverse()
                  .find(t => t.priority === task.priority)

                const needsSeparation = prevSamePriority && (() => {
                  const [pH, pM] = (prevSamePriority.end_time || '00:00').split(':').map(Number)
                  const [cH, cM] = task.start_time.split(':').map(Number)
                  return (cH * 60 + cM) - (pH * 60 + pM) <= 5
                })()

                return (
                  <div
                    key={task.id}
                    style={{
                      position: 'absolute',
                      top: `${s.top + (needsSeparation ? 8 : 0)}px`,
                      height: `${s.height - (needsSeparation ? 8 : 0)}px`,
                      left: '4px', right: '4px',
                      borderRadius: '9px',
                      padding: '5px 10px',
                      background: bg,
                      overflow: 'hidden',
                      pointerEvents: 'auto',
                      boxShadow: `0 2px 12px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.12)`,
                      borderLeft: `3px solid ${cfg.border}`,
                      borderTop: needsSeparation ? `2px solid rgba(255,255,255,0.15)` : 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      group: true,
                    }}
                    onClick={() => openEditModal(task)}
                    title="Click to edit"
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scaleX(0.98)'
                      e.currentTarget.style.boxShadow = `0 4px 20px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scaleX(1)'
                      e.currentTarget.style.boxShadow = `0 2px 12px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.12)`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: cfg.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {task.completed ? '✓ ' : ''}{task.title}
                      </p>
                      <Pencil size={10} style={{ color: cfg.text, opacity: 0.6, flexShrink: 0 }} />
                    </div>
                    <p style={{ fontSize: '10px', color: cfg.text, opacity: 0.75 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '-8px' }}>
            <span style={{ fontSize: '15px' }}>⚡</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.01em' }}>FlowState</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Focus Timer</span>
          </div>
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

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTask(null); setForm(EMPTY_FORM) }}
        title={editingTask ? '✏️ Edit Task' : 'New Task ⚡'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              <option value="low">🌊 Low</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={() => { setShowModal(false); setEditingTask(null); setForm(EMPTY_FORM) }} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-lime" style={{ flex: 1, justifyContent: 'center' }}>
              {editingTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
