const MOODS = [
  { value: 1, emoji: '😫', label: 'Rough' },
  { value: 2, emoji: '😞', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🤩', label: 'Fire!' },
]

export default function MoodPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {MOODS.map((mood) => {
        const active = value === mood.value
        return (
          <button
            key={mood.value}
            onClick={() => onChange(mood.value)}
            title={mood.label}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '6px', padding: '10px 12px', borderRadius: '12px',
              cursor: 'pointer', transition: 'all 0.2s ease',
              background: active ? '#C8FF00' : 'var(--bg-elevated)',
              border: `1.5px solid ${active ? '#C8FF00' : 'var(--border)'}`,
              transform: active ? 'scale(1.1)' : 'scale(1)',
              boxShadow: active ? '0 0 16px rgba(200,255,0,0.35)' : 'none',
            }}
          >
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{mood.emoji}</span>
            <span style={{
              fontSize: '10px', fontWeight: 700,
              color: active ? '#0B0D14' : 'var(--text-muted)'
            }}>
              {mood.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export { MOODS }
