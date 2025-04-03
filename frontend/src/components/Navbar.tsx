import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { LogOut, User, Moon, Sun } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '@/context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme } = useTheme()

  return (
    <header className={`bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95'
    }`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-1.5 rounded-full ${theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
              <path d="M12 6v6l4 4" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">Senslyze</span>
            <div className="text-xs text-muted-foreground">Attendance Tracker</div>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-3">
            <div className="mr-1">
              <ThemeToggle />
            </div>
            
            <div className="hidden md:flex items-center gap-3 border-l border-border pl-3">
              <div className={`h-9 w-9 rounded-full ${theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'} flex items-center justify-center text-primary`}>
                <User className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight">{user.name}</span>
                <span className="text-xs text-muted-foreground">Employee</span>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:block">Logout</span>
            </Button>
          </div>
        )}
      </div>
      
      {/* Mobile Theme Toggle Button - Fixed at the bottom right for easy access */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className={`rounded-full h-12 w-12 shadow-lg ${theme === 'dark' 
            ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 mobile-theme-toggle-light' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white mobile-theme-toggle-dark'}`}
          onClick={() => document.querySelector<HTMLButtonElement>('.theme-toggle')?.click()}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 theme-toggle-sun" />
          ) : (
            <Moon className="h-5 w-5 theme-toggle-moon" />
          )}
        </Button>
      </div>
    </header>
  )
}
