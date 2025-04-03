import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { getCheckInStatus, checkIn, checkOut, getLocations } from '@/services/api'
import { Clock, MapPin, CheckCircle, XCircle, Building, Calendar, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import TaskForm from './TaskForm'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useTheme } from '@/context/ThemeContext'

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

  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <Card className="w-full shadow-md border border-border overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              Attendance Tracker
            </CardTitle>
            <CardDescription className="mt-1.5 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> 
              {currentDate}
            </CardDescription>
          </div>
          <div className="text-base font-medium flex items-center px-3 py-1.5 rounded-md bg-muted/70">
            {currentTime}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        {isCheckedIn ? (
          <div className="space-y-6">
            <div className={`rounded-lg p-5 flex items-center ${isDark 
              ? 'bg-green-950/40 border border-green-900/30' 
              : 'bg-green-50 border border-green-200'}`}>
              <div className={`rounded-full p-3 mr-4 ${isDark
                ? 'bg-green-900/40 text-green-400'
                : 'bg-green-100 text-green-600'}`}>
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className={`font-medium text-lg ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  Currently Checked In
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-green-500/80' : 'text-green-600/80'}`}>
                  You checked in at {checkInTime || 'earlier today'}
                </p>
              </div>
            </div>
            
            {showTaskForm ? (
              <div className="border border-border rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                  Complete Your Workday
                </h3>
                <TaskForm onSubmit={handleTaskSubmit} onCancel={handleTaskCancel} />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  When you're ready to finish your workday, click the button below to check out.
                  You'll be asked to provide details about your work.
                </p>
                <Button
                  onClick={() => handleCheckOut()}
                  variant="destructive"
                  className="w-full gap-2"
                  size="lg"
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4" />
                  {isLoading ? 'Processing...' : 'Check Out'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`rounded-lg p-5 flex items-center ${isDark 
              ? 'bg-blue-950/40 border border-blue-900/30' 
              : 'bg-blue-50 border border-blue-200'}`}>
              <div className={`rounded-full p-3 mr-4 ${isDark
                ? 'bg-blue-900/40 text-blue-400'
                : 'bg-blue-100 text-blue-600'}`}>
                <Building className="h-6 w-6" />
              </div>
              <div>
                <p className={`font-medium text-lg ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Ready to Start Your Day?
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-blue-500/80' : 'text-blue-600/80'}`}>
                  Select your office location to check in
                </p>
              </div>
            </div>
            
            {showLocationForm ? (
              <div className="border border-border rounded-lg p-5 shadow-sm">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  Select Your Location
                </h3>
                <Form {...checkInForm}>
                  <form onSubmit={checkInForm.handleSubmit(onLocationSubmit)} className="space-y-5">
                    <FormField
                      control={checkInForm.control}
                      name="locationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Office Location</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id.toString()}>
                                  {location.name} ({location.pincode})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-3 pt-2">
                      <Button type="submit" size="lg" className="flex-1 gap-2" disabled={isLoading}>
                        <CheckCircle className="h-4 w-4" />
                        {isLoading ? 'Processing...' : 'Check In'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="lg"
                        onClick={handleLocationCancel}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              <Button
                onClick={handleShowLocationForm}
                size="lg"
                className="w-full gap-2"
                disabled={isLoading}
              >
                <MapPin className="h-4 w-4" />
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
