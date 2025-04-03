import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

// Create context with default values to prevent undefined errors
const defaultTheme: Theme = 'dark'
const defaultThemeContext: ThemeContextType = {
  theme: defaultTheme,
  toggleTheme: () => {}
}

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext)

export const useTheme = () => {
  return useContext(ThemeContext)
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Default theme to dark to avoid flashing during initial load
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Initialize theme from localStorage or system preference only on client-side
  useEffect(() => {
    try {
      // Try to get the theme from localStorage
      const savedTheme = localStorage.getItem('theme') as Theme | null
      // Check if user has a system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      // Set theme based on saved preference, system preference, or default
      const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
      setTheme(initialTheme)
      
      // Setup complete
      setIsInitialized(true)
    } catch (error) {
      console.error('Error initializing theme:', error)
      // Fallback to dark theme in case of error
      setTheme('dark')
      setIsInitialized(true)
    }
  }, [])

  // Set up the document with transition styles
  useEffect(() => {
    if (!isInitialized) return
    
    try {
      // Add transition styles to head once
      const styleElement = document.createElement('style')
      styleElement.innerHTML = `
        body {
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        * {
          transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        /* Make theme toggle button more prominent */
        #global-theme-toggle {
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          position: relative;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(104, 120, 240, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(104, 120, 240, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(104, 120, 240, 0);
          }
        }
      `
      document.head.appendChild(styleElement)
      
      return () => {
        // Clean up style element on unmount
        document.head.removeChild(styleElement)
      }
    } catch (error) {
      console.error('Error setting up theme styles:', error)
    }
  }, [isInitialized])

  // Apply theme changes
  useEffect(() => {
    if (!isInitialized) return
    
    try {
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
    } catch (error) {
      console.error('Error applying theme:', error)
    }
  }, [theme, isInitialized])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
    
    // Add a small delay and force the browser to redraw the theme toggle button
    setTimeout(() => {
      const toggleButton = document.getElementById('global-theme-toggle')
      if (toggleButton) {
        toggleButton.style.display = 'none'
        setTimeout(() => {
          toggleButton.style.display = 'flex'
        }, 10)
      }
    }, 50)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}