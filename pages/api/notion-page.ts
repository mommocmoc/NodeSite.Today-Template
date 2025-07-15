import type { NextApiRequest, NextApiResponse } from 'next'

import { getPage } from '@/lib/notion'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // API 응답 캐싱 설정 (개발 시에는 캐싱 비활성화, 프로덕션에서는 5분)
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  } else {
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    )
  }

  try {
    const { pageId } = req.query

    if (!pageId) {
      return res.status(400).json({ message: 'Page ID is required' })
    }

    // 노션 페이지 recordMap 가져오기 (완전한 데이터 포함)
    const recordMap = await getPage(pageId as string)

    res.status(200).json({
      success: true,
      recordMap
    })
  } catch (err) {
    console.error('Notion Page API Error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notion page',
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }
}
