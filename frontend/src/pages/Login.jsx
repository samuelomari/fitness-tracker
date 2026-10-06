import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [err, setErr] = useState(''); const { login } = useAuth(); const nav = useNavigate()
  return <div className="card max-w-md mx-auto">
    <h1 className="text-2xl font-bold mb-4">Login</h1>
    {err && <p className="text-red-500 mb-2">{err}</p>}
    <label className="label">Email</label><input className="input mb-3" value={email} onChange={(e) => setEmail(e.target.value)} />
    <label className="label">Password</label><input type="password" className="input mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />
    <button className="btn w-full" onClick={async () => { try { await login(email, password); nav('/') } catch { setErr('Invalid credentials') } }}>Login</button>
    <p className="mt-3 text-sm">No account? <Link className="text-indigo-600" to="/register">Register</Link></p>
  </div>
}
