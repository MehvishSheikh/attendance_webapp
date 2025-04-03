import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { getCheckInStatus, checkIn, checkOut, getLocations } from '@/services/api'
import { Clock, MapPin } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import TaskForm from './TaskForm'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Define schemas
const checkInSchema = z.object({
  locationId: z.string({
    required_error: "Please select a location",
  }),
})

type CheckInFormValues = z.infer<typeof checkInSchema>

interface Location {
  id: number
  name: string
  pincode: string
}

const CheckInOut = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [showLocationForm, setShowLocationForm] = useState(false)
  
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
  
  // Initialize the check-in form
  const checkInForm = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      locationId: '',
    },
  })

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return
      
      try {
        // Fetch check-in status
        const statusResponse = await getCheckInStatus()
        if (statusResponse.isCheckedIn) {
          setIsCheckedIn(true)
          setCheckInTime(statusResponse.checkInTime)
        }
        
        // Fetch locations
        const locationsResponse = await getLocations()
        setLocations(locationsResponse)
      } catch (error) {
        console.error('Error fetching initial data:', error)
      }
    }
    
    fetchInitialData()
  }, [user])
  
  const handleShowLocationForm = () => {
    setShowLocationForm(true)
  }
  
  const handleLocationCancel = () => {
    setShowLocationForm(false)
  }
  
  const onLocationSubmit = async (values: CheckInFormValues) => {
    setIsLoading(true)
    try {
      console.log('Checking in with location ID:', values.locationId)
      // Convert string to number for API call
      const locationId = parseInt(values.locationId, 10)
      const response = await checkIn(locationId)
      setIsCheckedIn(true)
      setCheckInTime(response.checkInTime)
      setShowLocationForm(false)
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
            
            {showLocationForm ? (
              <form onSubmit={checkInForm.handleSubmit(onLocationSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="locationId" className="block text-sm font-medium">
                    Select Location
                  </label>
                  <select
                    id="locationId"
                    {...checkInForm.register('locationId')}
                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white"
                  >
                    <option value="">-- Select a location --</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name} ({location.pincode})
                      </option>
                    ))}
                  </select>
                  {checkInForm.formState.errors.locationId && (
                    <p className="text-red-500 text-xs mt-1">
                      {checkInForm.formState.errors.locationId.message}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Check In'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleLocationCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                onClick={handleShowLocationForm}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Check In Now'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CheckInOut
