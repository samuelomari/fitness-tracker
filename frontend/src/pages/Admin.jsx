import { useEffect, useState } from 'react'
import api from '../api/client'
export default function Admin() {
  const [users, setUsers] = useState([]); const [stats, setStats] = useState(null); const [err, setErr] = useState('')
  const load = () => {
    api.get('/admin/users').then((r) => setUsers(r.data)).catch(() => setErr('Admin only'))
    api.get('/admin/stats').then((r) => setStats(r.data)).catch(() => {})
  }
  useEffect(load, [])
  if (err) return <p className="text-red-500">{err}</p>
  return <div className="space-y-4">
    {stats && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[['Users', stats.total_users], ['Active', stats.active_users], ['Workouts', stats.total_workouts], ['Top exercise', stats.popular_exercises[0]?.name || '—']].map(([k, v]) => (
        <div key={k} className="card"><p className="text-sm text-gray-500">{k}</p><p className="text-2xl font-bold">{v}</p></div>))}</div>}
    <div className="card overflow-x-auto"><h2 className="font-bold mb-3">Users ({users.length})</h2>
      <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th>Name</th><th>Email</th><th>Joined</th><th></th></tr></thead>
        <tbody>{users.map((u) => <tr key={u.id} className="border-t border-gray-100 dark:border-gray-800">
          <td className="py-2">{u.name} {u.is_admin && '(admin)'}</td><td>{u.email}</td><td>{u.created_at?.slice(0, 10)}</td>
          <td className="flex gap-2"><button className="text-indigo-600" onClick={async () => { await api.put(`/admin/users/${u.id}/suspend`); load() }}>Suspend/Activate</button>
            <button className="text-red-500" onClick={async () => { if (confirm('Delete user?')) { await api.delete(`/admin/users/${u.id}`); load() } }}>Delete</button></td></tr>)}</tbody></table></div>
  </div>
}
