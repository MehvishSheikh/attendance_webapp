import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Home from '@/pages/Home'
import { useAuth } from '@/context/AuthContext'

function App() {
  const { user } = useAuth()

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App
