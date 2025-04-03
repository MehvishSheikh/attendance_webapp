import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Home from '@/pages/Home'
import AdminDashboard from '@/pages/AdminDashboard'
import { useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import LoginThemeToggle from '@/components/LoginThemeToggle'
import { useEffect } from 'react'

// Force light theme styles immediately
if (typeof window !== 'undefined') {
  // Set default to light if no preference exists
  if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'light')
  }
  
  // Force light mode classes
  document.documentElement.classList.add('light')
  document.documentElement.classList.remove('dark')
  
  // Add direct styles
  const style = document.createElement('style')
  style.id = 'app-direct-styles'
  style.innerHTML = `
    body, html {
      background-color: #ffffff !important;
      color: #09090b !important;
    }
    
    .light {
      background-color: #ffffff !important;
      color: #09090b !important;
    }
    
    .dark {
      background-color: #09090b !important;
      color: #fafafa !important;
    }
  `
  document.head.appendChild(style)
}

function App() {
  const { user } = useAuth()

  // Add direct body styles
  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'
    document.body.style.color = '#09090b'
    
    return () => {
      const directStyles = document.getElementById('app-direct-styles')
      if (directStyles) {
        document.head.removeChild(directStyles)
      }
    }
  }, [])

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen transition-colors duration-300" 
             style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
          {/* Our theme toggle button is injected directly into the DOM */}
          <LoginThemeToggle />
          
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
            {/* Redirect all other paths to login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
