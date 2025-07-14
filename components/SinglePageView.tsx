import React, { useState, useEffect } from 'react'
import { NotionRenderer } from 'react-notion-x'
import type { ExtendedRecordMap } from 'notion-types'
import styles from './SinglePageView.module.css'

// Empty components to avoid react-notion-x warnings
const EmptyComponent = () => null

interface SinglePageViewProps {
  pageId: string
  title: string
}

export function SinglePageView({ pageId, title }: SinglePageViewProps) {
  const [recordMap, setRecordMap] = useState<ExtendedRecordMap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true)
        
        if (!pageId) {
          setError('표시할 페이지가 없습니다.')
          return
        }

        const response = await fetch(`/api/notion-page?pageId=${pageId}`)
        const data = await response.json() as {
          success: boolean
          recordMap?: ExtendedRecordMap
          message?: string
        }
        
        if (data.success && data.recordMap) {
          setRecordMap(data.recordMap)
        } else {
          console.error(`Failed to fetch page ${pageId}:`, data.message)
          setError('페이지 로딩에 실패했습니다.')
        }
      } catch (err) {
        console.error('Failed to fetch page data:', err)
        setError('페이지 로딩에 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchPageData()
  }, [pageId])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>페이지 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>오류 발생</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!recordMap) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>페이지를 찾을 수 없습니다</h1>
          <p>요청하신 페이지가 존재하지 않습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.notionWrapper}>
        <NotionRenderer 
          recordMap={recordMap}
          fullPage={false}
          darkMode={false}
          rootPageId={Object.keys(recordMap.block)[0]}
          previewImages={true}
          showCollectionViewDropdown={false}
          showTableOfContents={false}
          minTableOfContentsItems={99}
          defaultPageIcon={undefined}
          defaultPageCover={undefined}
          defaultPageCoverPosition={0.5}
          className={styles.notionRenderer}
          components={{
            Collection: EmptyComponent,
            Equation: EmptyComponent,
            Modal: EmptyComponent,
            Pdf: EmptyComponent,
            Tweet: EmptyComponent,
            Header: EmptyComponent
          }}
        />
      </div>
    </div>
  )
}