import React, { useEffect, useState } from 'react'
import { useDarkMode } from '@/lib/use-dark-mode'
import styles from './DarkModeToggle.module.css'

interface DarkModeToggleProps {
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export function DarkModeToggle({
  className,
  size = 'medium'
}: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering dark mode state after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Use default light mode state until mounted to prevent hydration mismatch
  const currentMode = mounted ? isDarkMode : false
  
  return (
    <button
      onClick={toggleDarkMode}
      className={`${styles.toggleButton} ${styles[size]} ${className || ''}`}
      aria-label={currentMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={currentMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div
        className={`${styles.toggleTrack} ${currentMode ? styles.dark : styles.light}`}
      >
        <div
          className={`${styles.toggleThumb} ${currentMode ? styles.darkThumb : styles.lightThumb}`}
        >
          <div className={styles.icon}>
            {currentMode ? (
              // Moon icon
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
              </svg>
            ) : (
              // Sun icon
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <circle cx='12' cy='12' r='5' />
                <path d='M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42' />
              </svg>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
