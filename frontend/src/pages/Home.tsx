import { useState } from 'react'
import Navbar from '@/components/Navbar'
import CheckInOut from '@/components/CheckInOut'
import Dashboard from '@/components/Dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, BarChart } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function Home() {
  const [activeTab, setActiveTab] = useState('attendance')
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <Navbar />
      
      {/* Theme Toggle is now in App.tsx */}
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl mb-8">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Employee Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track your attendance and manage your daily tasks
            </p>
          </div>
          
          <Tabs defaultValue="attendance" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="inline-flex h-12 items-center justify-center space-x-2 rounded-xl bg-muted/50 p-1 mb-8">
              <TabsTrigger 
                value="attendance" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-5 py-3 text-sm font-medium ring-offset-background transition-all hover:bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900"
              >
                <Clock className="h-5 w-5 mr-2" />
                <span>Attendance</span>
              </TabsTrigger>
              <TabsTrigger 
                value="dashboard" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-5 py-3 text-sm font-medium ring-offset-background transition-all hover:bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900"
              >
                <BarChart className="h-5 w-5 mr-2" />
                <span>Dashboard</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="attendance" className="animate-in fade-in-50 duration-500">
              
                <CheckInOut />
            
            </TabsContent>
            
            <TabsContent value="dashboard" className="animate-in fade-in-50 duration-500">
              <Dashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground mt-auto">
        <div className="container mx-auto">
          Senslyze Attendance System &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}
