import React, { useState } from 'react'
import styles from './AdminTools.module.css'

interface AdminToolsProps {
  className?: string
}

export function AdminTools({ className }: AdminToolsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [message, setMessage] = useState('')

  const forceRefresh = async () => {
    setIsRefreshing(true)
    setMessage('')

    try {
      // Clear browser cache for API calls
      const timestamp = new Date().getTime()

      // Force refresh navigation data
      const navResponse = await fetch(
        `/api/navigation?t=${timestamp}&force=true`
      )
      const navData = await navResponse.json()
      console.log('Navigation refresh:', navData)

      // Force refresh gallery data
      const galleryResponse = await fetch(
        `/api/notion-gallery?t=${timestamp}&force=true`
      )
      const galleryData = await galleryResponse.json()
      console.log('Gallery refresh:', galleryData)

      // Show success message before reload
      setMessage('✅ Cache cleared! Reloading page...')

      // Delay reload to show message
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      setMessage('❌ Failed to clear cache')
      console.error('Cache refresh error:', error)
      setIsRefreshing(false)
    }
  }

  // Only show in development or when admin query parameter is present
  const showAdmin =
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' &&
      window.location.search.includes('admin=true'))

  if (!showAdmin) return null

  return (
    <div className={`${styles.adminTools} ${className || ''}`}>
      <div className={styles.adminPanel}>
        <h3>🔧 Admin Tools</h3>
        <button
          onClick={forceRefresh}
          disabled={isRefreshing}
          className={styles.refreshButton}
        >
          {isRefreshing ? '🔄 Refreshing...' : '🔄 Force Refresh Cache'}
        </button>
        {message && <p className={styles.message}>{message}</p>}
        <p className={styles.hint}>
          Updates not showing? Click refresh to clear all caches.
        </p>
      </div>
    </div>
  )
}
