import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Nutrition() {
  const [rows, setRows] = useState([])
  const [f, setF] = useState({
    meal_type: 'breakfast',
    food_name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })

  // Daily Macro Goals
  const [macroGoals, setMacroGoals] = useState(() => {
    const saved = localStorage.getItem('fittrack_macro_goals')
    return saved
      ? JSON.parse(saved)
      : { calories: 2200, protein: 150, carbs: 220, fat: 65 }
  })
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => {
    api.get('/track/nutrition').then((r) => setRows(r.data))
  }

  useEffect(() => {
    load()
  }, [])

  const saveGoals = (e) => {
    e.preventDefault()
    localStorage.setItem('fittrack_macro_goals', JSON.stringify(macroGoals))
    setShowGoalModal(false)
    setMsg('Macro goals updated! 🎯')
    setTimeout(() => setMsg(''), 3000)
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayMeals = rows.filter((r) => r.date === todayStr)

  const totals = todayMeals.reduce(
    (a, r) => ({
      calories: a.calories + Number(r.calories || 0),
      protein: a.protein + Number(r.protein || 0),
      carbs: a.carbs + Number(r.carbs || 0),
      fat: a.fat + Number(r.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const calcPct = (curr, target) => Math.min(100, Math.round((curr / (target || 1)) * 100))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Nutrition & Macro Tracking</h1>
          <p className="text-sm text-gray-500">
            Log your daily nutrition and track against customized macronutrient goals
          </p>
        </div>
        <button className="btn-ghost text-sm" onClick={() => setShowGoalModal(true)}>
          ⚙️ Edit Macro Targets
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <span>✅</span>
          <span>{msg}</span>
        </div>
      )}

      {/* Macro Goal Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Calories',
            curr: Math.round(totals.calories),
            target: macroGoals.calories,
            unit: 'kcal',
            color: 'bg-indigo-600',
            bg: 'text-indigo-600 dark:text-indigo-400',
          },
          {
            label: 'Protein',
            curr: Math.round(totals.protein),
            target: macroGoals.protein,
            unit: 'g',
            color: 'bg-rose-500',
            bg: 'text-rose-500 dark:text-rose-400',
          },
          {
            label: 'Carbs',
            curr: Math.round(totals.carbs),
            target: macroGoals.carbs,
            unit: 'g',
            color: 'bg-amber-500',
            bg: 'text-amber-500 dark:text-amber-400',
          },
          {
            label: 'Fat',
            curr: Math.round(totals.fat),
            target: macroGoals.fat,
            unit: 'g',
            color: 'bg-emerald-500',
            bg: 'text-emerald-500 dark:text-emerald-400',
          },
        ].map((m) => {
          const pct = calcPct(m.curr, m.target)
          return (
            <div key={m.label} className="card space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{m.label}</span>
                <span className="font-bold">{pct}%</span>
              </div>
              <p className="text-xl font-extrabold">
                <span className={m.bg}>{m.curr}</span>{' '}
                <span className="text-xs font-normal text-gray-400">/ {m.target} {m.unit}</span>
              </p>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${m.color} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Log Meal Form */}
        <div className="card space-y-3">
          <h2 className="font-bold text-lg mb-1">Log Food / Meal</h2>
          <div>
            <label className="label block mb-1">Meal Category</label>
            <select
              className="input text-sm"
              value={f.meal_type}
              onChange={(e) => setF({ ...f, meal_type: e.target.value })}
            >
              <option value="breakfast">Breakfast 🍳</option>
              <option value="lunch">Lunch 🥗</option>
              <option value="dinner">Dinner 🥩</option>
              <option value="snack">Snack 🍎</option>
            </select>
          </div>

          <div>
            <label className="label block mb-1">Food Name</label>
            <input
              className="input text-sm"
              placeholder="e.g. Grilled Chicken & Rice"
              value={f.food_name}
              onChange={(e) => setF({ ...f, food_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label block mb-1">Calories (kcal)</label>
              <input
                type="number"
                className="input text-sm"
                value={f.calories}
                onChange={(e) => setF({ ...f, calories: +e.target.value })}
              />
            </div>
            <div>
              <label className="label block mb-1">Protein (g)</label>
              <input
                type="number"
                className="input text-sm"
                value={f.protein}
                onChange={(e) => setF({ ...f, protein: +e.target.value })}
              />
            </div>
            <div>
              <label className="label block mb-1">Carbs (g)</label>
              <input
                type="number"
                className="input text-sm"
                value={f.carbs}
                onChange={(e) => setF({ ...f, carbs: +e.target.value })}
              />
            </div>
            <div>
              <label className="label block mb-1">Fat (g)</label>
              <input
                type="number"
                className="input text-sm"
                value={f.fat}
                onChange={(e) => setF({ ...f, fat: +e.target.value })}
              />
            </div>
          </div>

          <button
            className="btn w-full mt-3"
            disabled={loading || !f.food_name.trim()}
            onClick={async () => {
              setLoading(true)
              try {
                await api.post('/track/nutrition', f)
                setF({
                  meal_type: 'snack',
                  food_name: '',
                  calories: 0,
                  protein: 0,
                  carbs: 0,
                  fat: 0,
                })
                load()
              } catch (err) {
                alert(err.response?.data?.message || 'Failed to log food')
              } finally {
                setLoading(false)
              }
            }}
          >
            {loading ? 'Adding...' : '+ Add Meal'}
          </button>
        </div>

        {/* Today's Meals & Log History */}
        <div className="md:col-span-2 card space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">Logged Meals History ({rows.length})</h2>
            <span className="text-xs text-gray-400">Today: {todayMeals.length} items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs border-b border-gray-100 dark:border-gray-800 pb-2">
                  <th className="py-2">Meal</th>
                  <th>Food</th>
                  <th>Calories</th>
                  <th>P / C / F</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.slice(0, 15).map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="py-2.5 font-medium capitalize text-indigo-600 dark:text-indigo-400 text-xs">
                      {r.meal_type}
                    </td>
                    <td className="font-semibold">{r.food_name}</td>
                    <td>{Math.round(r.calories)} kcal</td>
                    <td className="text-xs text-gray-500">
                      {Math.round(r.protein)}g · {Math.round(r.carbs)}g · {Math.round(r.fat)}g
                    </td>
                    <td className="text-xs text-gray-400">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <p className="text-center py-6 text-gray-400 text-sm">No meals logged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Macro Goal Setting Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Set Daily Macro Targets</h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowGoalModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={saveGoals} className="space-y-3">
              <div>
                <label className="label block mb-1">Calories Goal (kcal)</label>
                <input
                  type="number"
                  className="input text-sm"
                  value={macroGoals.calories}
                  onChange={(e) => setMacroGoals({ ...macroGoals, calories: +e.target.value })}
                />
              </div>
              <div>
                <label className="label block mb-1">Protein Goal (g)</label>
                <input
                  type="number"
                  className="input text-sm"
                  value={macroGoals.protein}
                  onChange={(e) => setMacroGoals({ ...macroGoals, protein: +e.target.value })}
                />
              </div>
              <div>
                <label className="label block mb-1">Carbs Goal (g)</label>
                <input
                  type="number"
                  className="input text-sm"
                  value={macroGoals.carbs}
                  onChange={(e) => setMacroGoals({ ...macroGoals, carbs: +e.target.value })}
                />
              </div>
              <div>
                <label className="label block mb-1">Fat Goal (g)</label>
                <input
                  type="number"
                  className="input text-sm"
                  value={macroGoals.fat}
                  onChange={(e) => setMacroGoals({ ...macroGoals, fat: +e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  className="btn-ghost flex-1 text-sm"
                  onClick={() => setShowGoalModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn flex-1 text-sm">
                  Save Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
