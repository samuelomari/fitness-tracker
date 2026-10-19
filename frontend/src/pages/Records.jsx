import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Records() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  // 1RM Calculator state
  const [calcWeight, setCalcWeight] = useState(80)
  const [calcReps, setCalcReps] = useState(5)

  useEffect(() => {
    api
      .get('/workouts')
      .then((res) => setWorkouts(res.data))
      .catch((err) => console.error('Failed to load workouts', err))
      .finally(() => setLoading(false))
  }, [])

  // Calculate Personal Records grouped by exercise
  const prs = {}
  workouts.forEach((w) => {
    const name = w.exercise_name
    const weight = Number(w.weight_kg) || 0
    const reps = Number(w.reps) || 0
    const estimated1RM = reps > 0 ? Math.round(weight * (1 + reps / 30)) : weight

    if (!prs[name]) {
      prs[name] = {
        exercise_name: name,
        maxWeight: weight,
        maxReps: reps,
        max1RM: estimated1RM,
        maxVolume: weight * reps,
        date: w.date,
        totalSessions: 1,
      }
    } else {
      prs[name].totalSessions += 1
      if (weight > prs[name].maxWeight) {
        prs[name].maxWeight = weight
        prs[name].date = w.date
      }
      if (estimated1RM > prs[name].max1RM) {
        prs[name].max1RM = estimated1RM
      }
      if (weight * reps > prs[name].maxVolume) {
        prs[name].maxVolume = weight * reps
      }
    }
  })

  const prList = Object.values(prs).sort((a, b) => b.maxWeight - a.maxWeight)

  // 1RM calculations
  const calc1RM = calcReps > 0 ? Math.round(calcWeight * (1 + calcReps / 30)) : calcWeight
  const percentages = [
    { pct: 95, reps: '1-2 reps', intensity: 'Heavy Max' },
    { pct: 90, reps: '3-4 reps', intensity: 'Strength' },
    { pct: 85, reps: '5-6 reps', intensity: 'Strength/Hypertrophy' },
    { pct: 80, reps: '7-8 reps', intensity: 'Hypertrophy' },
    { pct: 75, reps: '9-10 reps', intensity: 'Hypertrophy' },
    { pct: 70, reps: '11-12 reps', intensity: 'Muscular Endurance' },
    { pct: 60, reps: '15+ reps', intensity: 'Deload / Warmup' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Personal Records & 1RM Calculator</h1>
        <p className="text-sm text-gray-500">
          Track your all-time heaviest lifts and calculate custom training loads
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Personal Records Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span>🏆</span> All-Time Personal Bests ({prList.length})
            </h2>

            {loading ? (
              <p className="text-sm text-gray-400 py-4">Loading workout history...</p>
            ) : prList.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">🏋️</p>
                <p>No workout logs found yet. Start logging workouts to track your PRs!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {prList.map((pr) => (
                  <div
                    key={pr.exercise_name}
                    className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 space-y-2 hover:border-indigo-400 transition"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                        {pr.exercise_name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-semibold">
                        PR
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <p className="text-gray-400">Max Weight</p>
                        <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                          {pr.maxWeight} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Est. 1RM</p>
                        <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                          {pr.max1RM} kg
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-400 pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                      <span>Logged: {pr.date || 'Recent'}</span>
                      <span>{pr.totalSessions} sessions</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 1RM Calculator */}
        <div className="card space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>🧮</span> 1-Rep Max Calculator
          </h2>
          <p className="text-xs text-gray-500">
            Estimate your 1-rep max using the standard Epley formula: Weight × (1 + Reps/30).
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label block mb-1">Weight (kg)</label>
              <input
                type="number"
                className="input text-sm"
                value={calcWeight}
                onChange={(e) => setCalcWeight(+e.target.value)}
                min="1"
              />
            </div>
            <div>
              <label className="label block mb-1">Reps</label>
              <input
                type="number"
                className="input text-sm"
                value={calcReps}
                onChange={(e) => setCalcReps(+e.target.value)}
                min="1"
                max="30"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-900 text-center">
            <p className="text-xs font-semibold uppercase text-gray-400">Estimated 1-Rep Max</p>
            <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              {calc1RM} <span className="text-base font-normal">kg</span>
            </p>
          </div>

          {/* Training Percentage Table */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Training Load Zones</h3>
            <div className="space-y-1.5 text-xs">
              {percentages.map((p) => {
                const weightAtPct = Math.round((calc1RM * p.pct) / 100)
                return (
                  <div
                    key={p.pct}
                    className="flex justify-between items-center p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/60"
                  >
                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-200">{p.pct}%</span>
                      <span className="text-gray-400 ml-1.5">({p.reps})</span>
                    </div>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {weightAtPct} kg
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

