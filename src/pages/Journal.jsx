import { useState, useEffect } from 'react'
import { BookOpen, Save } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useJournalStore } from '../store/useJournalStore'
import MoodPicker, { MOODS } from '../components/MoodPicker'

const fmtDate = ds => new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

export default function Journal() {
  const { user } = useAuthStore()
  const { fetchEntries, saveEntry, entries, getEntryForDate } = useJournalStore()
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = getEntryForDate(today)

  const [mood, setMood] = useState(todayEntry?.mood || null)
  const [note, setNote] = useState(todayEntry?.note || '')
  const [gratitude, setGratitude] = useState(todayEntry?.gratitude || ['', '', ''])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (user) fetchEntries(user.id) }, [user])
  useEffect(() => {
    if (todayEntry) { setMood(todayEntry.mood || null); setNote(todayEntry.note || ''); setGratitude(todayEntry.gratitude || ['', '', '']) }
  }, [todayEntry?.id])

  const handleSave = async () => {
    if (!user) return; setSaving(true)
    const { error } = await saveEntry(user.id, { entry_date: today, mood, note, gratitude: gratitude.filter(g => g.trim()) })
    setSaving(false)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  const updateGratitude = (i, val) => setGratitude(p => { const n = [...p]; n[i] = val; return n })
  const pastEntries = entries.filter(e => e.entry_date !== today)
  const S = { label: { fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' } }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '860px', margin: '0 auto' }} className="animate-fade-up">

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Daily Journal</p>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen size={26} style={{ color: '#C8FF00' }} /> Today's Entry
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '36px' }}>{fmtDate(today)}</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        {/* Mood */}
        <div style={{ marginBottom: '24px' }}>
          <label style={S.label}>🎭 Vibe Check</label>
          <MoodPicker value={mood} onChange={setMood} />
        </div>

        {/* Note */}
        <div style={{ marginBottom: '24px' }}>
          <label style={S.label}>✍️ Today's Reflection</label>
          <textarea id="journal-note" value={note} onChange={e => setNote(e.target.value)}
            className="input" style={{ resize: 'none', height: '120px', lineHeight: 1.6 }}
            placeholder="What happened today? What did you learn? What are you proud of?" />
        </div>

        {/* Gratitude */}
        <div style={{ marginBottom: '24px' }}>
          <label style={S.label}>🙏 Grateful For...</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: '#C8FF00', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 900, color: '#0B0D14',
                }}>
                  {i + 1}
                </div>
                <input id={`gratitude-${i}`} type="text" className="input"
                  placeholder={['My health and energy', 'The people around me', 'Today\'s small wins'][i]}
                  value={gratitude[i] || ''} onChange={e => updateGratitude(i, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <button id="journal-save" onClick={handleSave} disabled={saving} className="btn-lime"
          style={{ opacity: saving ? 0.7 : 1 }}>
          <Save size={15} strokeWidth={2.5} />
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Entry'}
        </button>
      </div>

      {/* Past entries */}
      {pastEntries.length > 0 && (
        <div>
          <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Past Entries</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pastEntries.map(entry => {
              const moodData = MOODS.find(m => m.value === entry.mood)
              return (
                <div key={entry.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{fmtDate(entry.entry_date)}</h3>
                    {moodData && <span style={{ fontSize: '20px' }} title={moodData.label}>{moodData.emoji}</span>}
                  </div>
                  {entry.note && (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '10px',
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {entry.note}
                    </p>
                  )}
                  {entry.gratitude?.filter(Boolean).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {entry.gratitude.filter(Boolean).map((g, i) => (
                        <span key={i} className="badge-lime">🙏 {g}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
