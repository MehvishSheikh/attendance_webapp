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
  locationId: z.string().optional(),
  useGps: z.boolean().default(true)
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
  
  // State for GPS location
  const [gpsLocation, setGpsLocation] = useState<{latitude: number, longitude: number, address: string} | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // Initialize the check-in form
  const checkInForm = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      locationId: '',
      useGps: true
    },
  })

  // Function to get GPS location
  const getGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser")
      return
    }

    setIsGettingLocation(true)
    setGpsError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        console.log('GPS location obtained:', latitude, longitude)
        
        // Get address from coordinates (simplified)
        // In a real app, you might use a geocoding service
        const address = `Detected location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        
        setGpsLocation({ latitude, longitude, address })
        setIsGettingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setGpsError(`Error getting location: ${error.message}`)
        setIsGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

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
      let response;
      
      if (values.useGps && gpsLocation) {
        // Use GPS coordinates for check-in
        console.log('Checking in with GPS:', gpsLocation)
        response = await checkIn(
          undefined, // locationId becomes optional when using GPS
          gpsLocation.latitude,
          gpsLocation.longitude,
          gpsLocation.address
        )
      } else if (values.locationId) {
        // Fallback to manual location selection
        console.log('Checking in with location ID:', values.locationId)
        const locationId = parseInt(values.locationId, 10)
        response = await checkIn(locationId)
      } else {
        throw new Error('Please select a location or allow GPS access')
      }
      
      setIsCheckedIn(true)
      setCheckInTime(response.checkInTime)
      setShowLocationForm(false)
      
      const successMessage = response.gpsRecorded 
        ? `You've checked in at ${response.checkInTime} with GPS location` 
        : `You've checked in at ${response.checkInTime}`
      
      toast({
        title: 'Check-in successful',
        description: successMessage,
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
                  {gpsLocation ? "GPS Location Detected" : "Choose Your Location"}
                </h3>
                
                {gpsLocation ? (
                  <div className={`mb-5 p-4 rounded-md ${isDark ? 'bg-green-950/30' : 'bg-green-50'} border ${isDark ? 'border-green-900/30' : 'border-green-200'}`}>
                    <p className="text-sm font-medium mb-1 flex items-center">
                      <MapPin className="inline-block h-3.5 w-3.5 mr-1.5 text-green-600" /> 
                      GPS Location Detected
                    </p>
                    <p className="text-xs text-muted-foreground">{gpsLocation.address}</p>
                  </div>
                ) : (
                  <div className="mb-5">
                    <Button 
                      type="button" 
                      onClick={getGpsLocation}
                      className="w-full mb-3 flex gap-2 items-center justify-center"
                      disabled={isGettingLocation}
                      variant="outline"
                    >
                      <MapPin className="h-4 w-4" />
                      {isGettingLocation ? "Detecting Location..." : "Detect My GPS Location"}
                    </Button>
                    
                    {gpsError && (
                      <div className="text-sm text-red-500 mt-2 p-2 border border-red-200 rounded bg-red-50">
                        <p>{gpsError}</p>
                        <p className="text-xs mt-1">Please select a location manually below.</p>
                      </div>
                    )}
                  </div>
                )}
                
                <Form {...checkInForm}>
                  <form onSubmit={checkInForm.handleSubmit((data) => onLocationSubmit(data as CheckInFormValues))} className="space-y-5">
                    {(!gpsLocation || gpsError) && (
                      <FormField
                        control={checkInForm.control as any}
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
                    )}
                    
                    <div className="flex gap-3 pt-2">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="flex-1 gap-2" 
                        disabled={isLoading || (isGettingLocation && !gpsLocation)}
                      >
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
