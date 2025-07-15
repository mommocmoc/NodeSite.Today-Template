import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import type { NavigationItem } from '../pages/api/navigation'
import styles from './OverlayNavigation.module.css'

interface DynamicNavigationProps {
  className?: string
}

export function DynamicNavigation({ className }: DynamicNavigationProps) {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        setLoading(true)
        // 캐시 무효화를 위한 타임스탬프 추가
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/navigation?t=${timestamp}`)
        const data = (await response.json()) as {
          success: boolean
          items?: NavigationItem[]
          message?: string
          error?: string
        }

        if (data.success) {
          setNavigationItems(data.items || [])
        } else {
          console.error('Failed to load navigation:', data.message)
          console.error('Navigation API Error Details:', data)
          setError(data.message || 'Failed to load navigation')

          // 환경 변수 오류인 경우 기본 네비게이션 제공
          if (data.error === 'MISSING_NAVIGATION_DB_ID') {
            setNavigationItems([
              {
                id: 'home',
                categoryName: 'Home',
                displayName: 'Home',
                navigationOrder: 1,
                displayType: 'Gallery',
                isActive: true,
                urlPath: '/'
              }
            ])
            setError(null)
          }
        }
      } catch (err) {
        console.error('Failed to fetch navigation:', err)
        setError('Failed to load navigation')
      } finally {
        setLoading(false)
      }
    }

    fetchNavigation()
  }, [])

  if (loading) {
    return (
      <nav className={`${styles.navigation} ${className || ''}`}>
        <div className={styles.loadingNav}>Loading...</div>
      </nav>
    )
  }

  if (error) {
    return (
      <nav className={`${styles.navigation} ${className || ''}`}>
        <div className={styles.errorNav}>Navigation Error</div>
      </nav>
    )
  }

  return (
    <nav className={`${styles.navigation} ${className || ''}`}>
      <ul className={styles.navList}>
        {navigationItems.map((item) => (
          <li key={item.id} className={styles.navItem}>
            <Link href={item.urlPath} className={styles.navLink}>
              {item.displayName}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
