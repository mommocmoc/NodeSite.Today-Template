/**
 * User Management for Central Integration Service
 * 
 * Handles user registration, authentication, and rate limiting
 */

interface UserProfile {
  userId: string
  email?: string
  registeredAt: Date
  lastActive: Date
  requestCount: number
  categoryDbId: string
  contentDbId: string
  isActive: boolean
  tier: 'free' | 'premium' | 'enterprise'
}

interface RateLimitInfo {
  userId: string
  requestCount: number
  windowStart: Date
  isLimited: boolean
}

export class UserManager {
  private users: Map<string, UserProfile> = new Map()
  private rateLimits: Map<string, RateLimitInfo> = new Map()
  
  // Rate limiting configuration
  private readonly RATE_LIMITS = {
    free: { requestsPerHour: 100, requestsPerDay: 1000 },
    premium: { requestsPerHour: 500, requestsPerDay: 5000 },
    enterprise: { requestsPerHour: 2000, requestsPerDay: 20000 }
  }

  /**
   * Register a new user
   */
  async registerUser(params: {
    userId: string
    email?: string
    categoryDbId: string
    contentDbId: string
    tier?: 'free' | 'premium' | 'enterprise'
  }): Promise<{ success: boolean; message: string }> {
    const { userId, email, categoryDbId, contentDbId, tier = 'free' } = params

    // Validate database IDs format
    if (!this.isValidDatabaseId(categoryDbId) || !this.isValidDatabaseId(contentDbId)) {
      return {
        success: false,
        message: 'Invalid database ID format'
      }
    }

    // Check if user already exists
    if (this.users.has(userId)) {
      // Update existing user
      const existingUser = this.users.get(userId)!
      existingUser.categoryDbId = categoryDbId
      existingUser.contentDbId = contentDbId
      existingUser.lastActive = new Date()
      
      return {
        success: true,
        message: 'User updated successfully'
      }
    }

    // Create new user
    const newUser: UserProfile = {
      userId,
      email,
      registeredAt: new Date(),
      lastActive: new Date(),
      requestCount: 0,
      categoryDbId,
      contentDbId,
      isActive: true,
      tier
    }

    this.users.set(userId, newUser)
    
    return {
      success: true,
      message: 'User registered successfully'
    }
  }

  /**
   * Get user profile
   */
  getUser(userId: string): UserProfile | null {
    return this.users.get(userId) || null
  }

  /**
   * Check if user can make a request (rate limiting)
   */
  canMakeRequest(userId: string): { allowed: boolean; remainingRequests: number; resetTime: Date } {
    const user = this.users.get(userId)
    if (!user || !user.isActive) {
      return { allowed: false, remainingRequests: 0, resetTime: new Date() }
    }

    const now = new Date()
    const limits = this.RATE_LIMITS[user.tier]
    
    // Get or create rate limit info
    let rateLimitInfo = this.rateLimits.get(userId)
    if (!rateLimitInfo || now.getTime() - rateLimitInfo.windowStart.getTime() > 3600000) { // 1 hour window
      rateLimitInfo = {
        userId,
        requestCount: 0,
        windowStart: now,
        isLimited: false
      }
      this.rateLimits.set(userId, rateLimitInfo)
    }

    // Check if user is within limits
    if (rateLimitInfo.requestCount >= limits.requestsPerHour) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: new Date(rateLimitInfo.windowStart.getTime() + 3600000)
      }
    }

    return {
      allowed: true,
      remainingRequests: limits.requestsPerHour - rateLimitInfo.requestCount,
      resetTime: new Date(rateLimitInfo.windowStart.getTime() + 3600000)
    }
  }

  /**
   * Record a request made by user
   */
  recordRequest(userId: string): void {
    const user = this.users.get(userId)
    if (user) {
      user.requestCount++
      user.lastActive = new Date()
    }

    const rateLimitInfo = this.rateLimits.get(userId)
    if (rateLimitInfo) {
      rateLimitInfo.requestCount++
    }
  }

  /**
   * Validate database ID format
   */
  private isValidDatabaseId(dbId: string): boolean {
    // Notion database IDs are 32 characters long (UUID without hyphens)
    return /^[0-9a-f]{32}$/i.test(dbId.replace(/-/g, ''))
  }

  /**
   * Get user statistics
   */
  getUserStats(userId: string): {
    totalRequests: number
    lastActive: Date
    tier: string
    remainingRequests: number
  } | null {
    const user = this.users.get(userId)
    if (!user) return null

    const { remainingRequests } = this.canMakeRequest(userId)

    return {
      totalRequests: user.requestCount,
      lastActive: user.lastActive,
      tier: user.tier,
      remainingRequests
    }
  }

  /**
   * Deactivate user
   */
  deactivateUser(userId: string): boolean {
    const user = this.users.get(userId)
    if (user) {
      user.isActive = false
      return true
    }
    return false
  }

  /**
   * Get all active users (admin function)
   */
  getAllActiveUsers(): UserProfile[] {
    return Array.from(this.users.values()).filter(user => user.isActive)
  }
}

// Singleton instance
let userManager: UserManager | null = null

export function getUserManager(): UserManager {
  if (!userManager) {
    userManager = new UserManager()
  }
  return userManager
}