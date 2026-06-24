import { Trophy, Check, Calendar } from 'lucide-react'
import { useGoalStore } from '../store/useGoalStore'

function getDaysLeft(deadline) {
  if (!deadline) return null
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
}

export default function GoalProgress({ goal }) {
  const { incrementGoal } = useGoalStore()
  const pct = goal.target_value > 0 ? Math.min((goal.current_value / goal.target_value) * 100, 100) : 0
  const daysLeft = getDaysLeft(goal.deadline)

  return (
    <div className="card" style={{
      borderColor: goal.completed ? 'rgba(52,211,153,0.3)' : 'var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          {goal.completed && (
            <div style={{ width: '24px', height: '24px', borderRadius: '8px', flexShrink: 0,
              background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={13} style={{ color: '#FBBF24' }} />
            </div>
          )}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }} className="truncate">{goal.title}</h3>
        </div>
        {!goal.completed && (
          <button onClick={() => incrementGoal(goal.id)} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 12px', borderRadius: '9px', marginLeft: '8px',
            background: '#C8FF00', color: '#0B0D14', border: 'none',
            fontSize: '12px', fontWeight: 800, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            <Check size={12} strokeWidth={3} /> Done
          </button>
        )}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
            {goal.current_value}
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>
              {' '}/ {goal.target_value} {goal.unit}
            </span>
          </span>
          <span style={{
            fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
            background: 'rgba(200,255,0,0.1)', color: '#C8FF00',
          }}>
            {Math.round(pct)}%
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-lime" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {daysLeft !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Calendar size={11} style={{ color: daysLeft < 7 ? '#F87171' : 'var(--text-muted)' }} />
          <span style={{
            fontSize: '11px', fontWeight: 600,
            color: daysLeft < 0 ? '#F87171' : daysLeft < 7 ? '#F87171' : daysLeft < 30 ? '#FBBF24' : 'var(--text-muted)',
          }}>
            {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Due today!' : 'Overdue'}
          </span>
        </div>
      )}
    </div>
  )
}
