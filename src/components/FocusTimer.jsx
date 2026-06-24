import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react'

const MODES = {
  work:  { label: 'Focus', duration: 25 * 60, color: '#C8FF00', textColor: '#0B0D14', icon: Brain },
  break: { label: 'Break', duration: 5 * 60,  color: '#A78BFA', textColor: '#0B0D14', icon: Coffee },
}

export default function FocusTimer() {
  const [mode, setMode] = useState('work')
  const [seconds, setSeconds] = useState(MODES.work.duration)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setRunning(false)
            clearInterval(intervalRef.current)
            const next = mode === 'work' ? 'break' : 'work'
            setMode(next)
            return MODES[next].duration
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, mode])

  const switchMode = (m) => { setRunning(false); setMode(m); setSeconds(MODES[m].duration) }
  const reset = () => { setRunning(false); setSeconds(MODES[mode].duration) }

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  const m = MODES[mode]
  const r = 50, circ = 2 * Math.PI * r
  const progress = 1 - seconds / m.duration

  return (
    <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px' }}>
      {/* Mode tabs */}
      <div style={{
        display: 'flex', gap: '4px', padding: '4px',
        background: 'var(--bg-card)', borderRadius: '12px',
        border: '1px solid var(--border)', marginBottom: '20px',
      }}>
        {Object.entries(MODES).map(([key, md]) => (
          <button key={key} onClick={() => switchMode(key)} style={{
            padding: '6px 16px', borderRadius: '9px', border: 'none',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: mode === key ? md.color : 'transparent',
            color: mode === key ? md.textColor : 'var(--text-muted)',
          }}>
            {md.label}
          </button>
        ))}
      </div>

      {/* Circular progress */}
      <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '20px' }}>
        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="65" cy="65" r={r} fill="none" stroke="var(--bg-card)" strokeWidth="8" />
          <circle
            cx="65" cy="65" r={r} fill="none"
            stroke={m.color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress)}
            style={{
              transition: 'stroke-dashoffset 1s linear',
              filter: `drop-shadow(0 0 6px ${m.color}80)`,
            }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>
            {mins}:{secs}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: m.color, marginTop: '2px' }}>{m.label}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={reset} style={{
          width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)',
          background: 'var(--bg-card)', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
          transition: 'all 0.2s ease',
        }}>
          <RotateCcw size={14} />
        </button>
        <button onClick={() => setRunning(!running)} style={{
          width: '48px', height: '48px', borderRadius: '13px', border: 'none',
          background: m.color, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: running ? `0 0 20px ${m.color}50` : 'none',
        }}>
          {running
            ? <Pause size={18} strokeWidth={2.5} style={{ color: m.textColor }} />
            : <Play size={18} strokeWidth={2.5} style={{ color: m.textColor, marginLeft: '2px' }} />
          }
        </button>
      </div>
    </div>
  )
}
