import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState(''); const { register } = useAuth(); const nav = useNavigate()
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  return <div className="card max-w-md mx-auto">
    <h1 className="text-2xl font-bold mb-4">Create account</h1>
    {err && <p className="text-red-500 mb-2">{err}</p>}
    <label className="label">Name</label><input className="input mb-3" value={form.name} onChange={set('name')} />
    <label className="label">Email</label><input className="input mb-3" value={form.email} onChange={set('email')} />
    <label className="label">Password (6+ chars)</label><input type="password" className="input mb-4" value={form.password} onChange={set('password')} />
    <button className="btn w-full" onClick={async () => { try { await register(form); nav('/') } catch (e) { setErr(e.response?.data?.message || 'Registration failed') } }}>Sign up</button>
    <p className="mt-3 text-sm">Have an account? <Link className="text-indigo-600" to="/login">Login</Link></p>
  </div>
}
