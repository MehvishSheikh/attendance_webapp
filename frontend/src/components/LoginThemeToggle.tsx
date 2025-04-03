import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { useState, useEffect } from 'react'

const LoginThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  
  return (
    <div className="fixed top-6 right-6 z-50">
      <Button
        size="icon"
        className={`rounded-full h-12 w-12 shadow-lg ${theme === 'dark' 
          ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 mobile-theme-toggle-light' 
          : 'bg-indigo-600 hover:bg-indigo-700 text-white mobile-theme-toggle-dark'}`}
        onClick={toggleTheme}
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 theme-toggle-sun" />
        ) : (
          <Moon className="h-5 w-5 theme-toggle-moon" />
        )}
      </Button>
    </div>
  )
}

export default LoginThemeToggle