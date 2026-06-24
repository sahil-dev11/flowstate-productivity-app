import { useMemo } from 'react'

// Lime-green intensity scale
function getColor(count) {
  if (count === 0) return null          // empty — show outlined cell
  if (count === 1) return '#3D5C00'     // dim lime
  if (count === 2) return '#6B9E00'     // mid lime
  if (count === 3) return '#A8D800'     // bright lime
  return '#C8FF00'                      // full lime glow
}

function getLast365Days() {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function HabitHeatmap({ habitLogs, habitId }) {
  const days = useMemo(() => getLast365Days(), [])

  const countMap = useMemo(() => {
    const map = {}
    const logs = habitId ? habitLogs.filter(l => l.habit_id === habitId) : habitLogs
    for (const log of logs) {
      map[log.completed_on] = (map[log.completed_on] || 0) + 1
    }
    return map
  }, [habitLogs, habitId])

  // Pad so grid starts on Sunday
  const firstDate = new Date(days[0])
  const startDow  = firstDate.getDay()
  const paddedDays = [...Array(startDow).fill(null), ...days]

  const weeks = []
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7))
  }

  // Month label positions
  const monthPositions = useMemo(() => {
    const positions = []
    let lastMonth = -1
    weeks.forEach((week, wi) => {
      for (const d of week) {
        if (d) {
          const month = new Date(d).getMonth()
          if (month !== lastMonth) {
            positions.push({ week: wi, label: MONTH_LABELS[month] })
            lastMonth = month
          }
          break
        }
      }
    })
    return positions
  }, [weeks])

  const CELL  = 13   // px per cell
  const GAP   = 3    // px gap between cells

  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
      <div style={{ minWidth: `${weeks.length * (CELL + GAP) + 30}px`, paddingBottom: '4px' }}>

        {/* Month labels row */}
        <div style={{ display: 'flex', paddingLeft: '30px', marginBottom: '6px' }}>
          {weeks.map((_, wi) => {
            const mp = monthPositions.find(m => m.week === wi)
            return (
              <div
                key={wi}
                style={{
                  width: `${CELL + GAP}px`,
                  flexShrink: 0,
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {mp ? mp.label : ''}
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {/* Day-of-week labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px`, marginRight: '6px', flexShrink: 0, width: '24px' }}>
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                style={{
                  height: `${CELL}px`,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '9px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  // Only show M, W, F to avoid crowding
                  opacity: [1, 3, 5].includes(i) ? 1 : 0,
                }}
              >
                {label[0]}
              </div>
            ))}
          </div>

          {/* Cell grid */}
          <div style={{ display: 'flex', gap: `${GAP}px` }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}>
                {week.map((day, di) => {
                  const count  = day ? (countMap[day] || 0) : 0
                  const filled = getColor(count)
                  const isToday = day === new Date().toISOString().split('T')[0]

                  return (
                    <div
                      key={di}
                      title={day ? `${day}: ${count} completion${count !== 1 ? 's' : ''}` : ''}
                      style={{
                        width:  `${CELL}px`,
                        height: `${CELL}px`,
                        borderRadius: '3px',
                        flexShrink: 0,
                        cursor: day ? 'pointer' : 'default',
                        transition: 'all 0.15s ease',
                        // Key: always show a visible cell with border
                        background: !day
                          ? 'transparent'
                          : filled
                            ? filled
                            : 'var(--bg-elevated)',
                        border: !day
                          ? 'none'
                          : filled
                            ? `1px solid ${filled}80`
                            : '1px solid var(--border)',
                        boxShadow: filled && count >= 3
                          ? `0 0 6px ${filled}60`
                          : isToday
                            ? '0 0 0 2px #C8FF00'
                            : 'none',
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginTop: '10px', justifyContent: 'flex-end',
        }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>Less</span>
          {[null, 1, 2, 3, 4].map((c, i) => (
            <div
              key={i}
              style={{
                width: `${CELL}px`, height: `${CELL}px`, borderRadius: '3px', flexShrink: 0,
                background: c === null ? 'var(--bg-elevated)' : getColor(c),
                border: c === null ? '1px solid var(--border)' : `1px solid ${getColor(c)}80`,
                boxShadow: c !== null && c >= 3 ? `0 0 5px ${getColor(c)}60` : 'none',
              }}
            />
          ))}
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>More</span>
        </div>

      </div>
    </div>
  )
}
