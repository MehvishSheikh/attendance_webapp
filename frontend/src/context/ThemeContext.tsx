import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get the theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null
    // Check if user has a system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    // Return saved theme, user preference, or default to dark
    return savedTheme || (prefersDark ? 'dark' : 'light')
  })

  // Set up the document with transition styles
  useEffect(() => {
    // Add transition styles to head once
    const styleElement = document.createElement('style')
    styleElement.innerHTML = `
      body {
        transition: background-color 0.3s ease, color 0.3s ease;
      }
      
      * {
        transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
      }
    `
    document.head.appendChild(styleElement)
    
    return () => {
      // Clean up style element on unmount
      document.head.removeChild(styleElement)
    }
  }, [])

  // Apply theme changes
  useEffect(() => {
    // Update the HTML element's class when theme changes
    const html = document.documentElement
    
    if (theme === 'dark') {
      html.classList.add('dark')
      html.classList.remove('light')
      document.body.style.backgroundColor = '#09090b'
      document.body.style.color = '#fafafa'
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#09090b'
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}