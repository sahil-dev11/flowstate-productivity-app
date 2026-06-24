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

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false)
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
      className="fixed left-0 top-0 h-full z-50 flex flex-col overflow-hidden"
      style={{
        width: expanded ? '220px' : '68px',
        background: '#0B0D14',
        borderRight: '1px solid #1C1F2E',
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 flex-shrink-0">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center animate-pulse-lime"
          style={{ background: '#C8FF00' }}
        >
          <Zap size={18} style={{ color: '#0B0D14' }} strokeWidth={3} />
        </div>
        <span
          className="font-black text-white text-base whitespace-nowrap overflow-hidden transition-all duration-300"
          style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? '160px' : '0px' }}
        >
          FlowState
        </span>
      </div>

      {/* User pill */}
      {profile && (
        <div className="mx-3 mb-5 flex-shrink-0">
          <div className="flex items-center gap-2.5 rounded-xl overflow-hidden"
            style={{ background: '#151721', padding: '8px 10px', border: '1px solid #2D3148' }}>
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
              style={{ background: '#C8FF00', color: '#0B0D14' }}>
              {initials}
            </div>
            <div className="overflow-hidden transition-all duration-300"
              style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? '140px' : '0px' }}>
              <p className="text-white text-xs font-bold whitespace-nowrap truncate">{profile.full_name || 'User'}</p>
              <p className="text-xs whitespace-nowrap" style={{ color: '#34D399' }}>● Active</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 flex flex-col gap-1 overflow-hidden">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            className="flex items-center gap-3 rounded-xl transition-all duration-200 overflow-hidden"
            style={({ isActive }) => ({
              padding: '10px 12px',
              background: isActive ? '#C8FF00' : 'transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <div
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
                  style={{ filter: isActive ? 'none' : `drop-shadow(0 0 0 transparent)` }}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 1.75}
                    style={{ color: isActive ? '#0B0D14' : '#64748B' }}
                  />
                </div>
                <span
                  className="text-sm font-bold whitespace-nowrap overflow-hidden transition-all duration-300"
                  style={{
                    color: isActive ? '#0B0D14' : '#94A3B8',
                    opacity: expanded ? 1 : 0,
                    maxWidth: expanded ? '130px' : '0px',
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 flex flex-col gap-1 flex-shrink-0"
        style={{ borderTop: '1px solid #1C1F2E' }}>
        <NavLink to="/settings"
          className="flex items-center gap-3 rounded-xl transition-all duration-200 overflow-hidden"
          style={({ isActive }) => ({
            padding: '10px 12px',
            background: isActive ? '#C8FF00' : 'transparent',
          })}
        >
          {({ isActive }) => (
            <>
              <Settings size={18} strokeWidth={1.75} style={{ color: isActive ? '#0B0D14' : '#64748B' }} />
              <span className="text-sm font-bold whitespace-nowrap overflow-hidden transition-all duration-300"
                style={{ color: isActive ? '#0B0D14' : '#94A3B8', opacity: expanded ? 1 : 0, maxWidth: expanded ? '130px' : '0px' }}>
                Settings
              </span>
            </>
          )}
        </NavLink>

        <button onClick={handleSignOut}
          className="flex items-center gap-3 rounded-xl transition-all duration-200 overflow-hidden"
          style={{ padding: '10px 12px' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={18} strokeWidth={1.75} style={{ color: '#F87171' }} />
          <span className="text-sm font-bold whitespace-nowrap overflow-hidden transition-all duration-300"
            style={{ color: '#F87171', opacity: expanded ? 1 : 0, maxWidth: expanded ? '130px' : '0px' }}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  )
}
