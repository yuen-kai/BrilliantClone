import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { ReactNode } from 'react'

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, isConfigured, demoMode } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-gate-loading">
        <p>Loading…</p>
      </div>
    )
  }

  if (!isConfigured || demoMode) {
    return <>{children}</>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
