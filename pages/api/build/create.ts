import type { NextApiRequest, NextApiResponse } from 'next'
import { getOAuthService } from '@/lib/oauth-service'
import { getGitHubService } from '@/lib/github-service'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { projectId } = req.body

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' })
    }

    const oauthService = getOAuthService()
    const gitHubService = getGitHubService()

    // Get project information
    const project = oauthService.getUserProject(projectId)
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Check if project is ready for website building
    if (project.status !== 'databases_extracted') {
      return res.status(400).json({ 
        error: 'Project not ready for website building',
        currentStatus: project.status 
      })
    }

    // Validate required database IDs
    if (!project.categoryDbId || !project.contentDbId) {
      return res.status(400).json({ 
        error: 'Missing required database IDs',
        categoryDbId: project.categoryDbId,
        contentDbId: project.contentDbId
      })
    }

    // Update project status to building
    oauthService.updateProjectStatus(projectId, 'website_building')

    // Generate repository name
    const repoName = `nodesite-${project.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`

    // Create repository from template
    console.log('Creating GitHub repository...')
    const repository = await gitHubService.createFromTemplate({
      name: repoName,
      description: `Website generated from Notion workspace: ${project.workspaceName}`,
      private: false,
      environmentVariables: {
        NOTION_API_KEY: project.accessToken,
        NOTION_CATEGORY_DB_ID: project.categoryDbId,
        NOTION_CONTENT_DB_ID: project.contentDbId,
        USER_ID: project.userId
      }
    })

    console.log('Repository created:', repository.htmlUrl)

    // Update project with repository information
    oauthService.updateProjectStatus(projectId, 'website_building', {
      repoUrl: repository.htmlUrl
    })

    // TODO: Trigger Vercel deployment
    // For now, we'll simulate deployment completion
    setTimeout(async () => {
      try {
        // Simulate deployment process
        const siteUrl = `https://${repository.name}.vercel.app`
        
        oauthService.updateProjectStatus(projectId, 'deployed', {
          siteUrl
        })
        
        console.log('Website deployed:', siteUrl)
      } catch (error) {
        console.error('Deployment failed:', error)
        oauthService.updateProjectStatus(projectId, 'error', {
          error: 'Deployment failed'
        })
      }
    }, 5000) // Simulate 5 second deployment

    res.status(200).json({
      success: true,
      projectId,
      repository: {
        name: repository.name,
        url: repository.htmlUrl,
        cloneUrl: repository.cloneUrl
      },
      status: 'website_building',
      message: 'Website build started successfully'
    })

  } catch (error) {
    console.error('Build creation error:', error)
    
    // Update project status to error if we have projectId
    const { projectId } = req.body
    if (projectId) {
      const oauthService = getOAuthService()
      oauthService.updateProjectStatus(projectId, 'error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create website build',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}