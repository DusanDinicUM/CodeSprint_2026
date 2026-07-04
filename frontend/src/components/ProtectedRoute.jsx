import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Guards a route by login, and optionally by minimum role
 * (mirrors backend RBAC so the UI never shows a control the API would reject).
 */
export default function ProtectedRoute({ children, minRole }) {
  const { user, loading, hasRole } = useAuth()

  if (loading) return <div className="p-8 text-ink/60">Loading…</div>
  if (!user) return <Navigate to="/staff/login" replace />
  if (minRole && !hasRole(minRole)) return <Navigate to="/staff/dashboard" replace />
  return children
}
