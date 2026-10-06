import { useEffect, useState } from 'react'
import api from '../api/client'
export default function Goals() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ title: '', goal_type: 'weight_loss', target: 10, current_progress: 0, deadline: '' })
  const load = () => api.get('/goals').then((r) => setRows(r.data))
  useEffect(() => { load() }, [])
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  return <div className="grid md:grid-cols-3 gap-4">
    <div className="card"><h2 className="font-bold mb-3">New goal</h2>
      <label className="label">Title</label><input className="input mb-2" value={form.title} onChange={set('title')} placeholder="Lose 10kg" />
      <label className="label">Type</label><select className="input mb-2" value={form.goal_type} onChange={set('goal_type')}>
        <option value="weight_loss">Weight loss</option><option value="muscle">Muscle</option><option value="distance">Distance</option><option value="frequency">Frequency</option></select>
      <label className="label">Target</label><input type="number" className="input mb-2" value={form.target} onChange={set('target')} />
      <label className="label">Deadline</label><input type="date" className="input mb-3" value={form.deadline} onChange={set('deadline')} />
      <button className="btn w-full" onClick={async () => { await api.post('/goals', form); setForm({ ...form, title: '' }); load() }}>Create</button></div>
    <div className="md:col-span-2 space-y-3">{rows.map((g) => (
      <div key={g.id} className="card"><div className="flex justify-between"><b>{g.title}</b>
        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">{g.status}</span></div>
        <div className="flex items-center gap-2 mt-2">
          <input type="number" className="input" style={{ maxWidth: 120 }} value={g.current_progress} onChange={(e) => setRows(rows.map((x) => x.id === g.id ? { ...x, current_progress: +e.target.value } : x))} />
          <span className="text-sm">/ {g.target} ({g.progress_pct}%)</span>
          <button className="btn ml-auto" onClick={async () => { const r = await api.put(`/goals/${g.id}`, { current_progress: g.current_progress }); setRows(rows.map((x) => x.id === g.id ? r.data : x)) }}>Save</button>
          <button className="text-red-500 text-sm" onClick={async () => { await api.delete(`/goals/${g.id}`); load() }}>Delete</button></div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mt-2"><div className="h-2 bg-green-500 rounded" style={{ width: `${g.progress_pct}%` }} /></div></div>))}
    </div></div>
}
