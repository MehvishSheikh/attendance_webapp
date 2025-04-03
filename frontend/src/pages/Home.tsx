import { useState } from 'react'
import Navbar from '@/components/Navbar'
import CheckInOut from '@/components/CheckInOut'
import Dashboard from '@/components/Dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, BarChart } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('attendance')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center tracking-tight">
            Employee Dashboard
          </h1>
          
          <Tabs defaultValue="attendance" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 rounded-lg shadow-sm">
              <TabsTrigger value="attendance" className="flex items-center gap-2 text-sm md:text-base py-3">
                <Clock className="h-5 w-5" />
                <span>Attendance</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2 text-sm md:text-base py-3">
                <BarChart className="h-5 w-5" />
                <span>Dashboard</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="attendance" className="animate-in fade-in-50 duration-500">
              <div className="max-w-md mx-auto">
                <CheckInOut />
              </div>
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
