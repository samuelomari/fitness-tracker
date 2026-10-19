import { useEffect, useState } from 'react'
import api from '../api/client'
const COLORS = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
export default function ActivityHeatmap() {
  const [data, setData] = useState(null)
  const [days, setDays] = useState(120)
  useEffect(() => { api.get(`/activity/heatmap?days=${days}`).then((r) => setData(r.data)) }, [days])
  if (!data) return <p>Loading activity...</p>
  const weeks = []
  for (let i = 0; i < data.days.length; i += 7) weeks.push(data.days.slice(i, i + 7))
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Activity — last {days} days ({data.total} workouts)</h3>
        <select className="input" style={{ maxWidth: 140 }} value={days} onChange={(e) => setDays(+e.target.value)}>
          <option value={60}>60 days</option><option value={120}>120 days</option><option value={180}>180 days</option>
        </select>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((w, i) => (
          <div key={i} className="flex flex-col gap-1">
            {w.map((d) => (
              <div key={d.date} title={`${d.date}: ${d.count} workouts, ${Math.round(d.calories)} kcal`}
                className="rounded-sm" style={{ width: 14, height: 14, background: COLORS[d.level] }} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">Less {COLORS.map((c) => <span key={c} style={{ width: 12, height: 12, background: c }} className="rounded-sm inline-block" />)} More</div>
    </div>
  )
}
