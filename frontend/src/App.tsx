import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Home from '@/pages/Home'
import { useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import LoginThemeToggle from '@/components/LoginThemeToggle'

// Initialize the theme as light in the localStorage before the app loads
if (typeof window !== 'undefined') {
  // Set default to light if no preference exists
  if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'light')
  }
  
  // Add class to body for immediate styling
  document.documentElement.classList.add('light')
  document.documentElement.classList.remove('dark')
}

function App() {
  const { user } = useAuth()

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          {/* Our new theme toggle button is now a DOM element injected directly */}
          <LoginThemeToggle />
          
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
