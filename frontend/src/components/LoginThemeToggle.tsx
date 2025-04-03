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

  // Always render a placeholder, then replace it once mounted
  return (
    <div className="fixed top-6 right-6 z-50" id="theme-toggle-container">
      <Button
        size="icon"
        className={`rounded-full h-14 w-14 shadow-xl border-2 ${
          mounted ? (
            theme === 'dark' 
              ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 mobile-theme-toggle-light border-yellow-300' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white mobile-theme-toggle-dark border-indigo-400'
          ) : 'bg-gray-500 text-white border-gray-400'
        }`}
        onClick={mounted ? toggleTheme : undefined}
        id="global-theme-toggle"
      >
        {mounted ? (
          theme === 'dark' ? (
            <Sun className="h-6 w-6 theme-toggle-sun" />
          ) : (
            <Moon className="h-6 w-6 theme-toggle-moon" />
          )
        ) : (
          <div className="h-6 w-6 animate-pulse bg-white/30 rounded-full"></div>
        )}
      </Button>
    </div>
  )
}

export default LoginThemeToggle