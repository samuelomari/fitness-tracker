import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as C, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import ActivityHeatmap from '../components/ActivityHeatmap'

C.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export default function Dashboard() {
  const [s, setS] = useState(null)
  const [pdfBusy, setPdfBusy] = useState(false)

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setS(r.data)).catch(console.error)
  }, [])

  const downloadPdf = async () => {
    setPdfBusy(true)
    try {
      const r = await api.get('/reports/fitness.pdf', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'fittrack-report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setPdfBusy(false)
    }
  }

  if (!s) return <p className="text-center py-12 text-gray-400">Loading dashboard...</p>

  const cards = [
    ['Total workouts', s.total_workouts, '🏋️'],
    ['Calories burned', Math.round(s.calories_burned), '🔥'],
    ['Current weight', s.current_weight ? `${s.current_weight} kg` : '—', '⚖️'],
    ['Weekly workouts', s.weekly_workouts, '📅'],
    ['Streak', `${s.streak_days} days`, '⚡'],
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">Your health and workout performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/routines" className="btn text-xs py-2 px-3">
            ⚡ Quick Routines
          </Link>
          <Link to="/reports" className="btn-ghost text-xs py-2 px-3">
            📊 Reports & Export
          </Link>
          <button className="btn-ghost text-xs py-2 px-3" onClick={downloadPdf} disabled={pdfBusy}>
            {pdfBusy ? 'Exporting...' : '⬇ PDF'}
          </button>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/routines"
          className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 hover:border-indigo-500 transition flex items-center gap-3"
        >
          <span className="text-2xl">⚡</span>
          <div>
            <p className="font-bold text-sm text-indigo-700 dark:text-indigo-300">Workout Routines</p>
            <p className="text-xs text-gray-500">1-click training templates</p>
          </div>
        </Link>
        <Link
          to="/wellness"
          className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 hover:border-sky-500 transition flex items-center gap-3"
        >
          <span className="text-2xl">💧</span>
          <div>
            <p className="font-bold text-sm text-sky-700 dark:text-sky-300">Water & Sleep</p>
            <p className="text-xs text-gray-500">Log hydration & rest</p>
          </div>
        </Link>
        <Link
          to="/records"
          className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 hover:border-amber-500 transition flex items-center gap-3"
        >
          <span className="text-2xl">🏆</span>
          <div>
            <p className="font-bold text-sm text-amber-700 dark:text-amber-300">Personal Records</p>
            <p className="text-xs text-gray-500">1RM calculator & bests</p>
          </div>
        </Link>
        <Link
          to="/nutrition"
          className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 hover:border-emerald-500 transition flex items-center gap-3"
        >
          <span className="text-2xl">🥗</span>
          <div>
            <p className="font-bold text-sm text-emerald-700 dark:text-emerald-300">Macro Goals</p>
            <p className="text-xs text-gray-500">Track daily nutrients</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map(([k, v, icon]) => (
          <div key={k} className="card">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-gray-500">{k}</p>
              <span className="text-sm">{icon}</span>
            </div>
            <p className="text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-2">Calories burned (past 7 days)</h3>
          <Bar
            data={{
              labels: s.calories_by_day.map((d) => d.date.slice(5)),
              datasets: [{ label: 'kcal', data: s.calories_by_day.map((d) => d.calories), backgroundColor: '#6366f1' }],
            }}
          />
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Weight history</h3>
          <Line
            data={{
              labels: s.weight_history.map((d) => d.date.slice(5)),
              datasets: [{ label: 'kg', data: s.weight_history.map((d) => d.weight_kg), borderColor: '#10b981' }],
            }}
          />
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">Active Goals</h3>
        {s.active_goals.length === 0 ? (
          <p className="text-sm text-gray-500">No active goals. Head to Goals to set your targets!</p>
        ) : (
          s.active_goals.map((g) => (
            <div key={g.id} className="mb-2">
              <div className="flex justify-between text-sm">
                <span>{g.title}</span>
                <span>{g.progress_pct}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mt-1">
                <div className="h-2 bg-indigo-600 rounded" style={{ width: `${g.progress_pct}%` }} />
              </div>
            </div>
          ))
        )}
      </div>

      <ActivityHeatmap />
    </div>
  )
}
