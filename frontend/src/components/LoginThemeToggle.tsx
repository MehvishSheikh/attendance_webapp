import { useTheme } from '@/context/ThemeContext'
import { useEffect, useRef } from 'react'

const LoginThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  
  // Setup theme toggle styles
  useEffect(() => {
    console.log('Setting up theme toggle styles')
    
    // Add inline style element to ensure toggle is visible
    const style = document.createElement('style')
    style.id = 'theme-toggle-css'
    style.innerHTML = `
      #fixed-theme-toggle {
        position: fixed !important;
        top: 16px !important;
        right: 16px !important;
        width: 40px !important;
        height: 40px !important;
        border-radius: 20px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        z-index: 99999 !important;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3) !important;
        border: 2px solid #ffffff !important;
        transition: all 0.3s ease !important;
        font-size: 12px !important;
        font-weight: bold !important;
      }
      
      .light-theme-toggle {
        background-color: #4338ca !important;
        color: white !important;
      }
      
      .dark-theme-toggle {
        background-color: #f59e0b !important;
        color: #1f2937 !important;
      }
      
      #toggle-icon {
        width: 20px !important;
        height: 20px !important;
      }
      
      /* No animation for the theme toggle */
    `
    document.head.appendChild(style)
    
    console.log('Theme toggle styles applied')
    
    return () => {
      const styleElement = document.getElementById('theme-toggle-css')
      if (styleElement) {
        document.head.removeChild(styleElement)
      }
    }
  }, [])
  
  useEffect(() => {
    console.log('Creating or updating theme toggle button. Current theme:', theme)
    
    // Create button if it doesn't exist
    let button = document.getElementById('fixed-theme-toggle') as HTMLButtonElement
    
    if (!button) {
      console.log('Creating new toggle button')
      button = document.createElement('button')
      button.id = 'fixed-theme-toggle'
      button.setAttribute('style', 'position: fixed !important; top: 16px !important; right: 16px !important; z-index: 99999 !important;')
      document.body.appendChild(button)
    }
    
    // Store reference to button
    buttonRef.current = button
    
    // Update appearance based on current theme
    button.className = theme === 'dark' ? 'dark-theme-toggle' : 'light-theme-toggle'
    button.innerHTML = `
      <svg id="toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${theme === 'dark' 
          ? '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'
          : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'}
      </svg>
    `
    
    // Log for debugging
    console.log('Button updated with class:', button.className)
    
    // Set up click handler
    button.onclick = () => {
      console.log('Theme toggle clicked. Current theme:', theme)
      toggleTheme()
    }
  }, [theme, toggleTheme])
  
  // Clean up function to remove the button when component unmounts
  useEffect(() => {
    return () => {
      // Remove the button from the DOM when component is unmounted
      const button = document.getElementById('fixed-theme-toggle')
      if (button) {
        document.body.removeChild(button)
      }
    }
  }, [])
  
  // Component doesn't render anything visible - it just manages the floating button
  return null
}

export default LoginThemeToggle