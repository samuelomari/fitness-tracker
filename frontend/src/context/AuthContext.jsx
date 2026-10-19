import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('fittrack_user')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(() => {
    return Boolean(localStorage.getItem('token') && !localStorage.getItem('fittrack_user'))
  })

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) {
      setUser(null)
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then((r) => {
        setUser(r.data)
        localStorage.setItem('fittrack_user', JSON.stringify(r.data))
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('fittrack_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', r.data.token)
    localStorage.setItem('fittrack_user', JSON.stringify(r.data.user))
    setUser(r.data.user)
    return r.data.user
  }

  const register = async (payload) => {
    const r = await api.post('/auth/register', payload)
    localStorage.setItem('token', r.data.token)
    localStorage.setItem('fittrack_user', JSON.stringify(r.data.user))
    setUser(r.data.user)
    return r.data.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('fittrack_user')
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
