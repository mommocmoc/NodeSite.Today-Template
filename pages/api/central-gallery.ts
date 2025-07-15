import type { NextApiRequest, NextApiResponse } from 'next'
import { getCentralIntegrationService } from '@/lib/central-integration'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get user ID from request
    const userId = req.query.userId as string || req.headers['x-user-id'] as string
    const category = req.query.category as string

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required',
        error: 'MISSING_USER_ID'
      })
    }

    // Use central integration service
    const centralService = getCentralIntegrationService()
    
    // Register user if not already registered
    const categoryDbId = process.env.NOTION_CATEGORY_DB_ID
    const contentDbId = process.env.NOTION_CONTENT_DB_ID
    
    if (!categoryDbId || !contentDbId) {
      return res.status(400).json({
        message: 'Database IDs are required',
        error: 'MISSING_DB_IDS'
      })
    }

    await centralService.registerUser({
      userId,
      categoryDbId,
      contentDbId,
      allowedOperations: ['read']
    })

    // Get content data through central service
    const response = await centralService.getContentData(userId, category)

    // Transform gallery data (same logic as before)
    const galleryItems = response.results.map((page: any) => {
      const properties = page.properties

      // Title extraction
      let title = ''
      const titlePropertyNames = [
        '제목', 'Name', 'Title', '이름', 'name', 'title'
      ]

      for (const propName of titlePropertyNames) {
        const prop = properties[propName]
        if (prop?.title && prop.title.length > 0) {
          title = prop.title.map((t: any) => t.plain_text).join('')
          break
        }
      }

      // Image/media URL extraction
      let imageUrl = null
      let mediaType = 'image'
      const imagePropertyNames = [
        '썸네일', 'Cover', 'Image', 'Thumbnail', 'Photo', 
        '이미지', '커버', 'Media', '미디어'
      ]

      for (const propName of imagePropertyNames) {
        const prop = properties[propName]
        if (prop?.files && prop.files.length > 0) {
          const file = prop.files[0]
          const url = file.file?.url || file.external?.url

          if (url) {
            imageUrl = url
            const fileExtension = url.split('.').pop()?.toLowerCase()
            const videoExtensions = [
              'mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 
              'ogg', 'ogv', '3gp', 'flv', 'wmv'
            ]
            
            if (videoExtensions.includes(fileExtension || '')) {
              mediaType = 'video'
            }
            break
          }
        }
      }

      // Description extraction
      let description = ''
      if (properties.Description?.rich_text) {
        description = properties.Description.rich_text
          .map((t: any) => t.plain_text)
          .join('')
      }

      // Display order
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
        url: `/${page.id.replace(/-/g, '')}`,
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
        displayOrder,
        formattedDate: new Date(page.last_edited_time).toLocaleDateString(
          'ko-KR',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }
        )
      }
    })

    res.status(200).json({
      success: true,
      items: galleryItems,
      total: response.results.length
    })
  } catch (error) {
    console.error('Central Gallery API Error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery data',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}