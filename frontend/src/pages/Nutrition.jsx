import { useEffect, useState } from 'react'
import api from '../api/client'
export default function Nutrition() {
  const [rows, setRows] = useState([]); const [water, setWater] = useState([])
  const [f, setF] = useState({ meal_type: 'breakfast', food_name: '', calories: 0, protein: 0, carbs: 0, fat: 0 })
  const [ml, setMl] = useState(250)
  const load = () => { api.get('/track/nutrition').then((r) => setRows(r.data)); api.get('/track/water').then((r) => setWater(r.data)) }
  useEffect(load, [])
  const totals = rows.reduce((a, r) => ({ calories: a.calories + +r.calories, protein: a.protein + +r.protein, carbs: a.carbs + +r.carbs, fat: a.fat + +r.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  const todayMl = water.filter((w) => w.date === new Date().toISOString().slice(0, 10)).reduce((a, w) => a + +w.amount_ml, 0)
  const goalMl = 3000
  return <div className="grid md:grid-cols-2 gap-4">
    <div className="card"><h2 className="font-bold mb-2">Log meal</h2>
      <select className="input mb-2" value={f.meal_type} onChange={(e) => setF({ ...f, meal_type: e.target.value })}>
        <option>breakfast</option><option>lunch</option><option>dinner</option><option>snack</option></select>
      <input className="input mb-2" placeholder="Food" value={f.food_name} onChange={(e) => setF({ ...f, food_name: e.target.value })} />
      <div className="grid grid-cols-4 gap-2">{['calories', 'protein', 'carbs', 'fat'].map((k) => (
        <div key={k}><label className="label">{k}</label><input type="number" className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: +e.target.value })} /></div>))}</div>
      <button className="btn w-full mt-3" onClick={async () => { await api.post('/track/nutrition', f); setF({ ...f, food_name: '' }); load() }}>Add</button>
      <h3 className="font-semibold mt-4">Today totals: {Math.round(totals.calories)} kcal · P {Math.round(totals.protein)}g · C {Math.round(totals.carbs)}g · F {Math.round(totals.fat)}g</h3>
      <div className="mt-2 text-sm">{rows.slice(0, 8).map((r) => <div key={r.id} className="flex justify-between border-t border-gray-100 dark:border-gray-800 py-1"><span>{r.meal_type}: {r.food_name}</span><span>{r.calories} kcal</span></div>)}</div></div>
    <div className="card"><h2 className="font-bold mb-2">Water intake</h2>
      <p className="text-sm mb-1">Goal: {(goalMl / 1000).toFixed(1)} L</p>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"><div className="h-4 bg-sky-500 rounded" style={{ width: `${Math.min(100, (todayMl / goalMl) * 100)}%` }} /></div>
      <p className="my-2">{(todayMl / 1000).toFixed(2)} / {(goalMl / 1000).toFixed(1)} L today</p>
      <div className="flex gap-2"><input type="number" className="input" value={ml} onChange={(e) => setMl(+e.target.value)} />
        <button className="btn" onClick={async () => { await api.post('/track/water', { amount_ml: ml }); load() }}>+ Add</button></div></div>
  </div>
}
