import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { getCheckInStatus, checkIn, checkOut } from '@/services/api'
import { Clock, MapPin } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import TaskForm from './TaskForm'

const CheckInOut = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Get current time
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  
  useEffect(() => {
    const fetchCheckInStatus = async () => {
      if (!user) return
      
      try {
        const response = await getCheckInStatus()
        if (response.isCheckedIn) {
          setIsCheckedIn(true)
          setCheckInTime(response.checkInTime)
        }
      } catch (error) {
        console.error('Error fetching check-in status:', error)
      }
    }
    
    fetchCheckInStatus()
  }, [user])
  
  const handleCheckIn = async () => {
    setIsLoading(true)
    try {
      const response = await checkIn()
      setIsCheckedIn(true)
      setCheckInTime(response.checkInTime)
      toast({
        title: 'Check-in successful',
        description: `You've checked in at ${response.checkInTime}`,
      })
    } catch (error) {
      console.error('Check-in error:', error)
      toast({
        variant: 'destructive',
        title: 'Check-in failed',
        description: (error as Error).message || 'Failed to check in. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCheckOut = async (taskData?: { task: string; status: string; projectName: string }) => {
    if (!taskData) {
      setShowTaskForm(true)
      return
    }
    
    console.log('Checking out with task data:', taskData)
    setIsLoading(true)
    try {
      await checkOut(taskData.task, taskData.status, taskData.projectName)
      setIsCheckedIn(false)
      setCheckInTime(null)
      setShowTaskForm(false)
      toast({
        title: 'Check-out successful',
        description: 'Your work has been recorded',
      })
    } catch (error) {
      console.error('Check-out error:', error)
      toast({
        variant: 'destructive',
        title: 'Check-out failed',
        description: (error as Error).message || 'Failed to check out. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleTaskSubmit = (data: { task: string; status: string; projectName: string }) => {
    console.log('CheckInOut handleTaskSubmit received data:', data)
    // Make sure we're passing the status as taskStatus for the API
    handleCheckOut({
      task: data.task,
      status: data.status, // This should be renamed to taskStatus in the API call
      projectName: data.projectName
    })
  }
  
  const handleTaskCancel = () => {
    setShowTaskForm(false)
  }

  return (
    <Card className="w-full shadow-md border border-border">
      <CardHeader className="bg-primary/5 pb-4 border-b border-border">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Attendance Tracker</span>
          <span className="text-sm font-normal flex items-center text-muted-foreground">
            <Clock className="w-4 h-4 mr-1.5" /> {currentTime}
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{currentDate}</p>
      </CardHeader>
      <CardContent className="pt-6">
        {isCheckedIn ? (
          <div className="space-y-6">
            <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-md p-4 flex items-center">
              <div className="bg-emerald-900/30 text-emerald-400 rounded-full p-2.5 mr-4">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-emerald-400">Currently Checked In</p>
                <p className="text-sm text-emerald-500/80 mt-0.5">
                  Since {checkInTime || 'earlier today'}
                </p>
              </div>
            </div>
            
            {showTaskForm ? (
              <TaskForm onSubmit={handleTaskSubmit} onCancel={handleTaskCancel} />
            ) : (
              <Button
                onClick={() => handleCheckOut()}
                variant="destructive"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Check Out'}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-950/20 border border-blue-800/30 rounded-md p-4 flex items-center">
              <div className="bg-blue-900/30 text-blue-400 rounded-full p-2.5 mr-4">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-blue-400">Ready to start work?</p>
                <p className="text-sm text-blue-500/80 mt-0.5">
                  Your location will be recorded when you check in
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleCheckIn}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Check In Now'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CheckInOut
