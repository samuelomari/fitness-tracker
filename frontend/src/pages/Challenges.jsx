import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
export default function Challenges() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [boards, setBoards] = useState({})
  const [form, setForm] = useState({ title: '', description: '', challenge_type: 'workouts', target: 30, duration_days: 30 })
  const [badges, setBadges] = useState({ earned: [], locked: [] })
  const load = () => {
    api.get('/challenges').then((r) => setRows(r.data))
    api.post('/badges/check').then(() => api.get('/badges').then((r) => setBadges(r.data)))
  }
  useEffect(load, [])
  const board = (id) => api.get(`/challenges/${id}/leaderboard`).then((r) => setBoards({ ...boards, [id]: r.data }))
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-bold mb-2">🏅 Achievements</h2>
        <div className="flex flex-wrap gap-2">
          {badges.earned.map((ub) => <span key={ub.id} title={`${ub.badge.description} · ${ub.earned_at.slice(0, 10)}`} className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-sm">{ub.badge.icon} {ub.badge.name}</span>)}
          {badges.earned.length === 0 && <span className="text-sm text-gray-500">No badges yet — log a workout!</span>}
        </div>
        {badges.locked.length > 0 && <p className="text-xs text-gray-500 mt-2">Locked: {badges.locked.map((b) => `${b.icon} ${b.name}`).join(' · ')}</p>}
      </div>
      {user?.is_admin && (
        <div className="card grid md:grid-cols-5 gap-2">
          <input className="input md:col-span-2" placeholder="Challenge title" value={form.title} onChange={set('title')} />
          <input className="input md:col-span-2" placeholder="Description" value={form.description} onChange={set('description')} />
          <select className="input" value={form.challenge_type} onChange={set('challenge_type')}><option value="workouts">workouts</option><option value="calories">calories</option></select>
          <input type="number" className="input" value={form.target} onChange={set('target')} title="Target" />
          <button className="btn" onClick={async () => { await api.post('/challenges', form); setForm({ ...form, title: '' }); load() }}>Create (admin)</button>
        </div>
      )}
      {rows.map((c) => (
        <div key={c.id} className="card">
          <div className="flex justify-between items-center"><b>{c.title}</b>
            {c.user_progress
              ? <button className="btn-ghost text-sm" onClick={() => board(c.id)}>Leaderboard</button>
              : <button className="btn text-sm" onClick={async () => { await api.post(`/challenges/${c.id}/join`); load() }}>Join</button>}
          </div>
          <p className="text-sm text-gray-500">{c.description} · target {c.target} {c.challenge_type} · {c.duration_days}d</p>
          {c.user_progress && (
            <div className="mt-2"><div className="flex justify-between text-sm"><span>{c.user_progress.progress}/{c.target} ({c.user_progress.pct}%)</span><span>{c.user_progress.completed ? '✅ Done' : 'In progress'}</span></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"><div className="h-2 bg-green-500 rounded" style={{ width: `${c.user_progress.pct}%` }} /></div></div>
          )}
          {boards[c.id] && <ol className="mt-2 text-sm list-decimal ml-5">{boards[c.id].map((r, i) => <li key={i}>{r.name} — {r.progress} {r.completed ? '✅' : ''}</li>)}</ol>}
        </div>
      ))}
      {rows.length === 0 && <p className="text-sm text-gray-500">No challenges yet.</p>}
    </div>
  )
}
