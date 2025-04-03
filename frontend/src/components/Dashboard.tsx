import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAttendanceHistory } from '@/services/api'
import { formatDate, formatTime, getStatusColor } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Calendar, Clock, CheckSquare, MapPin, AlertTriangle, LayoutGrid, Briefcase } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

interface AttendanceRecord {
  id: number
  date: string
  checkInTime: string
  checkOutTime: string
  location: string
  task: string
  taskStatus: string
  projectName: string
}

const Dashboard = () => {
  const { user } = useAuth()
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      if (!user) return
      
      try {
        const history = await getAttendanceHistory()
        setAttendanceHistory(history)
      } catch (error) {
        console.error('Error fetching attendance history:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAttendanceHistory()
  }, [user])

  // Calculate stats
  const totalHours = attendanceHistory.reduce((total, record) => {
    if (!record.checkInTime || !record.checkOutTime) return total
    
    const checkIn = new Date(record.checkInTime)
    const checkOut = new Date(record.checkOutTime)
    const diff = checkOut.getTime() - checkIn.getTime()
    return total + (diff / (1000 * 60 * 60)) // convert ms to hours
  }, 0)
  
  const recentRecords = attendanceHistory.slice(0, 5)
  
  const { theme } = useTheme()
  
  // Calculate statistics
  const completedTasks = attendanceHistory.filter(r => r.taskStatus === 'completed').length
  const pendingTasks = attendanceHistory.filter(r => r.taskStatus === 'pending').length
  const blockedTasks = attendanceHistory.filter(r => r.taskStatus === 'blockage').length
  const totalTasks = attendanceHistory.filter(r => r.task).length
  
  // Get unique locations
  const uniqueLocations = [...new Set(attendanceHistory.map(record => record.location))].filter(Boolean).length
  
  return (
    <div className="space-y-8 transition-all duration-300">
      {/* Stats Overview */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-500/5">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <div className="rounded-full bg-blue-500/15 p-2 text-blue-500">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {attendanceHistory.length} days
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-emerald-500/5">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <div className="rounded-full bg-emerald-500/15 p-2 text-emerald-500">
              <CheckSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {completedTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% completion rate` : 'No tasks recorded'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-500/5">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <div className="rounded-full bg-purple-500/15 p-2 text-purple-500">
              <LayoutGrid className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {blockedTasks > 0 ? `+ ${blockedTasks} blocked tasks` : 'No blocked tasks'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-amber-500/5">
            <CardTitle className="text-sm font-medium">Work Locations</CardTitle>
            <div className="rounded-full bg-amber-500/15 p-2 text-amber-500">
              <MapPin className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{uniqueLocations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {uniqueLocations === 1 ? 'Office visited' : 'Offices visited'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card className="col-span-3 shadow-md">
        <CardHeader className="bg-primary/5 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="mt-1.5">
                Your recent check-ins and completed tasks
              </CardDescription>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-xs">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-amber-500 mr-1.5"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-red-500 mr-1.5"></div>
                <span>Blocked</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-3 text-muted-foreground">Loading your attendance records...</p>
            </div>
          ) : recentRecords.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-lg">
              <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-medium">No attendance records found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Your attendance history will appear here once you check in</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRecords.map((record) => (
                <div key={record.id} className={`border border-border rounded-lg p-5 shadow-sm transition-all duration-200 hover:shadow-md ${theme === 'dark' ? 'bg-card/30' : 'bg-card'}`}>
                  {/* Header with date, time, and location */}
                  <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-3 mb-4">
                    <div>
                      <h3 className="font-medium text-foreground flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        {formatDate(record.date)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1.5 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground/70" />
                        {record.checkInTime && formatTime(record.checkInTime)}
                        {record.checkOutTime && <> - {formatTime(record.checkOutTime)}</>}
                      </p>
                    </div>
                    <div className="flex items-center px-3 py-1.5 rounded-full text-sm bg-primary/10 text-primary">
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      {record.location}
                    </div>
                  </div>
                  
                  {/* Task details if available */}
                  {record.task && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3 mb-2">
                        <div className="flex items-center text-sm font-medium">
                          <Briefcase className="h-4 w-4 mr-2 text-primary/70" />
                          {record.projectName}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.taskStatus)}`}>
                          {record.taskStatus}
                        </div>
                      </div>
                      <p className="text-sm mt-3 text-muted-foreground bg-muted/30 p-3 rounded-md border border-border/50">
                        {record.task}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
