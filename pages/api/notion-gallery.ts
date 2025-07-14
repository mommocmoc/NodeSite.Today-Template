import type { NextApiRequest, NextApiResponse } from 'next'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_TOKEN || process.env.NOTION_API_KEY,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // API 응답 캐싱 설정 (1분으로 단축, 개발 시에는 캐싱 비활성화)
  const isDev = process.env.NODE_ENV === 'development'
  const forceRefresh = req.query.force === 'true'
  
  if (isDev || forceRefresh) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  } else {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
  }

  try {
    // 환경변수를 우선으로 사용, 없으면 쿼리 파라미터 사용
    const databaseId = process.env.NOTION_DATABASE_ID || req.query.databaseId
    const category = req.query.category as string

    console.log('=== Notion Gallery API Debug ===')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('NOTION_DATABASE_ID:', databaseId ? 'Set' : 'Not set')
    console.log('Category filter:', category)

    if (!databaseId) {
      return res.status(400).json({ message: 'Database ID is required. Set NOTION_DATABASE_ID environment variable or provide databaseId query parameter.' })
    }

    // 카테고리 필터링 조건 구성
    const filterConditions: any = []
    
    if (category) {
      // 카테고리가 UUID 형태인지 확인 (navigation API에서 넘어온 ID)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category)
      
      if (isUUID) {
        // UUID인 경우 직접 사용
        filterConditions.push({
          property: '페이지 카테고리',
          relation: {
            contains: category
          }
        })
      } else {
        // 문자열인 경우, 먼저 네비게이션 DB에서 해당 카테고리의 ID를 찾아야 함
        // 임시로 필터링 건너뛰기 (모든 데이터 반환)
        console.log('Category is not UUID, skipping filter:', category)
      }
    }

    // Notion API를 사용해서 데이터베이스 쿼리 (페이지 크기 제한으로 성능 향상)
    const queryOptions: any = {
      database_id: databaseId as string,
      page_size: 50, // 한 번에 최대 50개만 로드
      sorts: [
        {
          property: '노출 순서',
          direction: 'ascending'
        },
        {
          timestamp: 'created_time',
          direction: 'descending'
        }
      ]
    }

    // 필터 조건이 있으면 추가
    if (filterConditions.length > 0) {
      queryOptions.filter = filterConditions.length === 1 
        ? filterConditions[0] 
        : { and: filterConditions }
    }

    const response = await notion.databases.query(queryOptions)

    // 갤러리 아이템 데이터 변환
    const galleryItems = response.results.map((page: any) => {
      const properties = page.properties
      
      // 타이틀 추출 (한국어/영어 속성명 모두 지원)
      let title = ''
      const titlePropertyNames = ['제목', 'Name', 'Title', '이름', 'name', 'title']
      
      for (const propName of titlePropertyNames) {
        const prop = properties[propName]
        if (prop?.title && prop.title.length > 0) {
          title = prop.title.map((t: any) => t.plain_text).join('')
          break
        }
      }

      // 이미지/영상 URL 추출 (여러 속성명 시도)
      let imageUrl = null
      let mediaType = 'image' // 'image' or 'video'
      const imagePropertyNames = ['썸네일', 'Cover', 'Image', 'Thumbnail', 'Photo', '이미지', '커버', 'Media', '미디어']
      
      for (const propName of imagePropertyNames) {
        const prop = properties[propName]
        if (prop?.files && prop.files.length > 0) {
          const file = prop.files[0]
          const url = file.file?.url || file.external?.url
          
          if (url) {
            imageUrl = url
            
            // 파일 확장자나 URL 패턴으로 미디어 타입 판단
            const urlWithoutQuery = url.split('?')[0] // 쿼리 파라미터 제거
            const urlParts = urlWithoutQuery.split('/')
            const fileName = urlParts[urlParts.length - 1] // 파일명만 추출
            const fileExtension = fileName.split('.').pop()?.toLowerCase()
            
            // 비디오 확장자 체크
            const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'ogg', 'ogv', '3gp', 'flv', 'wmv']
            const isVideoFile = videoExtensions.includes(fileExtension || '')
            
            // URL 패턴으로 비디오 감지 (더 정확한 패턴)
            const isVideoByPattern = /\.(mp4|webm|mov|avi|mkv|m4v|ogg|ogv|3gp|flv|wmv)(\?|$)/i.test(url) ||
                                   url.toLowerCase().includes('/video/') ||
                                   url.toLowerCase().includes('video') && fileName.includes('.')
            
            if (isVideoFile || isVideoByPattern) {
              mediaType = 'video'
            } else {
              mediaType = 'image'
            }
            
            break
          }
        }
      }

      // 설명 추출
      let description = ''
      if (properties.Description?.rich_text) {
        description = properties.Description.rich_text.map((t: any) => t.plain_text).join('')
      }

      // 노출 순서 추출
      let displayOrder = null
      if (properties['노출 순서']?.number !== undefined) {
        displayOrder = properties['노출 순서'].number
      }

      return {
        id: page.id,
        title,
        imageUrl,
        mediaType,
        description,
        url: `/${page.id.replace(/-/g, '')}`, // Notion 페이지 URL 형식
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
        displayOrder, // 노출 순서 추가
        // 수정일을 읽기 쉬운 형태로 포맷팅
        formattedDate: new Date(page.last_edited_time).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    })

    res.status(200).json({
      success: true,
      items: galleryItems,
      total: response.results.length
    })

  } catch (error) {
    console.error('Notion API Error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch gallery data',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}