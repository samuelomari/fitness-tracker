import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Reports() {
  const [summary, setSummary] = useState(null)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [csvBusy, setCsvBusy] = useState(false)

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setSummary(r.data)).catch(console.error)
  }, [])

  const downloadPdf = async () => {
    setPdfBusy(true)
    try {
      const r = await api.get('/reports/fitness.pdf', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `fittrack-report-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to generate PDF report')
    } finally {
      setPdfBusy(false)
    }
  }

  const exportWorkoutsCsv = async () => {
    setCsvBusy(true)
    try {
      const res = await api.get('/workouts')
      const rows = res.data
      if (!rows.length) return alert('No workouts available to export.')

      const headers = ['ID', 'Date', 'Exercise', 'Sets', 'Reps', 'Weight_kg', 'Duration_min', 'Calories']
      const csvLines = [headers.join(',')]
      rows.forEach((w) => {
        csvLines.push(
          [w.id, w.date, `"${w.exercise_name}"`, w.sets, w.reps, w.weight_kg, w.duration_min, w.calories].join(',')
        )
      })

      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fittrack-workouts-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to export workouts CSV')
    } finally {
      setCsvBusy(false)
    }
  }

  const exportNutritionCsv = async () => {
    try {
      const res = await api.get('/track/nutrition')
      const rows = res.data
      if (!rows.length) return alert('No nutrition logs available to export.')

      const headers = ['ID', 'Date', 'Meal_Type', 'Food_Name', 'Calories', 'Protein_g', 'Carbs_g', 'Fat_g']
      const csvLines = [headers.join(',')]
      rows.forEach((n) => {
        csvLines.push(
          [n.id, n.date, n.meal_type, `"${n.food_name}"`, n.calories, n.protein, n.carbs, n.fat].join(',')
        )
      })

      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fittrack-nutrition-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to export nutrition CSV')
    }
  }

  const exportWeightCsv = async () => {
    try {
      const res = await api.get('/track/weight')
      const rows = res.data
      if (!rows.length) return alert('No weight logs available to export.')

      const headers = ['ID', 'Date', 'Weight_kg']
      const csvLines = [headers.join(',')]
      rows.forEach((w) => {
        csvLines.push([w.id, w.date, w.weight_kg].join(','))
      })

      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fittrack-weight-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to export weight CSV')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics & Data Export</h1>
        <p className="text-sm text-gray-500">
          Export your fitness history as formatted PDF reports or raw CSV spreadsheets
        </p>
      </div>

      {/* Export Options Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* PDF Report Card */}
        <div className="card space-y-4 border border-indigo-100 dark:border-indigo-950">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📄</span>
            <div>
              <h2 className="text-lg font-bold">Comprehensive PDF Report</h2>
              <p className="text-xs text-gray-500">
                Print-ready summary containing your user profile, active goals, recent workouts, and nutrition logs
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <p>✓ Current Weight & BMI Calculation</p>
            <p>✓ Total Workouts & Calories Burned</p>
            <p>✓ Goal Progress & Status Breakdown</p>
            <p>✓ Recent 15 Workouts and Recent Meals</p>
          </div>

          <button
            className="btn w-full flex items-center justify-center gap-2"
            onClick={downloadPdf}
            disabled={pdfBusy}
          >
            {pdfBusy ? 'Generating PDF...' : '⬇ Download PDF Fitness Report'}
          </button>
        </div>

        {/* CSV Spreadsheets Card */}
        <div className="card space-y-4 border border-emerald-100 dark:border-emerald-950">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📊</span>
            <div>
              <h2 className="text-lg font-bold">CSV Data Exports</h2>
              <p className="text-xs text-gray-500">
                Export raw tabular data compatible with Excel, Google Sheets, or data analytics tools
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button
              className="btn-ghost w-full flex justify-between items-center text-sm"
              onClick={exportWorkoutsCsv}
              disabled={csvBusy}
            >
              <span>🏋️ Workouts History</span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">.CSV ⬇</span>
            </button>
            <button
              className="btn-ghost w-full flex justify-between items-center text-sm"
              onClick={exportNutritionCsv}
            >
              <span>🥗 Nutrition & Meals</span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">.CSV ⬇</span>
            </button>
            <button
              className="btn-ghost w-full flex justify-between items-center text-sm"
              onClick={exportWeightCsv}
            >
              <span>⚖️ Weight Tracking Logs</span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">.CSV ⬇</span>
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Summary */}
      {summary && (
        <div className="card">
          <h2 className="text-sm font-semibold uppercase text-gray-400 mb-3">Your Account Snapshot</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <p className="text-xs text-gray-400">Total Workouts</p>
              <p className="text-2xl font-bold mt-1">{summary.total_workouts}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <p className="text-xs text-gray-400">Total Calories</p>
              <p className="text-2xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">
                {Math.round(summary.calories_burned)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <p className="text-xs text-gray-400">Current Weight</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {summary.current_weight ? `${summary.current_weight} kg` : '—'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <p className="text-xs text-gray-400">Streak</p>
              <p className="text-2xl font-bold mt-1 text-amber-500">
                {summary.streak_days} days
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

