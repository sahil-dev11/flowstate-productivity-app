import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Trophy, Plus, Pencil, Trash2, RotateCcw, Archive,
  Target, Flame, TrendingUp, CheckCircle, X, Calendar, Star
} from 'lucide-react'
import { useChallengeStore, getCurrentDay, computeStreak } from '../store/useChallengeStore'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

// ─── Confetti ────────────────────────────────────────────────────────────────

function useConfetti() {
  const [particles, setParticles] = useState([])

  const fire = useCallback(() => {
    const COLORS = ['#C8FF00', '#FFD700', '#A78BFA', '#34D399', '#F472B6', '#38BDF8', '#FF6B6B']
    const count = 80
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      x:     `${Math.random() * 100}vw`,
      drift: `${(Math.random() - 0.5) * 200}px`,
      spin:  `${Math.random() * 720 - 360}deg`,
      duration: `${0.9 + Math.random() * 0.8}s`,
      delay:    `${Math.random() * 0.4}s`,
      size:     `${5 + Math.random() * 7}px`,
      shape:    Math.random() > 0.5 ? '50%' : '2px',
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 2500)
  }, [])

  return { particles, fire }
}

// ─── Day Grid ─────────────────────────────────────────────────────────────────

function DayGrid({ challenge, onToggle }) {
  const { getCompletedDays } = useChallengeStore()
  const completedDays = getCompletedDays(challenge.id)
  const currentDay = getCurrentDay(challenge.start_date)

  const handleToggle = (dayNum) => {
    if (dayNum > currentDay) return
    onToggle(challenge.id, dayNum)
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '6px',
      marginTop: '16px',
    }}>
      {Array.from({ length: 21 }, (_, i) => {
        const dayNum    = i + 1
        const isDone    = completedDays.includes(dayNum)
        const isFuture  = dayNum > currentDay
        const isToday   = dayNum === currentDay

        let cls = 'day-box'
        if (isDone)   cls += ' day-box-complete animate-day-pop'
        else if (isFuture) cls += ' day-box-future'
        else if (isToday)  cls += ' day-box-today'

        return (
          <button
            key={dayNum}
            className={cls}
            onClick={() => handleToggle(dayNum)}
            disabled={isFuture}
            title={isFuture ? `Day ${dayNum} — not yet` : `Day ${dayNum}`}
            style={{ animationDelay: isDone ? `${i * 0.03}s` : '0s' }}
          >
            {isDone ? (
              <Trophy
                size={14}
                strokeWidth={2.5}
                style={{ color: '#C8FF00' }}
                className="animate-trophy"
              />
            ) : (
              <span style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1 }}>{dayNum}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Challenge Card ───────────────────────────────────────────────────────────

function ChallengeCard({ challenge, onEdit, onRestart, onArchive, onDelete, onToggle }) {
  const { getCompletedDays } = useChallengeStore()
  const completedDays = getCompletedDays(challenge.id)
  const currentDay    = getCurrentDay(challenge.start_date)
  const streak        = computeStreak(completedDays)
  const pct           = Math.round((completedDays.length / 21) * 100)
  const isCompleted   = challenge.status === 'completed'
  const isArchived    = challenge.status === 'archived'

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  return (
    <>
      <div className={`challenge-card${isCompleted ? ' challenge-card-completed' : ''}`}>
        {/* Gold glow for completed */}
        {isCompleted && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '20px', pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 70%)',
          }} />
        )}

        {/* Card header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
              background: isCompleted ? 'rgba(212,175,55,0.15)' : 'rgba(200,255,0,0.1)',
              border: `1px solid ${isCompleted ? 'rgba(212,175,55,0.3)' : 'rgba(200,255,0,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px',
            }}>
              {challenge.icon || '🏆'}
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', marginBottom: '3px', lineHeight: 1.2 }}>
                {challenge.name}
              </h3>
              {challenge.description && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {challenge.description}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            {!isArchived && (
              <ActionBtn icon={Pencil} color="#C8FF00" title="Edit" onClick={() => onEdit(challenge)} />
            )}
            <ActionBtn icon={RotateCcw} color="#38BDF8" title="Restart" onClick={() => onRestart(challenge.id)} />
            {!isArchived && (
              <ActionBtn icon={Archive} color="#94A3B8" title="Archive" onClick={() => onArchive(challenge.id)} />
            )}
            <ActionBtn icon={Trash2} color="#F87171" title="Delete" onClick={() => setShowDeleteConfirm(true)} />
          </div>
        </div>

        {/* Completed banner */}
        {isCompleted && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderRadius: '12px', marginBottom: '14px',
            background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)',
          }}>
            <Trophy size={16} style={{ color: '#D4AF37' }} strokeWidth={2.5} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 800, color: '#D4AF37' }}>🏆 Challenge Completed!</p>
              {challenge.completed_at && (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {fmtDate(challenge.completed_at.split('T')[0])} ·{' '}
                  {new Date(challenge.completed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
          <MiniStat label="Progress" value={`${pct}%`} color="#C8FF00" />
          <MiniStat label={`Day`} value={`${Math.min(currentDay, 21)}/21`} color="#38BDF8" />
          <MiniStat label="Streak" value={`${streak}d`} color="#A78BFA" />
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '6px' }}>
          <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: isCompleted
                ? 'linear-gradient(90deg, #D4AF37, #FFD700)'
                : 'linear-gradient(90deg, #C8FF00, #A8D800)',
              borderRadius: '99px',
              transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        </div>

        {/* Dates */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={10} /> {fmtDate(challenge.start_date)}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>→</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={10} /> {fmtDate(challenge.end_date)}
          </span>
        </div>

        {/* Toggle grid button */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.06em', padding: 0,
            marginBottom: expanded ? '8px' : '0',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#C8FF00'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <span style={{ transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s ease' }}>›</span>
          {expanded ? 'Hide' : 'Show'} 21-day grid
        </button>

        {/* 21-day grid */}
        {expanded && <DayGrid challenge={challenge} onToggle={onToggle} />}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        message={`"${challenge.name}" and all progress will be permanently deleted.`}
        onConfirm={() => { setShowDeleteConfirm(false); onDelete(challenge.id) }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}

function ActionBtn({ icon: Icon, color, title, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border)',
        background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = color; e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}15` }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)' }}
    >
      <Icon size={13} strokeWidth={2} />
    </button>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{
      padding: '8px 10px', borderRadius: '10px',
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: '16px', fontWeight: 900, color }}>{value}</p>
      <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>{label}</p>
    </div>
  )
}

// ─── Stats Cards ─────────────────────────────────────────────────────────────

function StatsOverview({ stats }) {
  const cards = [
    { label: 'Active Challenges',    value: stats.active,      icon: Flame,       color: '#C8FF00' },
    { label: 'Completed Challenges', value: stats.completed,   icon: CheckCircle, color: '#34D399' },
    { label: 'Longest Streak',       value: `${stats.longestStreak}d`, icon: TrendingUp, color: '#A78BFA' },
    { label: 'Overall Completion',   value: `${stats.overallPct}%`,    icon: Target,     color: '#38BDF8' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }} className="stagger">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0,
            background: `${color}15`, border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} style={{ color }} strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '3px' }}>{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Challenge Modal ──────────────────────────────────────────────────────────

const ICONS = ['🏆','💪','📚','☕','🧘','💧','🌅','🚴','✍️','🍎','🎯','🔥','⚡','🌿','🏃','🎵','🧠','💻','🌊','✨']
const EMPTY = { name: '', description: '', icon: '🏆', start_date: new Date().toISOString().split('T')[0] }

function ChallengeModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (isOpen) setForm(initialData ? { ...EMPTY, ...initialData } : EMPTY)
  }, [isOpen, initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
    onClose()
  }

  const endDate = (() => {
    if (!form.start_date) return ''
    const d = new Date(form.start_date)
    d.setDate(d.getDate() + 20)
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  })()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? '✏️ Edit Challenge' : '🏆 New Challenge'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Challenge Name</label>
          <input className="input" placeholder="e.g. Morning Workout" required autoFocus
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Description (optional)</label>
          <input className="input" placeholder="What's this challenge about?"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input type="date" className="input"
            value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
          {endDate && (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={11} /> Ends {endDate}
            </p>
          )}
        </div>
        <div>
          <label style={labelStyle}>Icon</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {ICONS.map(icon => (
              <button
                key={icon} type="button"
                onClick={() => setForm(f => ({ ...f, icon }))}
                style={{
                  width: '38px', height: '38px', borderRadius: '10px', fontSize: '18px',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  background: form.icon === icon ? 'rgba(200,255,0,0.15)' : 'var(--bg-elevated)',
                  border: `1.5px solid ${form.icon === icon ? 'rgba(200,255,0,0.5)' : 'var(--border)'}`,
                  transform: form.icon === icon ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button type="submit" className="btn-lime" style={{ flex: 1, justifyContent: 'center' }}>
            {initialData ? 'Save Changes' : 'Start Challenge'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.08em', marginBottom: '6px',
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Challenge() {
  const { challenges, addChallenge, updateChallenge, deleteChallenge, archiveChallenge, restartChallenge, toggleDay, getStats } = useChallengeStore()
  const [showModal, setShowModal] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState(null)
  const { particles, fire: fireConfetti } = useConfetti()

  const stats = getStats()
  const visibleChallenges = challenges.filter(c => c.status !== 'archived')
  const archivedChallenges = challenges.filter(c => c.status === 'archived')

  const handleSave = (formData) => {
    if (editingChallenge) {
      updateChallenge(editingChallenge.id, formData)
    } else {
      addChallenge(formData)
    }
    setEditingChallenge(null)
  }

  const handleEdit = (challenge) => {
    setEditingChallenge(challenge)
    setShowModal(true)
  }

  const handleOpenModal = () => {
    setEditingChallenge(null)
    setShowModal(true)
  }

  // We listen for completion by wrapping toggleDay
  const handleToggleDay = (challengeId, dayNumber) => {
    const justCompleted = toggleDay(challengeId, dayNumber)
    if (justCompleted) fireConfetti()
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1300px', margin: '0 auto' }} className="animate-fade-up">

      {/* Confetti overlay */}
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            '--x': p.x,
            '--drift': p.drift,
            '--spin': p.spin,
            '--duration': p.duration,
            '--delay': p.delay,
            left: p.x,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: p.shape,
            background: p.color,
          }}
        />
      ))}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
            Consistency
          </p>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Trophy size={26} style={{ color: '#C8FF00' }} strokeWidth={2.5} />
            21 Day Challenge
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>
            Build consistency one day at a time.
          </p>
        </div>
        <button onClick={handleOpenModal} className="btn-lime">
          <Plus size={15} strokeWidth={3} /> New Challenge
        </button>
      </div>

      {/* Stats */}
      <StatsOverview stats={stats} />

      {/* Overall progress bar */}
      {(stats.totalPossible > 0) && (
        <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Star size={14} style={{ color: '#C8FF00' }} strokeWidth={2.5} />
              Overall Progress
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#C8FF00' }}>
              {stats.totalDone} / {stats.totalPossible} Days Completed
            </span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${stats.overallPct}%`,
              background: 'linear-gradient(90deg, #C8FF00, #A8D800)',
              borderRadius: '99px',
              transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: '0 0 8px rgba(200,255,0,0.4)',
            }} />
          </div>
        </div>
      )}

      {/* Challenge cards */}
      {visibleChallenges.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🏆</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
            No challenges yet
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '320px', margin: '0 auto 24px' }}>
            Start your first 21 Day Challenge and build a habit that sticks.
          </p>
          <button onClick={handleOpenModal} className="btn-lime">
            <Plus size={15} strokeWidth={3} /> Create Your First Challenge
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '20px' }}>
          {visibleChallenges.map(c => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              onEdit={handleEdit}
              onRestart={restartChallenge}
              onArchive={archiveChallenge}
              onDelete={deleteChallenge}
              onToggle={handleToggleDay}
            />
          ))}
        </div>
      )}

      {/* Archived section */}
      {archivedChallenges.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Archive size={12} /> Archived ({archivedChallenges.length})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '16px', opacity: 0.6 }}>
            {archivedChallenges.map(c => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onEdit={handleEdit}
                onRestart={restartChallenge}
                onArchive={archiveChallenge}
                onDelete={deleteChallenge}
                onToggle={handleToggleDay}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <ChallengeModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingChallenge(null) }}
        onSave={handleSave}
        initialData={editingChallenge}
      />
    </div>
  )
}
