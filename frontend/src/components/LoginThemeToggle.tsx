
import { useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'

const LoginThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'theme-toggle-css'
    style.innerHTML = `
      #fixed-theme-toggle {
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        width: 48px !important;
        height: 48px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        z-index: 99999 !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        border: none !important;
        transition: all 0.3s ease !important;
        transform: scale(0.9) !important;
      }

      #fixed-theme-toggle:hover {
        transform: scale(1) !important;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
      }

      .light-theme-toggle {
        background: linear-gradient(135deg, #1e293b, #0f172a) !important;
        color: #e2e8f0 !important;
      }

      .dark-theme-toggle {
        background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
        color: #1f2937 !important;
      }

      #toggle-icon {
        width: 20px !important;
        height: 20px !important;
        transition: transform 0.3s ease !important;
      }

      #fixed-theme-toggle:hover #toggle-icon {
        transform: rotate(45deg) !important;
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
    let button = document.getElementById('fixed-theme-toggle') as HTMLButtonElement

    if (!button) {
      button = document.createElement('button')
      button.id = 'fixed-theme-toggle'
      document.body.appendChild(button)
    }

    buttonRef.current = button
    button.className = theme === 'dark' ? 'dark-theme-toggle' : 'light-theme-toggle'
    button.innerHTML = `
      <svg id="toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${theme === 'dark' 
          ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
          : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
        }
      </svg>
    `

    button.onclick = toggleTheme
  }, [theme, toggleTheme])

  useEffect(() => {
    return () => {
      const button = document.getElementById('fixed-theme-toggle')
      if (button) {
        document.body.removeChild(button)
      }
    }
  }, [])

  return null
}

export default LoginThemeToggle
