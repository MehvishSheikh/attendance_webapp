import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Home from '@/pages/Home'
import { useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import LoginThemeToggle from '@/components/LoginThemeToggle'
import { useEffect, useState } from 'react'

function App() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  // Ensure we're mounted before rendering theme toggle
  useEffect(() => {
    setMounted(true)
    
    // Force theme toggle to be visible by adding inline styles
    setTimeout(() => {
      const themeToggle = document.getElementById('global-theme-toggle')
      if (themeToggle) {
        themeToggle.style.cssText = `
          display: flex !important;
          position: fixed !important;
          z-index: 9999 !important;
          width: 56px !important;
          height: 56px !important;
          box-shadow: 0 0 25px rgba(0, 0, 0, 0.4) !important;
        `
      }
      
      const themeToggleContainer = document.getElementById('theme-toggle-container')
      if (themeToggleContainer) {
        themeToggleContainer.style.cssText = `
          position: fixed !important;
          top: 24px !important;
          right: 24px !important;
          z-index: 9999 !important;
        `
      }
    }, 100)
  }, [])

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          {/* Global Theme Toggle Button that appears on all pages */}
          {mounted && <LoginThemeToggle />}
          
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
