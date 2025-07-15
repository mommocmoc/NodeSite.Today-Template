/**
 * Central Integration Service
 * 
 * This service allows users to use a shared Notion Integration
 * instead of creating their own. The template provider manages
 * one integration that users can leverage.
 */

import { Client } from '@notionhq/client'
import { getUserManager } from './user-management'

interface CentralIntegrationConfig {
  // Central integration token managed by template provider
  centralToken: string
  // Service identifier for tracking usage
  serviceId: string
  // Rate limiting and usage tracking
  maxRequestsPerUser?: number
  maxRequestsPerHour?: number
}

interface UserDatabaseConfig {
  userId: string
  categoryDbId: string
  contentDbId: string
  // Optional: user-specific settings
  allowedOperations?: ('read' | 'write')[]
}

export class CentralIntegrationService {
  private notion: Client
  private config: CentralIntegrationConfig
  private userManager = getUserManager()

  constructor(config: CentralIntegrationConfig) {
    this.config = config
    this.notion = new Client({
      auth: config.centralToken
    })
  }

  /**
   * Register a user's database configuration
   */
  async registerUser(userConfig: UserDatabaseConfig): Promise<{ success: boolean; message: string }> {
    try {
      // Validate that the databases exist and are accessible
      await this.validateDatabaseAccess(userConfig.categoryDbId)
      await this.validateDatabaseAccess(userConfig.contentDbId)
      
      // Register user with user manager
      const result = await this.userManager.registerUser({
        userId: userConfig.userId,
        categoryDbId: userConfig.categoryDbId,
        contentDbId: userConfig.contentDbId,
        tier: 'free' // Default tier
      })
      
      return result
    } catch (error) {
      console.error('Failed to register user:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Query navigation data for a specific user
   */
  async getNavigationData(userId: string) {
    // Check rate limiting
    const rateLimitCheck = this.userManager.canMakeRequest(userId)
    if (!rateLimitCheck.allowed) {
      throw new Error(`Rate limit exceeded. Try again after ${rateLimitCheck.resetTime.toISOString()}`)
    }

    const user = this.userManager.getUser(userId)
    if (!user) {
      throw new Error('User not registered')
    }

    // Record the request
    this.userManager.recordRequest(userId)

    return await this.notion.databases.query({
      database_id: user.categoryDbId,
      filter: {
        property: '활성화',
        checkbox: {
          equals: true
        }
      },
      sorts: [
        {
          property: '네비게이션 순서',
          direction: 'ascending'
        }
      ]
    })
  }

  /**
   * Query content data for a specific user
   */
  async getContentData(userId: string, categoryFilter?: string) {
    // Check rate limiting
    const rateLimitCheck = this.userManager.canMakeRequest(userId)
    if (!rateLimitCheck.allowed) {
      throw new Error(`Rate limit exceeded. Try again after ${rateLimitCheck.resetTime.toISOString()}`)
    }

    const user = this.userManager.getUser(userId)
    if (!user) {
      throw new Error('User not registered')
    }

    // Record the request
    this.userManager.recordRequest(userId)

    const queryOptions: any = {
      database_id: user.contentDbId,
      page_size: 50,
      sorts: [
        {
          property: '노출 순서',
          direction: 'ascending'
        }
      ]
    }

    if (categoryFilter) {
      queryOptions.filter = {
        property: '페이지 카테고리',
        relation: {
          contains: categoryFilter
        }
      }
    }

    return await this.notion.databases.query(queryOptions)
  }

  /**
   * Validate that the integration has access to a database
   */
  private async validateDatabaseAccess(databaseId: string): Promise<boolean> {
    try {
      await this.notion.databases.retrieve({
        database_id: databaseId
      })
      return true
    } catch (error) {
      throw new Error(`Database ${databaseId} is not accessible. Please share it with the integration.`)
    }
  }
}

// Singleton instance for the central service
let centralService: CentralIntegrationService | null = null

export function getCentralIntegrationService(): CentralIntegrationService {
  if (!centralService) {
    const centralToken = process.env.CENTRAL_NOTION_TOKEN
    if (!centralToken) {
      throw new Error('CENTRAL_NOTION_TOKEN environment variable is required')
    }

    centralService = new CentralIntegrationService({
      centralToken,
      serviceId: process.env.SERVICE_ID || 'notion-template-service',
      maxRequestsPerUser: 1000,
      maxRequestsPerHour: 10000
    })
  }

  return centralService
}