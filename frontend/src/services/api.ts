import axios from 'axios'
import { backend_url } from '@/context/constants'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Auth service endpoints
export const loginUser = async (email: string, password: string) => {
  const response = await api.post(`${backend_url}/auth/login`, { email, password })
  return response.data
}

export const registerUser = async (name: string, email: string, password: string) => {
  const response = await api.post(`${backend_url}/auth/register`, { name, email, password })
  return response.data
}

export const logoutUser = async () => {
  const response = await api.post(`${backend_url}/auth/logout`)
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get(`${backend_url}/auth/user`)
  return response.data
}

// Attendance service endpoints
export const getCheckInStatus = async () => {
  const response = await api.get(`${backend_url}/attendance/status`)
  return response.data
}

export const checkIn = async (
  locationId?: number, 
  latitude?: number, 
  longitude?: number,
  address?: string
) => {
  // If GPS coordinates are provided, send them with the request
  if (latitude && longitude) {
    const response = await api.post(`${backend_url}/attendance/checkin`, { 
      locationId, // Optional, may be undefined
      latitude, 
      longitude,
      address: address || `Location at coordinates (${latitude}, ${longitude})`
    })
    return response.data
  } else {
    // Fall back to location ID only
    const response = await api.post(`${backend_url}/attendance/checkin`, { locationId })
    return response.data
  }
}

export const checkOut = async (task: string, status: string, projectName: string) => {
  // Convert the status parameter to taskStatus for the API
  const taskStatus = status
  console.log('Sending checkout data:', { task, taskStatus, projectName })
  const response = await api.post(`${backend_url}/attendance/checkout`, { task, taskStatus, projectName })
  return response.data
}

export const getAttendanceHistory = async () => {
  const response = await api.get(`${backend_url}/attendance/history`)
  return response.data
}

export const getLocations = async () => {
  const response = await api.get(`${backend_url}/attendance/locations`)
  return response.data
}

// Admin service endpoints
export const getAllUsers = async () => {
  const response = await api.get(`${backend_url}/admin/users`)
  return response.data
}

export const getUser = async (userId: number) => {
  const response = await api.get(`${backend_url}/admin/users/${userId}`)
  return response.data
}

export const deleteUser = async (userId: number) => {
  const response = await api.delete(`${backend_url}/admin/users/${userId}`)
  return response.data
}

export const getAllAttendance = async () => {
  const response = await api.get(`${backend_url}/admin/attendance`)
  return response.data
}

export const getUserAttendance = async (userId: number) => {
  const response = await api.get(`${backend_url}/admin/attendance/${userId}`)
  return response.data
}

export const exportUserAttendance = async (userId: number, year: number, month: number) => {
  // Use window.open to trigger file download
  window.open(`/api/admin/attendance/export/${userId}?year=${year}&month=${month}`, '_blank')
}

// Add an interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only redirect for 401 errors that are not from the getCurrentUser endpoint
    if (error.response && 
        error.response.status === 401 && 
        error.config.url !== `${backend_url}/api/auth/user`) {
      // Redirect to login page on authentication error (but not for the current user check)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
