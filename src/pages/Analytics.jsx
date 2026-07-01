import { useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { BarChart2, Flame, CheckSquare } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useHabitStore } from '../store/useHabitStore'
import { useTaskStore } from '../store/useTaskStore'

const TT = {
  contentStyle: { background: '#1C1F2E', border: '1px solid #2D3148', borderRadius: '10px', color: '#F1F5F9', fontSize: '12px', fontWeight: 600 },
  cursor: { fill: 'rgba(200,255,0,0.05)' }
}
const getLast14Days = () => Array.from({ length: 14 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d.toISOString().split('T')[0]
})

export default function Analytics() {
  const { user } = useAuthStore()
  const { fetchHabits, fetchHabitLogs, habits, habitLogs, getHabitStreak } = useHabitStore()
  const { fetchTasksRange, tasks } = useTaskStore()

  useEffect(() => {
    if (user) {
      fetchHabits(user.id)
      fetchHabitLogs(user.id)
      const days = getLast14Days()
      fetchTasksRange(user.id, days[0], days[days.length - 1])
    }
  }, [user])

  const weeklyData = useMemo(() => Array.from({ length: 7 }, (_, wi) => {
    const ws = new Date(); ws.setDate(ws.getDate() - (6 - wi) * 7)
    const we = new Date(ws); we.setDate(we.getDate() + 6)
    let total = 0, done = 0
    for (let d = new Date(ws); d <= we; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().split('T')[0]
      total += habits.length
      done += habitLogs.filter(l => l.completed_on === ds).length
    }
    return { label: ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), rate: total > 0 ? Math.round((done / total) * 100) : 0 }
  }), [habits, habitLogs])

  const taskData = useMemo(() => getLast14Days().map(ds => {
    const day = tasks.filter(t => t.scheduled_date === ds)
    return {
      date: new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total: day.length, completed: day.filter(t => t.completed).length,
    }
  }), [tasks])

  const streaks = useMemo(() =>
    habits.map(h => ({ name: `${h.icon || '✨'} ${h.name}`, streak: getHabitStreak(h.id) }))
      .sort((a, b) => b.streak - a.streak).slice(0, 6),
    [habits, getHabitStreak])

  const ChartHeader = ({ icon: Icon, color, title, sub }) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <Icon size={15} style={{ color }} strokeWidth={2.5} />
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>{title}</h2>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '23px' }}>{sub}</p>
    </div>
  )

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1300px', margin: '0 auto' }} className="animate-fade-up">
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Insights</p>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart2 size={26} style={{ color: '#C8FF00' }} /> Analytics
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Habit completion */}
        <div className="card">
          <ChartHeader icon={Flame} color="#C8FF00" title="Weekly Habit Rate" sub="Last 7 weeks" />
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3148" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0,100]} unit="%" />
              <Tooltip {...TT} formatter={v => [`${v}%`, 'Rate']} />
              <Bar dataKey="rate" radius={[6,6,0,0]}>
                {weeklyData.map((e, i) => (
                  <Cell key={i} fill={e.rate >= 80 ? '#C8FF00' : e.rate >= 50 ? '#6EE7B7' : '#2D3148'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks */}
        <div className="card">
          <ChartHeader icon={CheckSquare} color="#34D399" title="Tasks Completed" sub="Last 14 days" />
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={taskData} barSize={12} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3148" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Bar dataKey="total" name="Total" fill="#2D3148" radius={[4,4,0,0]} />
              <Bar dataKey="completed" name="Done" fill="#C8FF00" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Streak board — full width */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <ChartHeader icon={Flame} color="#C8FF00" title="Streak Leaderboard" sub="Top habits by streak" />
          {streaks.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              Complete habits to build streaks!
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px 40px' }}>
              {streaks.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '20px', textAlign: 'center', fontSize: '13px', fontWeight: 900, flexShrink: 0,
                    color: i === 0 ? '#C8FF00' : i === 1 ? '#94A3B8' : i === 2 ? '#92400E' : 'var(--text-dim)',
                  }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <div style={{ width: '60px', height: '5px', background: 'var(--bg-elevated)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#C8FF00', borderRadius: '99px',
                        width: streaks[0].streak > 0 ? `${(item.streak / streaks[0].streak) * 100}%` : '0%' }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: item.streak > 0 ? '#C8FF00' : 'var(--text-dim)', minWidth: '28px', textAlign: 'right' }}>
                      {item.streak}d
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
