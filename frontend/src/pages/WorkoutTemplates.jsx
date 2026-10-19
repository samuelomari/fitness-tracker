import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const ROUTINES = [
  {
    id: 'push',
    name: 'Push Day (Hypertrophy)',
    category: 'Hypertrophy',
    icon: '💪',
    description: 'Target chest, front deltoids, and triceps with heavy compound pressing and isolation.',
    estimatedCalories: 350,
    durationMin: 45,
    exercises: [
      { exercise_name: 'Bench Press', sets: 4, reps: 8, weight_kg: 60 },
      { exercise_name: 'Overhead Press', sets: 3, reps: 10, weight_kg: 40 },
      { exercise_name: 'Push-Up', sets: 3, reps: 15, weight_kg: 0 },
    ],
  },
  {
    id: 'pull',
    name: 'Pull Day (Back & Biceps)',
    category: 'Strength & Width',
    icon: '🏋️‍♂️',
    description: 'Build back thickness, lat width, and peak biceps strength through rows and pulls.',
    estimatedCalories: 380,
    durationMin: 50,
    exercises: [
      { exercise_name: 'Deadlift', sets: 4, reps: 6, weight_kg: 90 },
      { exercise_name: 'Pull-Up', sets: 3, reps: 8, weight_kg: 0 },
      { exercise_name: 'Bicep Curl', sets: 3, reps: 12, weight_kg: 15 },
    ],
  },
  {
    id: 'legs',
    name: 'Leg Day & Core',
    category: 'Lower Body Power',
    icon: '🦵',
    description: 'Develop quad power, glute strength, and unbreakable core stability.',
    estimatedCalories: 420,
    durationMin: 50,
    exercises: [
      { exercise_name: 'Squat', sets: 4, reps: 8, weight_kg: 80 },
      { exercise_name: 'Lunges', sets: 3, reps: 12, weight_kg: 0 },
      { exercise_name: 'Plank', sets: 3, reps: 60, weight_kg: 0 },
    ],
  },
  {
    id: 'full_body',
    name: '5x5 Full-Body Strength',
    category: 'Classic Strength',
    icon: '⚡',
    description: 'Classic powerbuilding routine targeting all major muscle groups in high-intensity sets.',
    estimatedCalories: 460,
    durationMin: 60,
    exercises: [
      { exercise_name: 'Squat', sets: 5, reps: 5, weight_kg: 85 },
      { exercise_name: 'Bench Press', sets: 5, reps: 5, weight_kg: 65 },
      { exercise_name: 'Deadlift', sets: 1, reps: 5, weight_kg: 100 },
      { exercise_name: 'Overhead Press', sets: 5, reps: 5, weight_kg: 40 },
    ],
  },
  {
    id: 'hiit',
    name: 'HIIT & Cardio Conditioning',
    category: 'Fat Loss & Endurance',
    icon: '🔥',
    description: 'Fast-paced interval work designed to maximize VO2 max and burn high calories.',
    estimatedCalories: 400,
    durationMin: 35,
    exercises: [
      { exercise_name: 'Running', sets: 1, reps: 1, weight_kg: 0, duration_min: 25, calories: 280 },
      { exercise_name: 'Push-Up', sets: 3, reps: 15, weight_kg: 0 },
      { exercise_name: 'Lunges', sets: 3, reps: 15, weight_kg: 0 },
    ],
  },
]

export default function WorkoutTemplates() {
  const [loggingId, setLoggingId] = useState(null)
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10))
  const [successMsg, setSuccessMsg] = useState('')
  const nav = useNavigate()

  const handleLogRoutine = async (routine) => {
    setLoggingId(routine.id)
    setSuccessMsg('')
    try {
      const perExerciseCals = Math.round(routine.estimatedCalories / routine.exercises.length)
      const perExerciseDuration = Math.round(routine.durationMin / routine.exercises.length)

      for (const ex of routine.exercises) {
        await api.post('/workouts', {
          exercise_name: ex.exercise_name,
          sets: ex.sets,
          reps: ex.reps,
          weight_kg: ex.weight_kg,
          duration_min: ex.duration_min || perExerciseDuration,
          calories: ex.calories || perExerciseCals,
          date: logDate,
        })
      }

      setSuccessMsg(`Successfully logged "${routine.name}" (${routine.exercises.length} exercises)! 🎉`)
      setTimeout(() => {
        nav('/workouts')
      }, 1500)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log routine')
    } finally {
      setLoggingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pre-Built Workout Routines</h1>
          <p className="text-sm text-gray-500">
            Select a verified training template to log your workout with 1 click
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Log for Date:</label>
          <input
            type="date"
            className="input w-40 text-sm"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
          />
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium text-sm flex items-center gap-2">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ROUTINES.map((routine) => (
          <div
            key={routine.id}
            className="card flex flex-col justify-between hover:border-indigo-400 border border-transparent transition"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <span className="text-3xl">{routine.icon}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                  {routine.category}
                </span>
              </div>
              <h2 className="text-lg font-bold">{routine.name}</h2>
              <p className="text-xs text-gray-500 mt-1 mb-3">{routine.description}</p>

              <div className="flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-gray-300 py-2 border-y border-gray-100 dark:border-gray-800 mb-3">
                <span>⏱️ {routine.durationMin} mins</span>
                <span>🔥 ~{routine.estimatedCalories} kcal</span>
                <span>📋 {routine.exercises.length} movements</span>
              </div>

              <div className="space-y-1.5 mb-4">
                <p className="text-xs font-semibold uppercase text-gray-400">Exercises Included</p>
                {routine.exercises.map((ex, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/60"
                  >
                    <span className="font-medium">{ex.exercise_name}</span>
                    <span className="text-gray-500">
                      {ex.sets} × {ex.reps} {ex.weight_kg > 0 ? `@ ${ex.weight_kg}kg` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn w-full text-sm flex items-center justify-center gap-2"
              onClick={() => handleLogRoutine(routine)}
              disabled={loggingId !== null}
            >
              {loggingId === routine.id ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Logging Routine...</span>
                </>
              ) : (
                '⚡ Log This Workout (1-Click)'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

