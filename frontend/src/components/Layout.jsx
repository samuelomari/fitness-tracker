import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/workouts', label: 'Workouts' },
    { to: '/routines', label: 'Routines ⚡' },
    { to: '/wellness', label: 'Wellness 💧' },
    { to: '/records', label: 'PRs 🏆' },
    { to: '/nutrition', label: 'Nutrition' },
    { to: '/goals', label: 'Goals' },
    { to: '/challenges', label: 'Challenges' },
    { to: '/reports', label: 'Reports 📊' },
    { to: '/library', label: 'Library' },
    { to: '/profile', label: 'Profile' },
  ]

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-extrabold text-xl text-indigo-600 flex items-center gap-1.5">
              <span>🏋️</span>
              <span>FitTrack Pro</span>
            </Link>

            {user && (
              <div className="hidden xl:flex items-center gap-3 text-xs font-medium text-gray-600 dark:text-gray-300 ml-4">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`hover:text-indigo-600 transition py-1 px-1.5 rounded-lg ${
                        isActive ? 'text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/60' : ''
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
                {user.is_admin && (
                  <Link
                    to="/admin"
                    className={`hover:text-indigo-600 transition py-1 px-1.5 rounded-lg ${
                      location.pathname === '/admin' ? 'text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/60' : ''
                    }`}
                  >
                    Admin 🛡️
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 items-center">
            {user && (
              <button
                type="button"
                className="xl:hidden btn-ghost px-2.5 py-1.5 text-xs font-semibold"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? '✕ Close' : '☰ Menu'}
              </button>
            )}

            <button
              type="button"
              className="btn-ghost px-2.5 py-1.5 text-sm"
              onClick={() => setDark(!dark)}
              title="Toggle theme"
            >
              {dark ? '☀️' : '🌙'}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium hidden sm:inline text-gray-500">
                  {user.name}
                </span>
                <button
                  className="btn-ghost text-xs px-2.5 py-1.5"
                  onClick={() => {
                    logout()
                    nav('/login')
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link className="btn-ghost text-xs px-3 py-1.5" to="/login">
                  Login
                </Link>
                <Link className="btn text-xs px-3 py-1.5" to="/register">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {user && mobileMenuOpen && (
          <div className="xl:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`p-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  location.pathname === link.to ? 'bg-indigo-50 dark:bg-indigo-950 font-bold text-indigo-600' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user.is_admin && (
              <Link
                to="/admin"
                className={`p-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  location.pathname === '/admin' ? 'bg-indigo-50 dark:bg-indigo-950 font-bold text-indigo-600' : ''
                }`}
              >
                Admin 🛡️
              </Link>
            )}
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
