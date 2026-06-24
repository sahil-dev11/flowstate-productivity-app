import { useState, useEffect } from 'react'
import { Plus, Flame } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useHabitStore } from '../store/useHabitStore'
import HabitCard from '../components/HabitCard'
import HabitHeatmap from '../components/HabitHeatmap'
import Modal from '../components/Modal'

const EMOJIS = ['✨','💪','🧘','📚','🏃','💧','🥗','😴','🎯','🎨','🎵','✍️','🧠','🌅','🚴','🏋️','🌿','⚡']
const FREQS  = [{ value: 'daily', label: '🔄 Every day' }, { value: 'weekdays', label: '💼 Weekdays' }, { value: 'custom', label: '🎛️ Custom' }]
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function Habits() {
  const { user } = useAuthStore()
  const { fetchHabits, fetchHabitLogs, habits, habitLogs, addHabit, archiveHabit, isCompletedToday } = useHabitStore()
  const [showModal, setShowModal] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [form, setForm] = useState({ name: '', icon: '✨', color: '#C8FF00', frequency: 'daily', target_days: [1,2,3,4,5,6,7] })

  useEffect(() => { if (user) { fetchHabits(user.id); fetchHabitLogs(user.id) } }, [user])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!user || !form.name.trim()) return
    await addHabit(user.id, form)
    setShowModal(false)
    setForm({ name: '', icon: '✨', color: '#C8FF00', frequency: 'daily', target_days: [1,2,3,4,5,6,7] })
  }

  const toggleDay = (d) => setForm(f => ({
    ...f, target_days: f.target_days.includes(d) ? f.target_days.filter(x => x !== d) : [...f.target_days, d]
  }))

  const activeHabits = habits.filter(h => !h.archived)
  const doneHabits = activeHabits.filter(h => isCompletedToday(h.id)).length
  const donePct = activeHabits.length > 0 ? (doneHabits / activeHabits.length) * 100 : 0

  const S = { label: { fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' } }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1300px', margin: '0 auto' }} className="animate-fade-up">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Habit Tracker</p>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame size={26} style={{ color: '#C8FF00' }} /> Your Habits
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeHabits.length > 0 && (
            <div className="card" style={{ padding: '10px 16px', textAlign: 'center' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)' }}>{doneHabits}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}> / {activeHabits.length} done</span>
            </div>
          )}
          <button id="add-habit-btn" onClick={() => setShowModal(true)} className="btn-lime">
            <Plus size={15} strokeWidth={3} /> Add Habit
          </button>
        </div>
      </div>

      {/* Progress */}
      {activeHabits.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>Today's Progress</p>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#C8FF00' }}>{Math.round(donePct)}%</p>
          </div>
          <div style={{ height: '10px', background: 'var(--bg-elevated)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              width: `${donePct}%`, height: '100%',
              background: 'linear-gradient(90deg, #C8FF00, #A8D800)',
              borderRadius: '99px', transition: 'width 0.6s ease',
              boxShadow: donePct > 0 ? '0 0 10px rgba(200,255,0,0.4)' : 'none',
            }} />
          </div>
        </div>
      )}

      {/* Grid */}
      {activeHabits.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }} className="animate-float">🌱</div>
          <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', marginBottom: '8px' }}>No habits yet!</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Start small. Even 1 habit changes everything.</p>
          <button onClick={() => setShowModal(true)} className="btn-lime" style={{ margin: '0 auto' }}>Add First Habit</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {activeHabits.map(habit => (
            <div key={habit.id}
              onClick={() => setSelectedHabit(selectedHabit?.id === habit.id ? null : habit)}
              style={{
                cursor: 'pointer',
                outline: selectedHabit?.id === habit.id ? '2px solid #C8FF00' : '2px solid transparent',
                outlineOffset: '2px', borderRadius: '15px',
              }}
            >
              <HabitCard habit={habit} onArchive={archiveHabit} />
            </div>
          ))}
        </div>
      )}

      {/* Heatmap */}
      {activeHabits.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📅 Activity Heatmap
              {selectedHabit && <span className="badge-lime">{selectedHabit.icon} {selectedHabit.name}</span>}
            </h2>
            {selectedHabit && (
              <button onClick={() => setSelectedHabit(null)}
                style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Show all ×
              </button>
            )}
          </div>
          <HabitHeatmap habitLogs={habitLogs} habitId={selectedHabit?.id} />
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Habit 🔥">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={S.label}>Habit Name</label>
            <input id="habit-name" type="text" className="input"
              placeholder="e.g. Morning meditation" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required autoFocus />
          </div>
          <div>
            <label style={S.label}>Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EMOJIS.map(emoji => (
                <button key={emoji} type="button" onClick={() => setForm(f => ({ ...f, icon: emoji }))} style={{
                  width: '38px', height: '38px', borderRadius: '10px', fontSize: '18px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
                  background: form.icon === emoji ? '#C8FF00' : 'var(--bg-elevated)',
                  outline: form.icon === emoji ? '2px solid #C8FF00' : '2px solid transparent',
                  transform: form.icon === emoji ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                }}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={S.label}>Frequency</label>
            <select id="habit-freq" className="input" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
              {FREQS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {form.frequency === 'custom' && (
            <div>
              <label style={S.label}>Days</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {DAYS.map((day, i) => (
                  <button key={i} type="button" onClick={() => toggleDay(i + 1)} style={{
                    flex: 1, padding: '8px 4px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                    fontSize: '11px', fontWeight: 700, transition: 'all 0.15s ease',
                    background: form.target_days.includes(i + 1) ? '#C8FF00' : 'var(--bg-elevated)',
                    color: form.target_days.includes(i + 1) ? '#0B0D14' : 'var(--text-muted)',
                  }}>
                    {day[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-lime" style={{ flex: 1, justifyContent: 'center' }}>Add Habit</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
