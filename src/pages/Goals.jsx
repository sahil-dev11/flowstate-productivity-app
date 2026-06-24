import { useState, useEffect } from 'react'
import { Plus, Trophy, Target } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useGoalStore } from '../store/useGoalStore'
import GoalProgress from '../components/GoalProgress'
import Modal from '../components/Modal'

export default function Goals() {
  const { user } = useAuthStore()
  const { fetchGoals, addGoal, deleteGoal, getActiveGoals, getCompletedGoals } = useGoalStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', target_value: '', current_value: 0, unit: '', deadline: '' })

  useEffect(() => { if (user) fetchGoals(user.id) }, [user])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!user || !form.title.trim()) return
    await addGoal(user.id, {
      title: form.title, target_value: parseFloat(form.target_value) || 100,
      current_value: parseFloat(form.current_value) || 0, unit: form.unit, deadline: form.deadline || null,
    })
    setShowModal(false)
    setForm({ title: '', target_value: '', current_value: 0, unit: '', deadline: '' })
  }

  const active = getActiveGoals()
  const done = getCompletedGoals()
  const successRate = (active.length + done.length) > 0 ? Math.round((done.length / (active.length + done.length)) * 100) : 0

  const S = { label: { fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' } }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1300px', margin: '0 auto' }} className="animate-fade-up">

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Goal Setting</p>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={26} style={{ color: '#C8FF00' }} /> My Goals
          </h1>
        </div>
        <button id="add-goal-btn" onClick={() => setShowModal(true)} className="btn-lime">
          <Plus size={15} strokeWidth={3} /> New Goal
        </button>
      </div>

      {/* Stats */}
      {(active.length + done.length) > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { value: active.length, label: 'In Progress', color: 'var(--text)' },
            { value: done.length, label: 'Achieved 🏆', color: '#34D399' },
            { value: `${successRate}%`, label: 'Success Rate', color: '#C8FF00' },
          ].map(({ value, label, color }) => (
            <div key={label} className="card" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '28px', fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '6px' }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {active.length === 0 && done.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }} className="animate-float">🎯</div>
          <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', marginBottom: '8px' }}>Dream it. Set it. Crush it.</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Add your first goal and start making progress.</p>
          <button onClick={() => setShowModal(true)} className="btn-lime" style={{ margin: '0 auto' }}>Set First Goal</button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>In Progress ⚡</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {active.map(g => <GoalProgress key={g.id} goal={g} />)}
              </div>
            </div>
          )}
          {done.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trophy size={12} style={{ color: '#FBBF24' }} /> Achieved
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {done.map(g => (
                  <div key={g.id} className="card" style={{ borderColor: 'rgba(52,211,153,0.25)', background: 'rgba(52,211,153,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(251,191,36,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Trophy size={14} style={{ color: '#FBBF24' }} />
                      </div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{g.title}</h3>
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#34D399', marginBottom: '12px' }}>
                      {g.current_value} / {g.target_value} {g.unit} — Completed! 🎉
                    </p>
                    <button onClick={() => deleteGoal(g.id)}
                      style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Goal 🎯">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={S.label}>Goal Title</label>
            <input id="goal-title" type="text" className="input" placeholder="e.g. Read 24 books this year"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={S.label}>Target</label>
              <input id="goal-target" type="number" className="input" placeholder="100"
                value={form.target_value} onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))} min="1" required />
            </div>
            <div>
              <label style={S.label}>Unit</label>
              <input id="goal-unit" type="text" className="input" placeholder="books, km..."
                value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={S.label}>Starting Value</label>
            <input id="goal-current" type="number" className="input" placeholder="0"
              value={form.current_value} onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))} min="0" />
          </div>
          <div>
            <label style={S.label}>Deadline (optional)</label>
            <input id="goal-deadline" type="date" className="input"
              value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-lime" style={{ flex: 1, justifyContent: 'center' }}>Add Goal</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
