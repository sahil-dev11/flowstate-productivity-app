import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'

// Pages
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import Habits from './pages/Habits'
import Goals from './pages/Goals'
import Analytics from './pages/Analytics'
import Journal from './pages/Journal'
import Settings from './pages/Settings'

function PrivateRoute() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F5A623, #FFD700)', boxShadow: '0 0 24px rgba(245,166,35,0.4)' }}
          >
            <span className="text-black text-xl">⚡</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: '#F5A623',
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  opacity: 0.4,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: '68px', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  )


}

export default function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </BrowserRouter>
  )
}
