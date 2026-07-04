import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    api.me().then(setUser).catch(() => localStorage.removeItem('access_token')).finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const data = await api.login(email, password)
    localStorage.setItem('access_token', data.access_token)
    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem('access_token')
    setUser(null)
  }

  // Role hierarchy mirrors the backend (security.py) so UI can hide
  // controls the user can't use, without duplicating auth logic.
  const rank = { auditor: 0, manager: 1, admin: 2 }
  const hasRole = (minimum) => user && rank[user.role] >= rank[minimum]

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
