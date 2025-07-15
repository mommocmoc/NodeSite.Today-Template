import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDarkMode } from '@/lib/use-dark-mode'
import type { NavigationItem } from '../pages/api/navigation'
import { DarkModeToggle } from './DarkModeToggle'
import styles from './OverlayNavigation.module.css'

interface OverlayNavigationProps {
  site?: any
}

export function OverlayNavigation({ site }: OverlayNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([])
  const [loading, setLoading] = useState(true)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

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
          }
        }
      } catch (err) {
        console.error('Failed to fetch navigation:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNavigation()
  }, [])

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <Link href='/' className={styles.logo}>
            {site?.name || 'NotionDB to Your Site'}
          </Link>

          <div className={styles.navControls}>
            {/* Desktop navigation items */}
            <div className={styles.desktopNav}>
              {!loading &&
                navigationItems.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={item.urlPath}
                    className={styles.desktopNavItem}
                  >
                    {item.displayName}
                  </Link>
                ))}
            </div>

            <DarkModeToggle size='medium' className={styles.darkModeToggle} />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={styles.menuToggle}
              aria-label='Toggle menu'
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <div className={styles.menuItems}>
              {loading ? (
                <div className={styles.menuItem}>Loading...</div>
              ) : (
                navigationItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.urlPath}
                    className={styles.menuItem}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.displayName}
                  </Link>
                ))
              )}
            </div>

            <div className={styles.menuFooter}>
              <DarkModeToggle size='large' className={styles.mobileToggle} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
