import { useState } from 'react'
import Navbar from '@/components/Navbar'
import CheckInOut from '@/components/CheckInOut'
import Dashboard from '@/components/Dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, BarChart } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('attendance')

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Employee Dashboard</h1>
          
          <Tabs defaultValue="attendance" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="attendance" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Attendance</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center">
                <BarChart className="h-4 w-4 mr-2" />
                <span>Dashboard</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="attendance">
              <div className="max-w-md mx-auto">
                <CheckInOut />
              </div>
            </TabsContent>
            
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="border-t py-4 text-center text-sm text-gray-500">
        <div className="container mx-auto">
          Senslyze Attendance System &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}
