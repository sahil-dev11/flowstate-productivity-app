import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Flame, Target,
  BarChart2, BookOpen, Settings, LogOut, Zap
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: Calendar,        label: 'Planner',   to: '/planner' },
  { icon: Flame,           label: 'Habits',    to: '/habits' },
  { icon: Target,          label: 'Goals',     to: '/goals' },
  { icon: BarChart2,       label: 'Analytics', to: '/analytics' },
  { icon: BookOpen,        label: 'Journal',   to: '/journal' },
]

// Individual nav item — tracks its own hover state in React
function NavItem({ icon: Icon, label, to, exact, expanded }) {
  const [hovered, setHovered] = useState(false)
  return (
    <NavLink
      to={to}
      end={exact}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 10px', borderRadius: '11px',
        textDecoration: 'none',
        background: isActive ? '#C8FF00' : hovered ? '#1C1F2E' : 'transparent',
        transition: 'background 0.15s ease',
      })}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            strokeWidth={isActive ? 2.5 : 1.75}
            style={{ color: isActive ? '#0B0D14' : hovered ? '#F1F5F9' : '#64748B', flexShrink: 0 }}
          />
          <span style={{
            fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
            color: isActive ? '#0B0D14' : hovered ? '#F1F5F9' : '#94A3B8',
            opacity: expanded ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

function SettingsItem({ expanded }) {
  const [hovered, setHovered] = useState(false)
  return (
    <NavLink
      to="/settings"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 10px', borderRadius: '11px', textDecoration: 'none',
        background: isActive ? '#C8FF00' : hovered ? '#1C1F2E' : 'transparent',
        transition: 'background 0.15s ease',
      })}
    >
      {({ isActive }) => (
        <>
          <Settings size={18} strokeWidth={1.75}
            style={{ color: isActive ? '#0B0D14' : hovered ? '#F1F5F9' : '#64748B', flexShrink: 0 }} />
          <span style={{
            fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
            color: isActive ? '#0B0D14' : hovered ? '#F1F5F9' : '#94A3B8',
            opacity: expanded ? 1 : 0, transition: 'opacity 0.15s ease',
          }}>
            Settings
          </span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const [signoutHovered, setSignoutHovered] = useState(false)
  const { signOut, profile } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => { await signOut(); navigate('/auth') }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        position: 'fixed', left: 0, top: 0, height: '100%', zIndex: 50,
        display: 'flex', flexDirection: 'column',
        width: expanded ? '220px' : '68px',
        background: '#0B0D14',
        borderRight: '1px solid #1C1F2E',
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 14px', flexShrink: 0 }}>
        <div style={{
          flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px',
          background: '#C8FF00', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 12px rgba(200,255,0,0.3)',
        }}>
          <Zap size={18} style={{ color: '#0B0D14' }} strokeWidth={3} />
        </div>
        <span style={{
          fontWeight: 900, color: '#F1F5F9', fontSize: '16px', whiteSpace: 'nowrap',
          opacity: expanded ? 1 : 0, transition: 'opacity 0.15s ease', pointerEvents: 'none',
        }}>
          FlowState
        </span>
      </div>

      {/* User avatar */}
      {profile && (
        <div style={{ padding: '0 10px 12px', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '12px',
            background: '#151721', border: '1px solid #2D3148',
          }}>
            <div style={{
              flexShrink: 0, width: '32px', height: '32px', borderRadius: '9px',
              background: '#C8FF00', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 900, color: '#0B0D14',
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: expanded ? 1 : 0, transition: 'opacity 0.15s ease' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#F1F5F9' }}>{profile.full_name || 'User'}</p>
              <p style={{ fontSize: '10px', color: '#34D399' }}>● Active</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: '1px', background: '#1C1F2E', margin: '0 10px 8px', flexShrink: 0 }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(item => (
          <NavItem key={item.to} {...item} exact={item.to === '/'} expanded={expanded} />
        ))}
      </nav>

      <div style={{ height: '1px', background: '#1C1F2E', margin: '8px 10px', flexShrink: 0 }} />

      {/* Bottom */}
      <div style={{ padding: '0 8px 12px', display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
        <SettingsItem expanded={expanded} />
        <button
          onClick={handleSignOut}
          onMouseEnter={() => setSignoutHovered(true)}
          onMouseLeave={() => setSignoutHovered(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '11px',
            background: signoutHovered ? 'rgba(248,113,113,0.1)' : 'transparent',
            border: 'none', cursor: 'pointer', width: '100%',
            transition: 'background 0.15s ease',
          }}
        >
          <LogOut size={18} strokeWidth={1.75} style={{ color: '#F87171', flexShrink: 0 }} />
          <span style={{
            fontSize: '13px', fontWeight: 700, color: '#F87171', whiteSpace: 'nowrap',
            opacity: expanded ? 1 : 0, transition: 'opacity 0.15s ease',
          }}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  )
}
