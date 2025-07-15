import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  try {
    // Revalidate the index page and any dynamic pages
    await res.revalidate('/')

    // Get page paths to revalidate from query parameter
    const paths = req.query.paths as string
    if (paths) {
      const pathArray = paths.split(',')
      for (const path of pathArray) {
        await res.revalidate(path.trim())
      }
    }

    return res.json({ revalidated: true })
  } catch (err) {
    return res.status(500).send('Error revalidating')
  }
}
