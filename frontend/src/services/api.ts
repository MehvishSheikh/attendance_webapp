import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Auth service endpoints
export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const registerUser = async (name: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { name, email, password })
  return response.data
}

export const logoutUser = async () => {
  const response = await api.post('/auth/logout')
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me')
  return response.data
}

// Attendance service endpoints
export const getCheckInStatus = async () => {
  const response = await api.get('/attendance/status')
  return response.data
}

export const checkIn = async () => {
  const response = await api.post('/attendance/checkin')
  return response.data
}

export const checkOut = async (task: string, taskStatus: string, projectName: string) => {
  const response = await api.post('/attendance/checkout', { task, taskStatus, projectName })
  return response.data
}

export const getAttendanceHistory = async () => {
  const response = await api.get('/attendance/history')
  return response.data
}

// Add an interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect to login page on authentication error
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
