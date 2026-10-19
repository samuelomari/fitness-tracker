import { useEffect, useState } from 'react'
import api from '../api/client'
export default function Library() {
  const [rows, setRows] = useState([])
  const [f, setF] = useState({ q: '', muscle_group: '', equipment: '', difficulty: '' })
  const load = () => {
    const p = new URLSearchParams(Object.fromEntries(Object.entries(f).filter(([, v]) => v)))
    api.get(`/library?${p}`).then((r) => setRows(r.data))
  }
  useEffect(load, [])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  return (
    <div className="space-y-4">
      <div className="card grid grid-cols-2 md:grid-cols-5 gap-2">
        <input className="input" placeholder="Search..." value={f.q} onChange={set('q')} />
        <select className="input" value={f.muscle_group} onChange={set('muscle_group')}>
          <option value="">All muscles</option>{['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'].map((m) => <option key={m}>{m}</option>)}
        </select>
        <select className="input" value={f.equipment} onChange={set('equipment')}>
          <option value="">All equipment</option>{['bodyweight', 'dumbbell', 'barbell', 'machine', 'none'].map((m) => <option key={m}>{m}</option>)}
        </select>
        <select className="input" value={f.difficulty} onChange={set('difficulty')}>
          <option value="">All levels</option>{['beginner', 'intermediate', 'advanced'].map((m) => <option key={m}>{m}</option>)}
        </select>
        <button className="btn" onClick={load}>Filter</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((e) => (
          <div key={e.id} className="card">
            <div className="flex justify-between"><b>{e.name}</b>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">{e.difficulty}</span></div>
            <p className="text-sm text-gray-500">{e.muscle_group} · {e.equipment}</p>
            {e.description && <p className="text-sm mt-1">{e.description}</p>}
            {e.instructions && <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">{e.instructions}</p>}
            <div className="flex gap-3 mt-1 text-sm">
              {e.image_url && <a className="text-indigo-600" href={e.image_url} target="_blank" rel="noreferrer">Image</a>}
              {e.video_url && <a className="text-indigo-600" href={e.video_url} target="_blank" rel="noreferrer">Video</a>}
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-gray-500">No exercises found. Run backend seed or ask an admin to add some.</p>}
      </div>
    </div>
  )
}
