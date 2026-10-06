import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="font-bold text-xl text-indigo-600">FitTrack Pro</Link>
          {user && (<>
            <Link to="/" className="hover:underline">Dashboard</Link>
            <Link to="/workouts" className="hover:underline">Workouts</Link>
            <Link to="/goals" className="hover:underline">Goals</Link>
            <Link to="/nutrition" className="hover:underline">Nutrition</Link>
            <Link to="/profile" className="hover:underline">Profile</Link>
            {user.is_admin && <Link to="/admin" className="hover:underline">Admin</Link>}
          </>)}
          <div className="ml-auto flex gap-2 items-center">
            <button className="btn-ghost" onClick={() => setDark(!dark)}>{dark ? '☀️' : '🌙'}</button>
            {user ? <><span className="text-sm hidden sm:inline">{user.name}</span><button className="btn-ghost" onClick={() => { logout(); nav('/login') }}>Logout</button></>
              : <><Link className="btn-ghost" to="/login">Login</Link><Link className="btn" to="/register">Sign up</Link></>}
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
