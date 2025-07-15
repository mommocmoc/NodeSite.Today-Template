import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development or with admin parameter
  const isDev = process.env.NODE_ENV === 'development'
  const isAdmin = req.query.admin === 'true'

  if (!isDev && !isAdmin) {
    return res.status(404).json({ message: 'Not found' })
  }

  const debugInfo = {
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    environmentVariables: {
      NOTION_API_KEY: process.env.NOTION_API_KEY ? 'Set' : 'Not set',
      NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID ? 'Set' : 'Not set',
      NOTION_NAVIGATION_DB_ID: process.env.NOTION_NAVIGATION_DB_ID
        ? 'Set'
        : 'Not set',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'Not set',
      NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN || 'Not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'Not set',
      VERCEL_URL: process.env.VERCEL_URL || 'Not set'
    },
    headers: {
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-vercel-ip-country': req.headers['x-vercel-ip-country']
    }
  }

  res.status(200).json(debugInfo)
}
