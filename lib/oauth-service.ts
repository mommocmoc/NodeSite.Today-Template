/**
 * OAuth Service for Notion Public Integration
 * Handles template duplication and user authentication
 */

import { Client } from '@notionhq/client'

interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  templateUrl?: string
}

interface OAuthTokenResponse {
  access_token: string
  token_type: string
  bot_id: string
  workspace_id: string
  workspace_name: string
  workspace_icon: string
  duplicated_template_id?: string | null
  owner: {
    type: string
    user?: {
      id: string
      name: string
      avatar_url: string
      type: string
      person: {
        email: string
      }
    }
  }
}

interface UserProject {
  id: string
  userId: string
  accessToken: string
  templateId: string | null
  workspaceId: string
  workspaceName: string
  categoryDbId?: string
  contentDbId?: string
  status: 'template_copied' | 'databases_extracted' | 'website_building' | 'deployed' | 'error'
  createdAt: Date
  updatedAt: Date
  siteUrl?: string
  repoUrl?: string
  error?: string
}

interface DatabaseInfo {
  id: string
  title: string
  type: 'category' | 'content'
}

export class OAuthService {
  private config: OAuthConfig
  private userProjects: Map<string, UserProject> = new Map()

  constructor(config: OAuthConfig) {
    this.config = config
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      owner: 'user'
    })

    if (state) {
      params.append('state', state)
    }

    return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString('base64')

    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.config.redirectUri
      })
    })

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Create user project from OAuth response
   */
  async createUserProject(tokenResponse: OAuthTokenResponse): Promise<UserProject> {
    const projectId = this.generateProjectId()
    const userId = tokenResponse.owner.user?.id || 'anonymous'

    const project: UserProject = {
      id: projectId,
      userId,
      accessToken: tokenResponse.access_token,
      templateId: tokenResponse.duplicated_template_id || null,
      workspaceId: tokenResponse.workspace_id,
      workspaceName: tokenResponse.workspace_name,
      status: 'template_copied',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.userProjects.set(projectId, project)

    // If template was duplicated, extract databases
    if (project.templateId) {
      await this.extractDatabasesFromTemplate(project)
    }

    return project
  }

  /**
   * Extract databases from duplicated template
   */
  async extractDatabasesFromTemplate(project: UserProject): Promise<void> {
    if (!project.templateId) {
      throw new Error('No template ID found')
    }

    try {
      project.status = 'databases_extracted'
      project.updatedAt = new Date()

      const notion = new Client({ auth: project.accessToken })
      
      // Get child blocks from the template page
      const childBlocks = await notion.blocks.children.list({
        block_id: project.templateId
      })

      const databases = childBlocks.results.filter(
        (block: any) => block.type === 'child_database'
      )

      console.log('Found databases:', databases.length)

      // Find category and content databases
      const categoryDb = databases.find((db: any) => 
        db.child_database?.title?.toLowerCase().includes('category') ||
        db.child_database?.title?.toLowerCase().includes('navigation')
      )

      const contentDb = databases.find((db: any) => 
        db.child_database?.title?.toLowerCase().includes('content') ||
        db.child_database?.title?.toLowerCase().includes('post')
      )

      if (!categoryDb || !contentDb) {
        // Try to get databases by querying the template page
        const templatePage = await notion.pages.retrieve({
          page_id: project.templateId
        })

        // Search for databases in the workspace
        const searchResults = await notion.search({
          filter: {
            property: 'object',
            value: 'database'
          },
          page_size: 100
        })

        const workspaceDatabases = searchResults.results.filter((result: any) => 
          result.object === 'database'
        )

        console.log('Workspace databases:', workspaceDatabases.length)

        // Match databases by title patterns
        const categoryDatabase = workspaceDatabases.find((db: any) => 
          db.title?.[0]?.plain_text?.toLowerCase().includes('category') ||
          db.title?.[0]?.plain_text?.toLowerCase().includes('navigation')
        )

        const contentDatabase = workspaceDatabases.find((db: any) => 
          db.title?.[0]?.plain_text?.toLowerCase().includes('content') ||
          db.title?.[0]?.plain_text?.toLowerCase().includes('post')
        )

        project.categoryDbId = categoryDatabase?.id
        project.contentDbId = contentDatabase?.id
      } else {
        project.categoryDbId = categoryDb.id
        project.contentDbId = contentDb.id
      }

      this.userProjects.set(project.id, project)

      console.log('Database extraction completed:', {
        categoryDbId: project.categoryDbId,
        contentDbId: project.contentDbId
      })

    } catch (error) {
      project.status = 'error'
      project.error = error instanceof Error ? error.message : 'Unknown error'
      project.updatedAt = new Date()
      this.userProjects.set(project.id, project)
      throw error
    }
  }

  /**
   * Get user project by ID
   */
  getUserProject(projectId: string): UserProject | null {
    return this.userProjects.get(projectId) || null
  }

  /**
   * Update user project status
   */
  updateProjectStatus(projectId: string, status: UserProject['status'], data?: Partial<UserProject>): void {
    const project = this.userProjects.get(projectId)
    if (project) {
      project.status = status
      project.updatedAt = new Date()
      if (data) {
        Object.assign(project, data)
      }
      this.userProjects.set(projectId, project)
    }
  }

  /**
   * Generate unique project ID
   */
  private generateProjectId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get all user projects (for admin/debugging)
   */
  getAllProjects(): UserProject[] {
    return Array.from(this.userProjects.values())
  }

  /**
   * Test database access
   */
  async testDatabaseAccess(project: UserProject): Promise<boolean> {
    try {
      const notion = new Client({ auth: project.accessToken })
      
      if (project.categoryDbId) {
        await notion.databases.retrieve({
          database_id: project.categoryDbId
        })
      }

      if (project.contentDbId) {
        await notion.databases.retrieve({
          database_id: project.contentDbId
        })
      }

      return true
    } catch (error) {
      console.error('Database access test failed:', error)
      return false
    }
  }
}

// Singleton instance
let oauthService: OAuthService | null = null

export function getOAuthService(): OAuthService {
  if (!oauthService) {
    const config: OAuthConfig = {
      clientId: process.env.NOTION_CLIENT_ID || '',
      clientSecret: process.env.NOTION_CLIENT_SECRET || '',
      redirectUri: process.env.NOTION_REDIRECT_URI || '',
      templateUrl: process.env.NOTION_TEMPLATE_URL
    }

    if (!config.clientId || !config.clientSecret || !config.redirectUri) {
      throw new Error('Missing required OAuth configuration')
    }

    oauthService = new OAuthService(config)
  }

  return oauthService
}

export type { OAuthTokenResponse, UserProject, DatabaseInfo }