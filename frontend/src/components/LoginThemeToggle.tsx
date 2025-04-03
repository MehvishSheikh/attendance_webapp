import { useTheme } from '@/context/ThemeContext'
import { useEffect, useRef } from 'react'

const LoginThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  
  // Setup theme toggle styles
  useEffect(() => {
    
    // Add inline style element to ensure toggle is visible
    const style = document.createElement('style')
    style.id = 'theme-toggle-css'
    style.innerHTML = `
      #fixed-theme-toggle {
        position: fixed !important;
        top: 24px !important;
        right: 24px !important;
        width: 60px !important;
        height: 60px !important;
        border-radius: 30px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        z-index: 9999 !important;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.4) !important;
        border: 3px solid #ffffff !important;
        transition: all 0.3s ease !important;
        animation: bounce 2s infinite !important;
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
        width: 28px !important;
        height: 28px !important;
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      const styleElement = document.getElementById('theme-toggle-css')
      if (styleElement) {
        document.head.removeChild(styleElement)
      }
    }
  }, [])
  
  useEffect(() => {
    // Create floating button that always appears if it doesn't exist
    if (!document.getElementById('fixed-theme-toggle')) {
      const button = document.createElement('button')
      button.id = 'fixed-theme-toggle'
      buttonRef.current = button
      
      // Set initial appearance
      button.className = theme === 'dark' ? 'dark-theme-toggle' : 'light-theme-toggle'
      button.innerHTML = theme === 'dark' 
        ? '<svg id="toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg id="toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
      
      button.onclick = toggleTheme
      document.body.appendChild(button)
    }

    // Always update the button when theme changes
    const existingButton = buttonRef.current || document.getElementById('fixed-theme-toggle') as HTMLButtonElement
    if (existingButton) {
      buttonRef.current = existingButton
      existingButton.className = theme === 'dark' ? 'dark-theme-toggle' : 'light-theme-toggle'
      existingButton.innerHTML = theme === 'dark' 
        ? '<svg id="toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg id="toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
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