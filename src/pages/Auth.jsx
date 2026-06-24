import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { Zap, Eye, EyeOff, AlertTriangle } from 'lucide-react'

export default function Auth() {
  const { user } = useAuthStore()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true)
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      })
      if (error) {
        setError(error.message)
      } else if (data?.session) {
        // Email confirmation is OFF — user is logged in immediately, router will redirect
      } else {
        // Email confirmation is ON — ask them to check inbox
        setSuccess('Account created! Check your email to confirm.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>
      {/* Left panel */}
      <div style={{
        display: 'none', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '48px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0F1117 0%, #151721 100%)',
        borderRight: '1px solid var(--border)',
      }} className="lg:flex">
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '15%', right: '-5%', width: '300px', height: '300px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,0,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '-5%', width: '250px', height: '250px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '55%', right: '10%', width: '120px', height: '120px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,0,0.05) 0%, transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '380px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 24px',
            background: '#C8FF00', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(200,255,0,0.35)',
          }} className="animate-pulse-lime">
            <Zap size={32} style={{ color: '#0B0D14' }} strokeWidth={2.5} />
          </div>

          <h1 style={{ fontSize: '40px', fontWeight: 900, color: '#F1F5F9', lineHeight: 1.1, marginBottom: '16px' }}>
            Level up your<br />
            <span style={{ color: '#C8FF00' }}>daily grind.</span>
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
            Track habits, crush goals, and plan your day — all in one premium workspace.
          </p>

          {/* Feature chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {['🔥 Habit Streaks', '🎯 Goal Tracking', '📅 Day Planner', '📊 Analytics', '📓 Journal'].map(f => (
              <span key={f} style={{
                fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '999px',
                background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}
            className="lg:hidden">
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#C8FF00',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} style={{ color: '#0B0D14' }} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)' }}>FlowState</span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text)', marginBottom: '6px' }}>
            {mode === 'signin' ? 'Welcome back 👋' : 'Join the flow ⚡'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>
            {mode === 'signin' ? "Let's get back to crushing it." : 'Start building habits that stick.'}
          </p>

          {/* Not configured */}
          {!isSupabaseConfigured && (
            <div style={{
              marginBottom: '20px', padding: '12px 14px', borderRadius: '12px',
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
              display: 'flex', alignItems: 'flex-start', gap: '10px',
            }}>
              <AlertTriangle size={15} style={{ color: '#FBBF24', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#FBBF24' }}>Supabase not connected</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Add real credentials to <code style={{ color: 'var(--text)' }}>.env</code> to enable auth.
                </p>
              </div>
            </div>
          )}

          {/* Mode toggle */}
          <div style={{
            display: 'flex', padding: '4px', borderRadius: '12px',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: '24px',
          }}>
            {['signin', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
                flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease',
                background: mode === m ? 'var(--bg-card)' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
              }}>
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Full Name</label>
                <input id="auth-name" type="text" className="input" placeholder="Alex Johnson"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Email</label>
              <input id="auth-email" type="email" className="input" placeholder="alex@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input id="auth-password" type={showPass ? 'text' : 'password'} className="input"
                  style={{ paddingRight: '40px' }} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#F87171' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399' }}>
                {success}
              </div>
            )}

            <button id="auth-submit" type="submit" disabled={loading} className="btn-lime"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '15px', fontWeight: 800,
                opacity: loading ? 0.7 : 1, marginTop: '4px' }}>
              {loading ? 'Loading...' : mode === 'signin' ? '→ Sign In' : '→ Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '24px' }}>
            Track habits. Plan your day. Achieve your goals.
          </p>
        </div>
      </div>
    </div>
  )
}
