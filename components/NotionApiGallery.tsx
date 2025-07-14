import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/legacy/image'
import styles from './GalleryGrid.module.css'

interface NotionGalleryItem {
  id: string
  title: string
  imageUrl: string | null
  mediaType: 'image' | 'video'
  description: string
  url: string
  createdTime: string
  lastEditedTime: string
  formattedDate: string
  aspectRatio?: number // 가로/세로 비율 (width/height)
  gridSize?: 'small' | 'medium' | 'large' | 'wide' | 'tall' // 그리드 크기
}

interface NotionApiGalleryProps {
  databaseId?: string
  categoryFilter?: string
}

interface GalleryItemProps {
  item: NotionGalleryItem
}

function GalleryItem({ item }: GalleryItemProps) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)
  const [gridSize, setGridSize] = useState<string>('medium')
  const [actualWidth, setActualWidth] = useState<number | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const imageContainerRef = React.useRef<HTMLDivElement>(null)
  const observerRef = React.useRef<HTMLDivElement>(null)
  
  // 비율에 따른 그리드 크기 계산
  const calculateGridSize = (ratio: number) => {
    if (ratio > 1.8) return 'wide'      // 매우 가로로 긴 이미지
    if (ratio > 1.3) return 'large'     // 가로로 긴 이미지  
    if (ratio > 0.8) return 'medium'    // 거의 정사각형
    if (ratio > 0.6) return 'tall'      // 세로로 긴 이미지
    return 'small'                      // 매우 세로로 긴 이미지
  }

  // Intersection Observer로 뷰포트 진입 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' } // 200px 전에 미리 로드
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // 적절한 텍스트 너비 계산 (최소/최대 제한 적용)
  const calculateOptimalTextWidth = useCallback((containerWidth: number, containerHeight: number, mediaRatio: number) => {
    // 컨테이너가 미디어 비율에 맞춰 조정되므로 항상 컨테이너 너비 사용
    const actualDisplayWidth = containerWidth
    
    // 단계별 너비 조정 (레퍼런스 디자인 참고)
    if (actualDisplayWidth < 120) return 120      // 최소 너비
    if (actualDisplayWidth > 300) return 300     // 최대 너비
    
    // 단계별 조정 (너무 세밀하지 않게)
    if (actualDisplayWidth < 150) return 140
    if (actualDisplayWidth < 200) return 180
    if (actualDisplayWidth < 250) return 220
    return 260
  }, [])

  // 이미지 로딩 완료 시 비율 계산 및 적절한 너비 측정
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const ratio = img.naturalWidth / img.naturalHeight
    setAspectRatio(ratio)
    setGridSize(calculateGridSize(ratio))
    
    // 컨테이너 비율을 실제 이미지 비율로 조정
    if (imageContainerRef.current) {
      imageContainerRef.current.style.aspectRatio = ratio.toString()
    }
    
    // 적절한 텍스트 너비 계산
    setTimeout(() => {
      if (imageContainerRef.current) {
        const containerRect = imageContainerRef.current.getBoundingClientRect()
        const optimalWidth = calculateOptimalTextWidth(containerRect.width, containerRect.height, ratio)
        setActualWidth(optimalWidth)
      }
    }, 100)
  }

  // 비디오 로딩 완료 시 비율 계산 및 적절한 너비 측정
  const handleVideoLoad = () => {
    if (videoRef.current) {
      const ratio = videoRef.current.videoWidth / videoRef.current.videoHeight
      setAspectRatio(ratio)
      setGridSize(calculateGridSize(ratio))
      
      // 컨테이너 비율을 실제 비디오 비율로 조정
      if (imageContainerRef.current) {
        imageContainerRef.current.style.aspectRatio = ratio.toString()
      }
      
      // 적절한 텍스트 너비 계산
      setTimeout(() => {
        if (imageContainerRef.current) {
          const containerRect = imageContainerRef.current.getBoundingClientRect()
          const optimalWidth = calculateOptimalTextWidth(containerRect.width, containerRect.height, ratio)
          setActualWidth(optimalWidth)
        }
      }, 100)
    }
  }
  
  // 비디오 자동 재생 (소리 없이)
  React.useEffect(() => {
    if (videoRef.current && item.mediaType === 'video') {
      // autoPlay 속성이 있지만 추가로 확실히 재생
      videoRef.current.play().catch(console.error)
    }
  }, [item.mediaType])

  // 호버시 처음부터 재생
  React.useEffect(() => {
    if (videoRef.current && item.mediaType === 'video' && isHovered) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(console.error)
    }
  }, [isHovered, item.mediaType])
  
  return (
    <Link 
      href={item.url} 
      className={`${styles.galleryItem} ${styles[gridSize]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        ref={imageContainerRef}
        className={styles.imageContainer}
      >
        <div ref={observerRef} style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px' }}></div>
          {item.imageUrl && !imageError && isIntersecting ? (
            item.mediaType === 'video' ? (
              <>
                <video
                  ref={videoRef}
                  className={styles.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster=""
                  onError={(e) => {
                    console.log('Video load error:', item.imageUrl, e)
                    setImageError(true)
                  }}
                  onLoadedData={() => {
                    console.log('Video loaded successfully:', item.title)
                    handleVideoLoad()
                  }}
                  onCanPlay={() => {
                    console.log('Video can play:', item.title)
                  }}
                >
                  <source src={item.imageUrl} />
                  브라우저가 비디오를 지원하지 않습니다.
                </video>
                <div className={styles.playIcon}>▶</div>
              </>
            ) : (
              <Image
                src={item.imageUrl}
                alt={item.title || ''}
                layout="fill"
                objectFit="contain"
                className={styles.image}
                sizes="(max-width: 768px) 25vw, 10vw"
                priority={false}
                loading="lazy"
                onLoad={handleImageLoad}
                onError={() => {
                  console.log('Image load error:', item.imageUrl)
                  setImageError(true)
                }}
              />
            )
          ) : (
            <div className={styles.placeholder}>
              <span>{item.title?.charAt(0) || '?'}</span>
            </div>
          )}
        </div>
      <div 
        className={styles.caption}
        style={{ 
          width: actualWidth ? `${actualWidth}px` : '100%',
          maxWidth: '100%'
        }}
      >
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.date}>{item.formattedDate}</p>
        {item.description && (
          <p className={styles.description}>{item.description}</p>
        )}
      </div>
    </Link>
  )
}

export function NotionApiGallery({ databaseId, categoryFilter }: NotionApiGalleryProps) {
  const [items, setItems] = useState<NotionGalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true)
        // URL 구성
        const params = new URLSearchParams()
        
        if (databaseId) {
          params.append('databaseId', databaseId.replace(/-/g, ''))
        }
        
        if (categoryFilter) {
          params.append('category', categoryFilter)
        }
        
        const url = `/api/notion-gallery${params.toString() ? '?' + params.toString() : ''}`
        
        const response = await fetch(url)
        const data = await response.json() as any

        if (data.success) {
          setItems(data.items)
        } else {
          setError(data.message || 'Failed to load gallery')
        }
      } catch (err) {
        console.error('Failed to fetch gallery:', err)
        setError('Failed to load gallery')
      } finally {
        setLoading(false)
      }
    }

    fetchGalleryData()
  }, [databaseId, categoryFilter])

  if (loading) {
    return (
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className={styles.skeletonItem}>
            <div className={styles.skeletonImage}></div>
            <div className={`${styles.skeletonText} ${styles.skeletonTitle}`}></div>
            <div className={`${styles.skeletonText} ${styles.skeletonDate}`}></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.galleryGrid}>
        <div className={styles.errorState}>
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={styles.galleryGrid}>
        <div className={styles.emptyState}>
          <p>No gallery items found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.galleryGrid}>
      {items.map((item) => (
        <GalleryItem key={item.id} item={item} />
      ))}
    </div>
  )
}