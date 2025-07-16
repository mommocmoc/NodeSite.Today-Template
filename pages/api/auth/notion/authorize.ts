import type { NextApiRequest, NextApiResponse } from 'next'
import { getOAuthService } from '@/lib/oauth-service'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const oauthService = getOAuthService()
    
    // Generate state for security (optional)
    const state = Math.random().toString(36).substr(2, 9)
    
    // Store state in session or database for verification
    // For simplicity, we'll skip state verification in this example
    
    const authUrl = oauthService.getAuthorizationUrl(state)
    
    // Redirect user to Notion OAuth authorization
    res.redirect(authUrl)
    
  } catch (error) {
    console.error('OAuth authorization error:', error)
    res.status(500).json({
      error: 'Failed to initiate OAuth authorization',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}