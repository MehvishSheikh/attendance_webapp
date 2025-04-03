import AuthForm from '@/components/AuthForm'
import { useTheme } from '@/context/ThemeContext'

export default function Register() {
  const { theme } = useTheme()
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 bg-background ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      {/* Theme Toggle is now in App.tsx */}
      
      <div className="w-full max-w-md space-y-8 animate-in fade-in-50 duration-700">
        <div className="text-center">
          <div className="flex justify-center">
            <div className={`rounded-full p-4 ${theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-16 w-16 text-primary"
              >
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                <path d="M12 6v6l4 4" />
              </svg>
            </div>
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight">Join Senslyze</h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Create an account to track your attendance and tasks
          </p>
        </div>
        
        <AuthForm type="register" />
      </div>
    </div>
  )
}
