import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

const blank = {
  exercise_name: '',
  sets: 3,
  reps: 10,
  weight_kg: 0,
  duration_min: 30,
  calories: 200,
  date: new Date().toISOString().slice(0, 10),
}

export default function Workouts() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(blank)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')

  const load = () => api.get('/workouts').then((r) => setRows(r.data))
  useEffect(() => {
    load()
  }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const save = async () => {
    if (!form.exercise_name.trim()) return alert('Exercise name is required')
    if (editId) await api.put(`/workouts/${editId}`, form)
    else await api.post('/workouts', form)
    setForm(blank)
    setEditId(null)
    load()
  }

  const filteredRows = rows.filter((w) =>
    w.exercise_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Banner to Explore Templates */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-100 dark:border-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-sm text-indigo-900 dark:text-indigo-200">
            ⚡ Don't want to log movements manually?
          </h2>
          <p className="text-xs text-gray-500">
            Choose from Push/Pull/Legs, Upper/Lower, or 5x5 Strength templates with 1-click logging.
          </p>
        </div>
        <Link to="/routines" className="btn text-xs whitespace-nowrap">
          Browse Pre-built Routines
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <h2 className="font-bold mb-3">{editId ? 'Edit' : 'Add'} workout</h2>
          {[
            ['exercise_name', 'Exercise'],
            ['sets', 'Sets'],
            ['reps', 'Reps'],
            ['weight_kg', 'Weight (kg)'],
            ['duration_min', 'Duration (min)'],
            ['calories', 'Calories'],
            ['date', 'Date'],
          ].map(([k, l]) => (
            <div key={k} className="mb-2">
              <label className="label">{l}</label>
              <input
                type={k === 'exercise_name' ? 'text' : k === 'date' ? 'date' : 'number'}
                className="input"
                placeholder={k === 'exercise_name' ? 'e.g. Bench Press' : ''}
                value={form[k]}
                onChange={set(k)}
              />
            </div>
          ))}
          <button className="btn w-full mt-2" onClick={save}>
            {editId ? 'Update Workout' : 'Add Workout'}
          </button>
          {editId && (
            <button
              className="btn-ghost w-full mt-2"
              onClick={() => {
                setEditId(null)
                setForm(blank)
              }}
            >
              Cancel
            </button>
          )}
        </div>

        <div className="md:col-span-2 card space-y-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <h2 className="font-bold">Workout History ({rows.length})</h2>
            <input
              type="text"
              placeholder="Search exercise..."
              className="input text-xs sm:w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs border-b border-gray-100 dark:border-gray-800 pb-2">
                  <th className="py-2">Exercise</th>
                  <th>Sets×Reps</th>
                  <th>Weight</th>
                  <th>Duration</th>
                  <th>kcal</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredRows.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="py-2.5 font-medium">{w.exercise_name}</td>
                    <td>
                      {w.sets} × {w.reps}
                    </td>
                    <td>{w.weight_kg}kg</td>
                    <td className="text-xs text-gray-500">{w.duration_min}m</td>
                    <td>{w.calories}</td>
                    <td className="text-xs text-gray-400">{w.date}</td>
                    <td className="flex gap-2 justify-end py-2">
                      <button
                        className="text-xs text-indigo-600 hover:underline"
                        onClick={() => {
                          setEditId(w.id)
                          setForm({ ...w })
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs text-red-500 hover:underline"
                        onClick={async () => {
                          await api.delete(`/workouts/${w.id}`)
                          load()
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRows.length === 0 && (
              <p className="text-center py-6 text-gray-400 text-sm">No matching workouts found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
