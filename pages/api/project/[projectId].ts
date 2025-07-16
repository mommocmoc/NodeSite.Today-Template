import type { NextApiRequest, NextApiResponse } from 'next'
import { getOAuthService } from '@/lib/oauth-service'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId } = req.query

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Project ID is required' })
  }

  const oauthService = getOAuthService()

  if (req.method === 'GET') {
    try {
      const project = oauthService.getUserProject(projectId)
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' })
      }

      // Don't expose sensitive data
      const safeProject = {
        id: project.id,
        userId: project.userId,
        templateId: project.templateId,
        workspaceId: project.workspaceId,
        workspaceName: project.workspaceName,
        categoryDbId: project.categoryDbId,
        contentDbId: project.contentDbId,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        siteUrl: project.siteUrl,
        repoUrl: project.repoUrl,
        error: project.error
      }

      res.status(200).json(safeProject)
    } catch (error) {
      console.error('Error fetching project:', error)
      res.status(500).json({ 
        error: 'Failed to fetch project',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else if (req.method === 'PUT') {
    try {
      const { status, siteUrl, repoUrl, error } = req.body

      oauthService.updateProjectStatus(projectId, status, {
        siteUrl,
        repoUrl,
        error
      })

      const updatedProject = oauthService.getUserProject(projectId)
      
      if (!updatedProject) {
        return res.status(404).json({ error: 'Project not found' })
      }

      res.status(200).json({
        id: updatedProject.id,
        status: updatedProject.status,
        updatedAt: updatedProject.updatedAt,
        siteUrl: updatedProject.siteUrl,
        repoUrl: updatedProject.repoUrl,
        error: updatedProject.error
      })
    } catch (error) {
      console.error('Error updating project:', error)
      res.status(500).json({ 
        error: 'Failed to update project',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}