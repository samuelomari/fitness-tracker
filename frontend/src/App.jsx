import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import Challenges from './pages/Challenges'
import Login from './pages/Login'
import Register from './pages/Register'
import Workouts from './pages/Workouts'
import WorkoutTemplates from './pages/WorkoutTemplates'
import Wellness from './pages/Wellness'
import Records from './pages/Records'
import Reports from './pages/Reports'
import Goals from './pages/Goals'
import Nutrition from './pages/Nutrition'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import { useAuth } from './context/AuthContext'

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="text-center py-10 text-gray-400">Loading...</p>
  if (!user) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Guard><Dashboard /></Guard>} />
        <Route path="/workouts" element={<Guard><Workouts /></Guard>} />
        <Route path="/routines" element={<Guard><WorkoutTemplates /></Guard>} />
        <Route path="/wellness" element={<Guard><Wellness /></Guard>} />
        <Route path="/records" element={<Guard><Records /></Guard>} />
        <Route path="/reports" element={<Guard><Reports /></Guard>} />
        <Route path="/goals" element={<Guard><Goals /></Guard>} />
        <Route path="/nutrition" element={<Guard><Nutrition /></Guard>} />
        <Route path="/library" element={<Guard><Library /></Guard>} />
        <Route path="/challenges" element={<Guard><Challenges /></Guard>} />
        <Route path="/profile" element={<Guard><Profile /></Guard>} />
        <Route path="/admin" element={<Guard><Admin /></Guard>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Layout>
  )
}
