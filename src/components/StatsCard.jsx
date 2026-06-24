export default function StatsCard({ icon: Icon, label, value, sub, accent = '#C8FF00' }) {
  return (
    <div
      className="card group cursor-default"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Subtle glow top-right */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px', borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'var(--text-muted)'
        }}>
          {label}
        </span>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: `${accent}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${accent}25`,
        }}>
          <Icon size={16} style={{ color: accent }} strokeWidth={2.5} />
        </div>
      </div>

      <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', lineHeight: 1, marginBottom: '6px' }}>
        {value ?? '—'}
      </p>
      {sub && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{sub}</p>
      )}
    </div>
  )
}
