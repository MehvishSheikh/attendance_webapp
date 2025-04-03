import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { formatDate, formatTime, getStatusColor } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { 
  Users, Clock, Trash2, Calendar, ClipboardList, 
  FileDown, Database, ChevronDown 
} from 'lucide-react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import * as api from '@/services/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface User {
  id: number
  name: string
  email: string
  is_admin: boolean
  created_at: string
}

interface AttendanceRecord {
  id: number
  date: string
  checkInTime: string
  checkOutTime: string | null
  location: string
  task: string | null
  taskStatus: string | null
  projectName: string | null
  user: {
    id: number
    name: string
    email: string
  }
}

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const [users, setUsers] = useState<User[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState({
    users: false,
    attendance: false,
    delete: false
  })
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [userAttendance, setUserAttendance] = useState<AttendanceRecord[]>([])
  const [exportMonth, setExportMonth] = useState<string>(new Date().getMonth() + 1 + '')
  const [exportYear, setExportYear] = useState<string>(new Date().getFullYear() + '')
  
  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/')
    }
  }, [user, navigate])
  
  // Fetch all users
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }))
    try {
      const response = await axios.get('/api/admin/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load user data'
      })
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }
  
  // Fetch all attendance records
  const fetchAttendance = async () => {
    setLoading(prev => ({ ...prev, attendance: true }))
    try {
      const response = await axios.get('/api/admin/attendance')
      setAttendance(response.data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load attendance data'
      })
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }))
    }
  }
  
  // Fetch attendance for a specific user
  const fetchUserAttendance = async (userId: number) => {
    setLoading(prev => ({ ...prev, attendance: true }))
    try {
      const response = await axios.get(`/api/admin/attendance/${userId}`)
      setUserAttendance(response.data)
      setSelectedUser(userId)
    } catch (error) {
      console.error(`Error fetching attendance for user ${userId}:`, error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load user attendance data'
      })
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }))
    }
  }
  
  // Delete a user
  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    
    setLoading(prev => ({ ...prev, delete: true }))
    try {
      await axios.delete(`/api/admin/users/${userId}`)
      toast({
        title: 'Success',
        description: 'User deleted successfully'
      })
      // Refresh user list
      fetchUsers()
      // Clear user attendance if deleted user was selected
      if (selectedUser === userId) {
        setSelectedUser(null)
        setUserAttendance([])
      }
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user'
      })
    } finally {
      setLoading(prev => ({ ...prev, delete: false }))
    }
  }
  
  // Export attendance data for a specific user as CSV
  const exportAttendance = (userId: number) => {
    if (!userId) return
    
    const year = parseInt(exportYear)
    const month = parseInt(exportMonth)
    
    try {
      api.exportUserAttendance(userId, year, month)
      toast({
        title: 'Export Started',
        description: 'Your download should begin shortly'
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Unable to download attendance data'
      })
    }
  }
  
  // Load initial data
  useEffect(() => {
    fetchUsers()
    fetchAttendance()
  }, [])
  
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Users className="h-8 w-8 mr-3 text-primary" />
        Admin Dashboard
      </h1>
      
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="mb-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Attendance
          </TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Users className="h-5 w-5 mr-2 text-primary" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.users ? (
                <div className="text-center py-4">Loading users...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="border-b">
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map(user => (
                          <tr key={user.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 text-sm">{user.id}</td>
                            <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                            <td className="px-4 py-3 text-sm">{user.email}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.is_admin 
                                  ? isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'
                                  : isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.is_admin ? 'Admin' : 'User'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {user.created_at ? formatDate(new Date(user.created_at)) : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-right space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => fetchUserAttendance(user.id)}
                                className="inline-flex items-center gap-1"
                              >
                                <ClipboardList className="h-3.5 w-3.5" />
                                Records
                              </Button>
                              {!user.is_admin && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => deleteUser(user.id)}
                                  disabled={loading.delete}
                                  className="inline-flex items-center gap-1"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          
          {selectedUser && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  User Attendance Records
                  {users.find(u => u.id === selectedUser) && (
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                      for {users.find(u => u.id === selectedUser)?.name}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Export Controls */}
                <div className="mb-6 p-4 bg-muted/30 rounded-md border">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <FileDown className="h-4 w-4 text-primary" />
                    Export Attendance Data
                  </h3>
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Month</label>
                      <Select 
                        value={exportMonth} 
                        onValueChange={setExportMonth}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">January</SelectItem>
                          <SelectItem value="2">February</SelectItem>
                          <SelectItem value="3">March</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">June</SelectItem>
                          <SelectItem value="7">July</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Year</label>
                      <Select 
                        value={exportYear} 
                        onValueChange={setExportYear}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={() => exportAttendance(selectedUser!)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Download CSV
                    </Button>
                  </div>
                </div>
                
                {loading.attendance ? (
                  <div className="text-center py-4">Loading attendance records...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead className="border-b">
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Check In</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Check Out</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Project</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Task</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {userAttendance.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                              No attendance records found
                            </td>
                          </tr>
                        ) : (
                          userAttendance.map(record => (
                            <tr key={record.id} className="hover:bg-muted/30">
                              <td className="px-4 py-3 text-sm">
                                {record.date ? formatDate(new Date(record.date)) : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {record.checkInTime ? formatTime(new Date(record.checkInTime)) : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {record.checkOutTime ? formatTime(new Date(record.checkOutTime)) : 'Pending'}
                              </td>
                              <td className="px-4 py-3 text-sm">{record.location || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm">{record.projectName || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm">
                                <div className="max-w-xs truncate">{record.task || 'N/A'}</div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {record.taskStatus ? (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.taskStatus)}`}>
                                    {record.taskStatus}
                                  </span>
                                ) : (
                                  'N/A'
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                All Attendance Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.attendance ? (
                <div className="text-center py-4">Loading attendance records...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="border-b">
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Check In</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Check Out</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Project</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Task</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {attendance.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                            No attendance records found
                          </td>
                        </tr>
                      ) : (
                        attendance.map(record => (
                          <tr key={record.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 text-sm font-medium">{record.user?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm">
                              {record.date ? formatDate(new Date(record.date)) : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {record.checkInTime ? formatTime(new Date(record.checkInTime)) : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {record.checkOutTime ? formatTime(new Date(record.checkOutTime)) : 'Pending'}
                            </td>
                            <td className="px-4 py-3 text-sm">{record.location || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm">{record.projectName || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="max-w-xs truncate">{record.task || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {record.taskStatus ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.taskStatus)}`}>
                                  {record.taskStatus}
                                </span>
                              ) : (
                                'N/A'
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboard