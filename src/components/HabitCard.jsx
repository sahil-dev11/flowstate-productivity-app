import { useState } from 'react'
import { Flame, Check, Trash2 } from 'lucide-react'
import { useHabitStore } from '../store/useHabitStore'
import { useAuthStore } from '../store/useAuthStore'

export default function HabitCard({ habit }) {
  const { toggleHabitLog, getHabitStreak, isCompletedToday, deleteHabit } = useHabitStore()
  const { user } = useAuthStore()
  const today = new Date().toISOString().split('T')[0]
  const streak = getHabitStreak(habit.id)
  const done = isCompletedToday(habit.id)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleToggle = async () => { if (user) await toggleHabitLog(user.id, habit.id, today) }
  const handleDelete = async () => { await deleteHabit(habit.id) }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1.5px solid ${done ? 'rgba(200,255,0,0.4)' : 'var(--border)'}`,
        borderRadius: '14px', padding: '14px',
        transition: 'all 0.2s ease',
        boxShadow: done ? '0 0 20px rgba(200,255,0,0.08)' : 'none',
        position: 'relative',
      }}
    >
      {/* Delete confirm overlay */}
      {confirmDelete && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '13px',
          background: 'rgba(15,17,23,0.95)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '12px', zIndex: 10, padding: '16px',
        }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', textAlign: 'center' }}>
            Delete <span style={{ color: '#F87171' }}>{habit.name}</span>?<br />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              This removes all streak data too.
            </span>
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setConfirmDelete(false)} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={handleDelete} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
              background: '#F87171', border: 'none', color: '#fff', cursor: 'pointer',
            }}>Delete</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Icon */}
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
            background: done ? '#C8FF00' : 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', border: `1px solid ${done ? '#C8FF00' : 'var(--border)'}`,
          }}>
            {habit.icon || '✨'}
          </div>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
              {habit.name}
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {habit.frequency || 'daily'}
            </p>
          </div>
        </div>

        {/* Check button */}
        <button onClick={handleToggle} style={{
          width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
          background: done ? '#C8FF00' : 'var(--bg-elevated)',
          border: `1.5px solid ${done ? '#C8FF00' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s ease',
          boxShadow: done ? '0 0 10px rgba(200,255,0,0.4)' : 'none',
        }}>
          <Check size={13} strokeWidth={3} style={{ color: done ? '#0B0D14' : 'var(--border)' }} />
        </button>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Streak badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '4px 8px', borderRadius: '8px',
          background: streak > 0 ? 'rgba(200,255,0,0.1)' : 'var(--bg-elevated)',
          border: `1px solid ${streak > 0 ? 'rgba(200,255,0,0.2)' : 'var(--border)'}`,
        }}>
          <Flame size={11} style={{ color: streak > 0 ? '#C8FF00' : 'var(--text-dim)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: streak > 0 ? '#C8FF00' : 'var(--text-dim)' }}>
            {streak}d streak
          </span>
        </div>

        {/* Delete button */}
        <button
          onClick={() => setConfirmDelete(true)}
          title="Delete habit"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: 'var(--text-muted)', borderRadius: '6px', display: 'flex',
            alignItems: 'center', transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#F87171'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
