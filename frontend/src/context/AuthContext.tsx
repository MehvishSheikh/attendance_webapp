import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { loginUser, registerUser, logoutUser } from '@/services/api'

interface User {
  id: number
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {}
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // No automatic login - just set loading to false immediately
  useEffect(() => {
    console.log('Auth initialization: No automatic login')
    setLoading(false)
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const userData = await loginUser(email, password)
      setUser(userData)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      const userData = await registerUser(name, email, password)
      setUser(userData)
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await logoutUser()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
