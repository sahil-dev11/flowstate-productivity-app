import { useEffect, useMemo, useState } from 'react'
import { CheckSquare, Flame, Target, Smile, TrendingUp, Clock } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useTaskStore } from '../store/useTaskStore'
import { useHabitStore } from '../store/useHabitStore'
import { useGoalStore } from '../store/useGoalStore'
import { useJournalStore } from '../store/useJournalStore'
import StatsCard from '../components/StatsCard'
import TaskBlock from '../components/TaskBlock'
import HabitCard from '../components/HabitCard'
import MoodPicker from '../components/MoodPicker'

const QUOTES = [
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "You don't rise to your goals, you fall to your systems.", author: "James Clear" },
  { text: "Small steps every day = massive results.", author: "FlowState" },
  { text: "The secret? Show up. Every. Single. Day.", author: "Unknown" },
  { text: "Consistency beats motivation.", author: "Unknown" },
  { text: "Your future self is watching. Make them proud.", author: "FlowState" },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user, profile } = useAuthStore()
  const { fetchTasks, getTasksForDate, getTodayStats } = useTaskStore()
  const { fetchHabits, fetchHabitLogs, habits, isCompletedToday, getHabitStreak } = useHabitStore()
  const { fetchGoals, getActiveGoals } = useGoalStore()
  const { saveEntry, getEntryForDate, fetchEntries } = useJournalStore()

  const today = new Date().toISOString().split('T')[0]
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])
  const [mood, setMood] = useState(null)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (user) {
      fetchTasks(user.id, today)
      fetchHabits(user.id)
      fetchHabitLogs(user.id)
      fetchGoals(user.id)
      fetchEntries(user.id)
    }
  }, [user, today])

  useEffect(() => {
    const e = getEntryForDate(today)
    if (e?.mood) setMood(e.mood)
  }, [today])

  const todayTasks = getTasksForDate(today)
  const { total: totalTasks, completed: completedTasks } = getTodayStats(today)
  const activeGoals = getActiveGoals()
  const activeHabits = habits.filter(h => !h.archived)
  const doneHabits = activeHabits.filter(h => isCompletedToday(h.id)).length
  const maxStreak = useMemo(() => habits.reduce((m, h) => Math.max(m, getHabitStreak(h.id)), 0), [habits])

  const handleMoodChange = async (val) => {
    setMood(val)
    const entry = getEntryForDate(today) || {}
    await saveEntry(user.id, { ...entry, entry_date: today, mood: val })
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1300px', margin: '0 auto' }} className="animate-fade-up">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <h1 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>
            {getGreeting()},&nbsp;
            <span style={{ color: '#C8FF00' }}>{firstName} 👋</span>
          </h1>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', flexShrink: 0 }}>
          <Clock size={14} style={{ color: '#C8FF00' }} />
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}
        className="stagger">
        <StatsCard icon={CheckSquare} label="Tasks Today" value={`${completedTasks}/${totalTasks}`}
          sub={`${taskPct}% complete`} accent="#C8FF00" />
        <StatsCard icon={Flame} label="Habits Done" value={`${doneHabits}/${activeHabits.length}`}
          sub="today" accent="#A78BFA" />
        <StatsCard icon={TrendingUp} label="Best Streak" value={maxStreak}
          sub="days" accent="#38BDF8" />
        <StatsCard icon={Target} label="Active Goals" value={activeGoals.length}
          sub="in progress" accent="#F472B6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Tasks */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={17} style={{ color: '#C8FF00' }} strokeWidth={2.5} />
                Today's Tasks
              </h2>
              {totalTasks > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '80px', height: '5px', background: 'var(--bg-elevated)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${taskPct}%`, height: '100%', background: '#C8FF00', borderRadius: '99px', transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#C8FF00' }}>{taskPct}%</span>
                </div>
              )}
            </div>
            {todayTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>No tasks yet</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Head to Planner to schedule your day</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {todayTasks.slice(0, 6).map(t => <TaskBlock key={t.id} task={t} compact />)}
              </div>
            )}
          </div>

          {/* Habits */}
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Flame size={17} style={{ color: '#C8FF00' }} strokeWidth={2.5} />
              Habits Due Today
              {activeHabits.length > 0 && (
                <span className="badge-lime" style={{ marginLeft: '4px' }}>{doneHabits}/{activeHabits.length}</span>
              )}
            </h2>
            {activeHabits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔥</div>
                <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>No habits yet</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Start building streaks in Habits</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {activeHabits.slice(0, 6).map(h => <HabitCard key={h.id} habit={h} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Mood */}
          <div className="card">
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smile size={16} style={{ color: '#A78BFA' }} strokeWidth={2.5} />
              Vibe Check
            </h2>
            <MoodPicker value={mood} onChange={handleMoodChange} />
            {mood && (
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#34D399', marginTop: '10px' }}>● Mood saved</p>
            )}
          </div>

          {/* Quote */}
          <div style={{
            borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, #1C1F2E 0%, #151721 100%)',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px',
              borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,0,0.12) 0%, transparent 70%)',
            }} />
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#C8FF00', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
              ⚡ Daily Fuel
            </p>
            <blockquote style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic' }}>
              "{quote.text}"
            </blockquote>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px', fontWeight: 500 }}>
              — {quote.author}
            </p>
          </div>

          {/* Goals */}
          {activeGoals.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={16} style={{ color: '#A78BFA' }} strokeWidth={2.5} />
                Goal Progress
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activeGoals.slice(0, 3).map(goal => {
                  const pct = Math.min((goal.current_value / goal.target_value) * 100, 100)
                  return (
                    <div key={goal.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                          {goal.title}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#A78BFA', flexShrink: 0 }}>
                          {Math.round(pct)}%
                        </span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-violet" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
