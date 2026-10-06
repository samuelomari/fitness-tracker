import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Workouts from './pages/Workouts'
import Goals from './pages/Goals'
import Nutrition from './pages/Nutrition'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import { useAuth } from './context/AuthContext'
function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <p>Loading...</p>
  if (!user) return <Navigate to="/login" />
  return children
}
export default function App() {
  return <Layout><Routes>
    <Route path="/" element={<Guard><Dashboard /></Guard>} />
    <Route path="/workouts" element={<Guard><Workouts /></Guard>} />
    <Route path="/goals" element={<Guard><Goals /></Guard>} />
    <Route path="/nutrition" element={<Guard><Nutrition /></Guard>} />
    <Route path="/profile" element={<Guard><Profile /></Guard>} />
    <Route path="/admin" element={<Guard><Admin /></Guard>} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Routes></Layout>
}
