import { useState, useEffect } from 'react'
import { Settings, Save, User, Globe } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

const TZS = ['Asia/Kolkata','America/New_York','America/Los_Angeles','America/Chicago','Europe/London','Europe/Paris','Europe/Berlin','Asia/Tokyo','Asia/Singapore','Australia/Sydney','Pacific/Auckland']

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuthStore()
  const [name, setName] = useState(profile?.full_name || '')
  const [timezone, setTimezone] = useState(profile?.timezone || 'Asia/Kolkata')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) { setName(profile.full_name || ''); setTimezone(profile.timezone || 'Asia/Kolkata') }
  }, [profile])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    const { error } = await updateProfile({ full_name: name, timezone })
    setSaving(false)
    if (error) setError(error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U'
  const S = { label: { fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' } }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '640px', margin: '0 auto' }} className="animate-fade-up">

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Account</p>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={26} style={{ color: '#C8FF00' }} /> Settings
        </h1>
      </div>

      {/* Avatar card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '18px', flexShrink: 0,
          background: '#C8FF00', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 900, color: '#0B0D14',
          boxShadow: '0 0 20px rgba(200,255,0,0.25)',
        }}>
          {initials}
        </div>
        <div>
          <p style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text)', marginBottom: '2px' }}>{name || 'Your Name'}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.email}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34D399' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#34D399' }}>Active</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={15} style={{ color: '#C8FF00' }} /> Profile Settings
        </h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={S.label}>Full Name</label>
            <input id="settings-name" type="text" className="input"
              value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label style={S.label}>Email</label>
            <input type="email" className="input" style={{ opacity: 0.5, cursor: 'not-allowed' }}
              value={user?.email || ''} readOnly />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Email cannot be changed here</p>
          </div>
          <div>
            <label style={{ ...S.label, display: 'flex', alignItems: 'center', gap: '5px' }}><Globe size={10} />Timezone</label>
            <select id="settings-timezone" className="input"
              value={timezone} onChange={e => setTimezone(e.target.value)}>
              {TZS.map(tz => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
            </select>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#F87171' }}>
              {error}
            </div>
          )}

          <button id="settings-save" type="submit" disabled={saving} className="btn-lime"
            style={{ opacity: saving ? 0.7 : 1 }}>
            <Save size={15} strokeWidth={2.5} />
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', marginBottom: '14px' }}>About FlowState</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {[['Version', '1.0.0'], ['Stack', 'React + Vite + Supabase'], ['Made with', '⚡ + ☕']].map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: '1px solid var(--border)',
            }} className="last:border-0">
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{k}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
