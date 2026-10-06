import { useEffect, useState } from 'react'
import api from '../api/client'
const blank = { exercise_name: '', sets: 3, reps: 10, weight_kg: 0, duration_min: 30, calories: 200, date: new Date().toISOString().slice(0, 10) }
export default function Workouts() {
  const [rows, setRows] = useState([]); const [form, setForm] = useState(blank); const [editId, setEditId] = useState(null)
  const load = () => api.get('/workouts').then((r) => setRows(r.data))
  useEffect(() => { load() }, [])
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const save = async () => {
    if (editId) await api.put(`/workouts/${editId}`, form)
    else await api.post('/workouts', form)
    setForm(blank); setEditId(null); load()
  }
  return <div className="grid md:grid-cols-3 gap-4">
    <div className="card">
      <h2 className="font-bold mb-3">{editId ? 'Edit' : 'Add'} workout</h2>
      {[['exercise_name', 'Exercise'], ['sets', 'Sets'], ['reps', 'Reps'], ['weight_kg', 'Weight (kg)'], ['duration_min', 'Duration (min)'], ['calories', 'Calories'], ['date', 'Date']].map(([k, l]) => (
        <div key={k} className="mb-2"><label className="label">{l}</label>
          <input type={k === 'exercise_name' ? 'text' : k === 'date' ? 'date' : 'number'} className="input" value={form[k]} onChange={set(k)} /></div>))}
      <button className="btn w-full mt-2" onClick={save}>{editId ? 'Update' : 'Add'}</button>
      {editId && <button className="btn-ghost w-full mt-2" onClick={() => { setEditId(null); setForm(blank) }}>Cancel</button>}
    </div>
    <div className="md:col-span-2 card overflow-x-auto">
      <h2 className="font-bold mb-3">History ({rows.length})</h2>
      <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th>Exercise</th><th>Sets×Reps</th><th>Weight</th><th>kcal</th><th>Date</th><th></th></tr></thead>
        <tbody>{rows.map((w) => <tr key={w.id} className="border-t border-gray-100 dark:border-gray-800">
          <td className="py-2 font-medium">{w.exercise_name}</td><td>{w.sets}×{w.reps}</td><td>{w.weight_kg}kg</td><td>{w.calories}</td><td>{w.date}</td>
          <td className="flex gap-2"><button className="text-indigo-600" onClick={() => { setEditId(w.id); setForm({ ...w }) }}>Edit</button>
            <button className="text-red-500" onClick={async () => { await api.delete(`/workouts/${w.id}`); load() }}>Delete</button></td></tr>)}</tbody></table>
    </div>
  </div>
}
