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
    const { code, state, error } = req.query

    // Handle OAuth error
    if (error) {
      console.error('OAuth error:', error)
      return res.redirect(`/auth/error?error=${encodeURIComponent(error as string)}`)
    }

    // Validate authorization code
    if (!code || typeof code !== 'string') {
      return res.redirect('/auth/error?error=missing_code')
    }

    const oauthService = getOAuthService()

    // Exchange code for access token
    console.log('Exchanging code for token...')
    const tokenResponse = await oauthService.exchangeCodeForToken(code)

    // Create user project
    console.log('Creating user project...')
    const project = await oauthService.createUserProject(tokenResponse)

    console.log('Project created:', {
      id: project.id,
      templateId: project.templateId,
      status: project.status,
      categoryDbId: project.categoryDbId,
      contentDbId: project.contentDbId
    })

    // Redirect to dashboard with project ID
    res.redirect(`/dashboard/${project.id}`)

  } catch (error) {
    console.error('OAuth callback error:', error)
    res.redirect(`/auth/error?error=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`)
  }
}