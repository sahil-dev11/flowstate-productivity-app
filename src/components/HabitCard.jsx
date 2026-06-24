import { Flame, Check } from 'lucide-react'
import { useHabitStore } from '../store/useHabitStore'
import { useAuthStore } from '../store/useAuthStore'

export default function HabitCard({ habit, onArchive }) {
  const { toggleHabitLog, getHabitStreak, isCompletedToday } = useHabitStore()
  const { user } = useAuthStore()
  const today = new Date().toISOString().split('T')[0]
  const streak = getHabitStreak(habit.id)
  const done = isCompletedToday(habit.id)

  const handleToggle = async () => { if (user) await toggleHabitLog(user.id, habit.id, today) }

  return (
    <div
      className="group"
      style={{
        background: 'var(--bg-card)',
        border: `1.5px solid ${done ? 'rgba(200,255,0,0.4)' : 'var(--border)'}`,
        borderRadius: '14px',
        padding: '14px',
        transition: 'all 0.2s ease',
        boxShadow: done ? '0 0 20px rgba(200,255,0,0.12)' : 'none',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: done ? '#C8FF00' : 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
            border: `1px solid ${done ? '#C8FF00' : 'var(--border)'}`,
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        {onArchive && (
          <button onClick={() => onArchive(habit.id)}
            style={{
              fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none',
              cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s',
            }}
            className="group-hover:opacity-100"
            onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#F87171' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = 0; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            Archive
          </button>
        )}
      </div>
    </div>
  )
}
