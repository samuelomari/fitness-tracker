import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Wellness() {
  const [waterLogs, setWaterLogs] = useState([])
  const [sleepLogs, setSleepLogs] = useState([])
  const [waterAmount, setWaterAmount] = useState(250)
  const [dailyWaterGoal, setDailyWaterGoal] = useState(() => {
    return Number(localStorage.getItem('fittrack_water_goal')) || 2500
  })

  // Sleep form
  const todayStr = new Date().toISOString().slice(0, 10)
  const [sleepDate, setSleepDate] = useState(todayStr)
  const [bedtime, setBedtime] = useState('22:30')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [sleepMsg, setSleepMsg] = useState('')
  const [waterMsg, setWaterMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    try {
      const [waterRes, sleepRes] = await Promise.all([
        api.get('/track/water'),
        api.get('/track/sleep'),
      ])
      setWaterLogs(waterRes.data)
      setSleepLogs(sleepRes.data)
    } catch (err) {
      console.error('Failed to load wellness data', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const logWater = async (amount) => {
    const ml = Number(amount)
    if (!ml || ml <= 0) return
    setLoading(true)
    try {
      await api.post('/track/water', { amount_ml: ml, date: todayStr })
      setWaterMsg(`Added ${ml} ml of water! 💧`)
      setTimeout(() => setWaterMsg(''), 3000)
      await loadData()
    } catch {
      setWaterMsg('Failed to log water')
    } finally {
      setLoading(false)
    }
  }

  const handleSleepSubmit = async (e) => {
    e.preventDefault()
    setSleepMsg('')
    try {
      // Calculate full ISO datetime
      const bedDateTime = new Date(`${sleepDate}T${bedtime}:00`)
      let wakeDateTime = new Date(`${sleepDate}T${wakeTime}:00`)
      // If wake time is earlier than bedtime, wake happened the next day
      if (wakeDateTime <= bedDateTime) {
        wakeDateTime.setDate(wakeDateTime.getDate() + 1)
      }

      await api.post('/track/sleep', {
        bedtime: bedDateTime.toISOString(),
        wakeup: wakeDateTime.toISOString(),
        date: sleepDate,
      })
      const dur = ((wakeDateTime - bedDateTime) / (1000 * 60 * 60)).toFixed(1)
      setSleepMsg(`Logged ${dur} hours of sleep! 🌙`)
      setTimeout(() => setSleepMsg(''), 3500)
      await loadData()
    } catch (err) {
      setSleepMsg(err.response?.data?.message || 'Failed to log sleep')
    }
  }

  // Hydration metrics
  const todayWater = waterLogs
    .filter((w) => w.date === todayStr)
    .reduce((sum, w) => sum + Number(w.amount_ml), 0)
  const waterPct = Math.min(100, Math.round((todayWater / dailyWaterGoal) * 100))

  // Sleep metrics
  const avgSleep = sleepLogs.length
    ? (sleepLogs.slice(0, 7).reduce((sum, s) => sum + Number(s.duration_hours || 0), 0) / Math.min(7, sleepLogs.length)).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Wellness & Recovery Tracker</h1>
          <p className="text-sm text-gray-500">Monitor your daily hydration, sleep quality, and rest</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Water Goal (ml):</label>
          <input
            type="number"
            step="100"
            className="input w-28 text-sm"
            value={dailyWaterGoal}
            onChange={(e) => {
              const val = +e.target.value
              setDailyWaterGoal(val)
              localStorage.setItem('fittrack_water_goal', val)
            }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Hydration Card */}
        <div className="card space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>💧</span> Hydration
            </h2>
            <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">
              {todayWater} / {dailyWaterGoal} ml ({waterPct}%)
            </span>
          </div>

          {waterMsg && (
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-sm">
              {waterMsg}
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-gray-700">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${waterPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-right">
              {dailyWaterGoal > todayWater ? `${dailyWaterGoal - todayWater} ml left to reach goal` : '🎉 Goal achieved!'}
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Quick Add</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '+250 ml', val: 250, icon: '🥛' },
                { label: '+500 ml', val: 500, icon: '🍶' },
                { label: '+750 ml', val: 750, icon: '🚰' },
                { label: '+1000 ml', val: 1000, icon: '🧃' },
              ].map((btn) => (
                <button
                  key={btn.val}
                  type="button"
                  className="btn-ghost flex flex-col items-center py-2 text-xs font-semibold hover:border-sky-500"
                  onClick={() => logWater(btn.val)}
                  disabled={loading}
                >
                  <span className="text-base">{btn.icon}</span>
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="flex gap-2">
            <input
              type="number"
              step="50"
              className="input text-sm"
              placeholder="Custom amount (ml)"
              value={waterAmount}
              onChange={(e) => setWaterAmount(e.target.value)}
            />
            <button
              className="btn whitespace-nowrap text-sm"
              onClick={() => logWater(waterAmount)}
              disabled={loading}
            >
              Log Water
            </button>
          </div>

          {/* Recent Water Logs */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Recent Logs</h3>
            <div className="max-h-40 overflow-y-auto space-y-1 text-sm divide-y divide-gray-100 dark:divide-gray-800">
              {waterLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="pt-1 flex justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>{log.date}</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">+{log.amount_ml} ml</span>
                </div>
              ))}
              {waterLogs.length === 0 && (
                <p className="text-xs text-gray-400 py-2">No water logs recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sleep Card */}
        <div className="card space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>🌙</span> Sleep & Rest
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold">
              7d Avg: {avgSleep} hrs
            </span>
          </div>

          {sleepMsg && (
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-sm">
              {sleepMsg}
            </div>
          )}

          <form onSubmit={handleSleepSubmit} className="space-y-3">
            <div>
              <label className="label block mb-1">Date</label>
              <input
                type="date"
                className="input text-sm"
                value={sleepDate}
                onChange={(e) => setSleepDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label block mb-1">Bedtime 🛏️</label>
                <input
                  type="time"
                  className="input text-sm"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label block mb-1">Wake Time ⏰</label>
                <input
                  type="time"
                  className="input text-sm"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn w-full text-sm mt-2">
              Log Sleep
            </button>
          </form>

          {/* Sleep Logs List */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Recent Sleep Sessions</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sleepLogs.slice(0, 5).map((s) => {
                const hours = Number(s.duration_hours || 0)
                const qualityColor =
                  hours >= 7 && hours <= 9
                    ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                    : hours >= 6
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'

                return (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-xs"
                  >
                    <div>
                      <p className="font-semibold">{s.date}</p>
                      <p className="text-gray-400">
                        {s.bedtime ? new Date(s.bedtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} –{' '}
                        {s.wakeup ? new Date(s.wakeup).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg font-bold ${qualityColor}`}>
                      {hours} hrs
                    </span>
                  </div>
                )
              })}
              {sleepLogs.length === 0 && (
                <p className="text-xs text-gray-400 py-2">No sleep entries logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

