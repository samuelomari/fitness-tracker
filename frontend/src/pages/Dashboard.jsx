import { useEffect, useState } from 'react'
import api from '../api/client'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as C, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
C.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)
export default function Dashboard() {
  const [s, setS] = useState(null)
  useEffect(() => { api.get('/dashboard/summary').then((r) => setS(r.data)) }, [])
  if (!s) return <p>Loading dashboard...</p>
  const cards = [
    ['Total workouts', s.total_workouts], ['Calories burned', Math.round(s.calories_burned)],
    ['Current weight', s.current_weight ? `${s.current_weight} kg` : '—'],
    ['Weekly workouts', s.weekly_workouts], ['Streak', `${s.streak_days} days`],
  ]
  return <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map(([k, v]) => <div key={k} className="card"><p className="text-sm text-gray-500">{k}</p><p className="text-2xl font-bold">{v}</p></div>)}
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="card"><h3 className="font-semibold mb-2">Calories by day (7d)</h3>
        <Bar data={{ labels: s.calories_by_day.map((d) => d.date.slice(5)), datasets: [{ label: 'kcal', data: s.calories_by_day.map((d) => d.calories), backgroundColor: '#6366f1' }] }} /></div>
      <div className="card"><h3 className="font-semibold mb-2">Weight history</h3>
        <Line data={{ labels: s.weight_history.map((d) => d.date.slice(5)), datasets: [{ label: 'kg', data: s.weight_history.map((d) => d.weight_kg), borderColor: '#10b981' }] }} /></div>
    </div>
    <div className="card"><h3 className="font-semibold mb-2">Active goals</h3>
      {s.active_goals.length === 0 ? <p className="text-sm text-gray-500">No active goals.</p> :
        s.active_goals.map((g) => <div key={g.id} className="mb-2"><div className="flex justify-between text-sm"><span>{g.title}</span><span>{g.progress_pct}%</span></div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"><div className="h-2 bg-indigo-600 rounded" style={{ width: `${g.progress_pct}%` }} /></div></div>)}
    </div>
  </div>
}
