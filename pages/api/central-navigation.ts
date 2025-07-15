import type { NextApiRequest, NextApiResponse } from 'next'
import { getCentralIntegrationService } from '@/lib/central-integration'

export interface NavigationItem {
  id: string
  categoryName: string
  displayName: string
  navigationOrder: number
  displayType: 'Single Page' | 'Gallery'
  isActive: boolean
  urlPath: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get user ID from request (could be from session, header, or query param)
    const userId = req.query.userId as string || req.headers['x-user-id'] as string
    
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
        message: 'Database IDs are required. Set NOTION_CATEGORY_DB_ID and NOTION_CONTENT_DB_ID environment variables.',
        error: 'MISSING_DB_IDS'
      })
    }

    await centralService.registerUser({
      userId,
      categoryDbId,
      contentDbId,
      allowedOperations: ['read']
    })

    // Get navigation data through central service
    const response = await centralService.getNavigationData(userId)

    // Transform the data (same logic as before)
    const navigationItems: NavigationItem[] = response.results.map(
      (page: any, index: number) => {
        const properties = page.properties

        const categoryRelation =
          properties['Studio Cowcowwow 블로그']?.relation?.[0]?.id || ''
        const displayName = properties['표시명']?.title?.[0]?.plain_text || ''
        const categoryName = displayName
        const navigationOrder = properties['네비게이션 순서']?.number || 999
        const displayType = properties['표시 방식']?.select?.name || 'Gallery'
        const isActive = properties['활성화']?.checkbox || false
        const urlPath =
          properties['URL 경로']?.rich_text?.[0]?.plain_text ||
          `/${categoryName.toLowerCase()}`

        return {
          id: page.id,
          categoryName,
          displayName,
          navigationOrder,
          displayType: displayType as 'Single Page' | 'Gallery',
          isActive,
          urlPath
        }
      }
    )

    const sortedItems = navigationItems.sort(
      (a, b) => a.navigationOrder - b.navigationOrder
    )

    res.status(200).json({
      success: true,
      items: sortedItems,
      total: sortedItems.length
    })
  } catch (error) {
    console.error('Central Navigation API Error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch navigation data',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}