import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAttendanceHistory } from '@/services/api'
import { formatDate, formatTime, getStatusColor } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Calendar, Clock, CheckSquare } from 'lucide-react'

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
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Across {attendanceHistory.length} days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceHistory.filter(r => r.taskStatus === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {attendanceHistory.filter(r => r.task).length} tasks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceHistory.length}</div>
            <p className="text-xs text-muted-foreground">
              Days recorded in the system
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your recent check-ins and completed tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading your attendance records...</p>
          ) : recentRecords.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No attendance records found</p>
          ) : (
            <div className="space-y-4">
              {recentRecords.map((record) => (
                <div key={record.id} className="border border-border rounded-lg p-4 bg-card/80 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{formatDate(record.date)}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {record.checkInTime && formatTime(record.checkInTime)} - 
                        {record.checkOutTime && formatTime(record.checkOutTime)}
                      </p>
                    </div>
                    <div className="text-sm bg-primary/10 text-primary-foreground px-2.5 py-1 rounded-md">
                      {record.location}
                    </div>
                  </div>
                  
                  {record.task && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-foreground/90">{record.projectName}</div>
                        <div className={`px-2.5 py-1 rounded-md text-xs ${getStatusColor(record.taskStatus)}`}>
                          {record.taskStatus}
                        </div>
                      </div>
                      <p className="text-sm mt-2 text-muted-foreground">{record.task}</p>
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
