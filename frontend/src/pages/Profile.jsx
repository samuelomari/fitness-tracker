import { useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
export default function Profile() {
  const { user, setUser } = useAuth()
  const [f, setF] = useState({ ...user })
  const [w, setW] = useState('')
  if (!user) return null
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  return <div className="grid md:grid-cols-2 gap-4">
    <div className="card"><h2 className="font-bold mb-3">Profile</h2>
      {[['name', 'Name'], ['age', 'Age'], ['height_cm', 'Height (cm)'], ['weight_kg', 'Weight (kg)']].map(([k, l]) => (
        <div key={k} className="mb-2"><label className="label">{l}</label><input className="input" value={f[k] ?? ''} onChange={set(k)} /></div>))}
      <label className="label">Gender</label><select className="input mb-2" value={f.gender || ''} onChange={set('gender')}><option value="">—</option><option>male</option><option>female</option><option>other</option></select>
      <label className="label">Fitness level</label><select className="input mb-3" value={f.fitness_level || 'beginner'} onChange={set('fitness_level')}><option>beginner</option><option>intermediate</option><option>advanced</option></select>
      <button className="btn w-full" onClick={async () => { const r = await api.put('/auth/profile', f); setUser(r.data); alert('Saved') }}>Save</button></div>
    <div className="card"><h2 className="font-bold mb-3">Health stats</h2>
      <p>BMI: <b>{user.bmi ?? '—'}</b></p>
      <p>Daily calories: <b>{user.daily_calorie_needs ?? '—'} kcal</b></p>
      <div className="mt-4"><label className="label">Log weight (kg)</label>
        <div className="flex gap-2"><input className="input" value={w} onChange={(e) => setW(e.target.value)} />
          <button className="btn" onClick={async () => { await api.post('/track/weight', { weight_kg: +w }); setW(''); alert('Logged') }}>Log</button></div></div></div>
  </div>
}
