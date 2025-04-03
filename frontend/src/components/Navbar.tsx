import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
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
          <span className="font-bold text-xl">Senslyze</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium hidden sm:block">{user.name}</span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:block">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
