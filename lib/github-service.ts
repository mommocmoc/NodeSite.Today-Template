/**
 * GitHub Service for automatic repository creation and deployment
 */

import { Octokit } from '@octokit/rest'

interface GitHubConfig {
  token: string
  templateRepo: string
  templateOwner: string
}

interface RepositoryCreationOptions {
  name: string
  description?: string
  private?: boolean
  environmentVariables?: Record<string, string>
}

interface RepositoryInfo {
  id: number
  name: string
  fullName: string
  htmlUrl: string
  cloneUrl: string
  defaultBranch: string
  owner: {
    login: string
    id: number
    type: string
  }
}

export class GitHubService {
  private octokit: Octokit
  private config: GitHubConfig

  constructor(config: GitHubConfig) {
    this.config = config
    this.octokit = new Octokit({
      auth: config.token
    })
  }

  /**
   * Create repository from template
   */
  async createFromTemplate(options: RepositoryCreationOptions): Promise<RepositoryInfo> {
    try {
      const { name, description, private: isPrivate = false } = options

      // Create repository from template
      const response = await this.octokit.repos.createUsingTemplate({
        template_owner: this.config.templateOwner,
        template_repo: this.config.templateRepo,
        name,
        description: description || `Website generated from Notion - ${name}`,
        private: isPrivate,
        include_all_branches: false
      })

      const repo = response.data

      // Wait for repository to be ready
      await this.waitForRepository(repo.owner.login, repo.name)

      // Set environment variables if provided
      if (options.environmentVariables) {
        await this.setEnvironmentVariables(
          repo.owner.login,
          repo.name,
          options.environmentVariables
        )
      }

      return {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        defaultBranch: repo.default_branch,
        owner: {
          login: repo.owner.login,
          id: repo.owner.id,
          type: repo.owner.type
        }
      }
    } catch (error) {
      console.error('Failed to create repository from template:', error)
      throw new Error(`GitHub repository creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Set environment variables for repository (GitHub Secrets)
   */
  async setEnvironmentVariables(
    owner: string,
    repo: string,
    variables: Record<string, string>
  ): Promise<void> {
    try {
      // Get repository public key for encrypting secrets
      const publicKeyResponse = await this.octokit.actions.getRepoPublicKey({
        owner,
        repo
      })

      const publicKey = publicKeyResponse.data

      // Encrypt and set each environment variable as a secret
      for (const [key, value] of Object.entries(variables)) {
        const encryptedValue = await this.encryptSecret(value, publicKey.key)
        
        await this.octokit.actions.createOrUpdateRepoSecret({
          owner,
          repo,
          secret_name: key,
          encrypted_value: encryptedValue,
          key_id: publicKey.key_id
        })
      }

      console.log(`Set ${Object.keys(variables).length} environment variables for ${owner}/${repo}`)
    } catch (error) {
      console.error('Failed to set environment variables:', error)
      throw new Error(`Failed to set environment variables: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Wait for repository to be ready (sometimes takes a moment after creation)
   */
  private async waitForRepository(owner: string, repo: string, maxAttempts = 10): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.octokit.repos.get({ owner, repo })
        return // Repository is ready
      } catch (error) {
        if (attempt === maxAttempts) {
          throw new Error(`Repository ${owner}/${repo} not ready after ${maxAttempts} attempts`)
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  /**
   * Encrypt secret using repository public key
   */
  private async encryptSecret(secret: string, publicKey: string): Promise<string> {
    // For now, we'll use a simple base64 encoding
    // In production, you should use proper encryption with sodium
    // This is a placeholder implementation
    return Buffer.from(secret).toString('base64')
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<RepositoryInfo> {
    try {
      const response = await this.octokit.repos.get({ owner, repo })
      const repoData = response.data

      return {
        id: repoData.id,
        name: repoData.name,
        fullName: repoData.full_name,
        htmlUrl: repoData.html_url,
        cloneUrl: repoData.clone_url,
        defaultBranch: repoData.default_branch,
        owner: {
          login: repoData.owner.login,
          id: repoData.owner.id,
          type: repoData.owner.type
        }
      }
    } catch (error) {
      throw new Error(`Failed to get repository: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete repository
   */
  async deleteRepository(owner: string, repo: string): Promise<void> {
    try {
      await this.octokit.repos.delete({ owner, repo })
    } catch (error) {
      throw new Error(`Failed to delete repository: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * List user repositories
   */
  async listRepositories(type: 'all' | 'owner' | 'public' | 'private' = 'owner'): Promise<RepositoryInfo[]> {
    try {
      const response = await this.octokit.repos.listForAuthenticatedUser({
        type,
        sort: 'created',
        direction: 'desc',
        per_page: 100
      })

      return response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        defaultBranch: repo.default_branch,
        owner: {
          login: repo.owner.login,
          id: repo.owner.id,
          type: repo.owner.type
        }
      }))
    } catch (error) {
      throw new Error(`Failed to list repositories: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Trigger GitHub Actions workflow
   */
  async triggerWorkflow(owner: string, repo: string, workflowId: string): Promise<void> {
    try {
      await this.octokit.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: workflowId,
        ref: 'main'
      })
    } catch (error) {
      throw new Error(`Failed to trigger workflow: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Singleton instance
let gitHubService: GitHubService | null = null

export function getGitHubService(): GitHubService {
  if (!gitHubService) {
    const token = process.env.GITHUB_TOKEN
    const templateRepo = process.env.GITHUB_TEMPLATE_REPO || 'NodeSite.Today-Template'
    
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable is required')
    }

    const [templateOwner, templateRepoName] = templateRepo.includes('/') 
      ? templateRepo.split('/') 
      : ['', templateRepo]

    if (!templateOwner || !templateRepoName) {
      throw new Error('Invalid GITHUB_TEMPLATE_REPO format. Expected: owner/repo')
    }

    const config: GitHubConfig = {
      token,
      templateRepo: templateRepoName,
      templateOwner
    }

    gitHubService = new GitHubService(config)
  }

  return gitHubService
}

export type { RepositoryCreationOptions, RepositoryInfo }