import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    fitness_level: 'beginner',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const { register } = useAuth()
  const nav = useNavigate()

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!form.name.trim()) return setErr('Name is required')
    if (!form.email.trim()) return setErr('Email is required')
    if (form.password.length < 6) return setErr('Password must be at least 6 characters')

    setLoading(true)
    try {
      await register(form)
      nav('/')
    } catch (error) {
      if (error.response?.data?.errors) {
        const errorList = Object.values(error.response.data.errors).join(', ')
        setErr(errorList)
      } else {
        setErr(error.response?.data?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-gray-500">Join FitTrack Pro and start your journey</p>
        </div>
        <span className="text-3xl">🚀</span>
      </div>

      {err && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
          <span>⚠️</span>
          <span>{err}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="label block mb-1">Full Name</label>
          <input
            className="input"
            placeholder="John Doe"
            value={form.name}
            onChange={set('name')}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="label block mb-1">Email address</label>
          <input
            type="email"
            className="input"
            placeholder="name@example.com"
            value={form.email}
            onChange={set('email')}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="label block mb-1">Password (6+ characters)</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input pr-10"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              disabled={loading}
              minLength={6}
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

        <div>
          <label className="label block mb-1">Fitness Level</label>
          <select
            className="input"
            value={form.fitness_level}
            onChange={set('fitness_level')}
            disabled={loading}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn w-full mt-4 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-gray-500">
        Already have an account?{' '}
        <Link className="text-indigo-600 font-medium hover:underline" to="/login">
          Sign In
        </Link>
      </p>
    </div>
  )
}
