import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [resetModal, setResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const { login } = useAuth()
  const nav = useNavigate()

  const handleLogin = async (e, customEmail, customPassword) => {
    if (e) e.preventDefault()
    setErr('')
    const submitEmail = customEmail !== undefined ? customEmail : email
    const submitPassword = customPassword !== undefined ? customPassword : password

    if (!submitEmail.trim()) {
      setErr('Please enter your email address')
      return
    }
    if (!submitPassword) {
      setErr('Please enter your password')
      return
    }

    setLoading(true)
    try {
      await login(submitEmail.trim(), submitPassword)
      nav('/')
    } catch (error) {
      if (error.response) {
        setErr(error.response.data?.message || 'Invalid email or password')
      } else if (error.request) {
        setErr('Unable to reach the server. Please ensure the backend is running.')
      } else {
        setErr(error.message || 'An error occurred during login')
      }
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    await handleLogin(null, demoEmail, demoPassword)
  }

  const handleResetRequest = async (e) => {
    e.preventDefault()
    if (!resetEmail.trim()) {
      setResetMsg('Please enter your email address')
      return
    }
    setResetLoading(true)
    setResetMsg('')
    try {
      const res = await api.post('/auth/reset-request', { email: resetEmail.trim() })
      if (res.data.reset_token) {
        setResetMsg(`Success! In dev mode, your token is: ${res.data.reset_token.slice(0, 20)}...`)
      } else {
        setResetMsg(res.data.message || 'If that email exists, a reset link was sent.')
      }
    } catch (error) {
      setResetMsg(error.response?.data?.message || 'Failed to submit reset request.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-sm text-gray-500">Sign in to track your workouts and goals</p>
          </div>
          <span className="text-3xl">🏋️‍♂️</span>
        </div>

        {err && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label block mb-1">Email address</label>
            <input
              type="email"
              className="input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label">Password</label>
              <button
                type="button"
                className="text-xs text-indigo-600 hover:underline"
                onClick={() => {
                  setResetEmail(email)
                  setResetMsg('')
                  setResetModal(true)
                }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn w-full flex items-center justify-center gap-2 mt-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quick 1-Click Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="btn-ghost text-xs py-2 text-center"
              onClick={() => quickLogin('demo@fittrack.dev', 'demo1234')}
              disabled={loading}
            >
              👤 Demo User
            </button>
            <button
              type="button"
              className="btn-ghost text-xs py-2 text-center"
              onClick={() => quickLogin('admin@fittrack.dev', 'admin123')}
              disabled={loading}
            >
              🛡️ Admin User
            </button>
          </div>
        </div>

        <p className="mt-5 text-sm text-center text-gray-500">
          Don't have an account?{' '}
          <Link className="text-indigo-600 font-medium hover:underline" to="/register">
            Create an account
          </Link>
        </p>
      </div>

      {/* Password Reset Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Reset Password</h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                onClick={() => setResetModal(false)}
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Enter your account email to receive a password reset token.
            </p>
            {resetMsg && (
              <div className="p-3 text-xs rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {resetMsg}
              </div>
            )}
            <form onSubmit={handleResetRequest} className="space-y-3">
              <div>
                <label className="label block mb-1">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={resetLoading}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-ghost flex-1 text-sm"
                  onClick={() => setResetModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn flex-1 text-sm"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
