# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
- Use `pnpm` as the package manager (configured with pnpm@10.11.1)
- Install dependencies: `pnpm install` or `pnpm install --frozen-lockfile` for CI
- Upgrade specific Notion packages: `pnpm run deps:upgrade`

### Development Server
- Start development server: `pnpm dev` (runs on http://localhost:3000)
- Production build: `pnpm build`
- Start production server: `pnpm start`

### Testing and Code Quality
- Run all tests: `pnpm test` (includes lint and prettier checks)
- Lint only: `pnpm run test:lint`
- Format check only: `pnpm run test:prettier`

### Bundle Analysis
- Analyze bundle: `pnpm run analyze`
- Analyze server bundle: `pnpm run analyze:server`
- Analyze browser bundle: `pnpm run analyze:browser`

### Local Development with react-notion-x
If working with local react-notion-x packages:
- Link local packages: `pnpm run deps:link`
- Unlink and restore npm packages: `pnpm run deps:unlink`

## Architecture Overview

### Core Framework
This is a Next.js 15+ application using the Pages Router architecture that creates a portfolio/gallery site powered by Notion as a CMS.

### Key Architecture Components

**Notion Integration:**
- Uses Notion Official API (@notionhq/client) and react-notion-x for rendering
- Two main databases: Content Database and Navigation Database
- Dynamic navigation system managed entirely through Notion
- Supports both Gallery and Single Page display modes

**Display Modes:**
- **Gallery Mode**: Grid layout for portfolios/media with thumbnails (components/NotionApiGallery.tsx)
- **Single Page Mode**: Clean content presentation using react-notion-x (components/SinglePageView.tsx)

**Configuration System:**
- `site.config.ts`: Main site configuration (domains, social links, Notion page IDs)
- `lib/site-config.ts`: Site configuration interface and utilities
- `lib/config.ts`: Runtime configuration management with environment variables

**Navigation System:**
- Dynamic navigation controlled by Notion Navigation Database
- Properties: 표시명 (display name), 네비게이션 순서 (order), 활성화 (enabled), 표시 방식 (display type)
- Implemented in `components/OverlayNavigation.tsx` and `components/DynamicNavigation.tsx`

**Content Structure:**
- Content Database properties: 제목 (title), 썸네일 (media), Description, 노출 순서 (order), 페이지 카테고리 (category relation)
- Automatic media type detection for images and videos
- Korean language support built-in

### Key Libraries
- **react-notion-x**: Notion page rendering (v7.4.2)
- **notion-client/types/utils**: Notion API interaction (v7.4.2)
- **@fisch0920/use-dark-mode**: Dark mode support
- **next-seo**: SEO optimization
- **react-tweet**: Twitter embed support

### File Structure Patterns
- `/components/`: React components with corresponding `.module.css` files
- `/lib/`: Utilities, configuration, and Notion API logic
- `/pages/`: Next.js pages including API routes
- `/styles/`: Global styles, Notion-specific styles, and Prism theme

### Environment Configuration
Required environment variables:
- `NOTION_API_KEY`: Notion integration token
- `NOTION_DATABASE_ID`: Main content database ID  
- `NOTION_NAVIGATION_DB_ID`: Navigation database ID

Optional:
- `REDIS_HOST`, `REDIS_PASSWORD`: For caching (if isRedisEnabled: true)

### Performance Optimizations
- Image optimization with AVIF/WebP support
- Lazy loading and caching
- Static page generation with 300s timeout
- Bundle analysis tools included

### Korean Language Support
This template has built-in Korean language support with Korean property names in Notion databases and Korean content handling throughout the application.

## Site Configuration

### Basic Site Settings
**File**: `site.config.ts`

**Essential settings to customize:**
- `name`: Site name displayed in navigation header (top-left corner)
- `domain`: Your site's domain for SEO and canonical URLs
- `author`: Site author name for metadata
- `description`: Site description for SEO and social sharing

**Example customization:**
```typescript
export default siteConfig({
  name: 'My Portfolio Site',          // ← Navigation header text
  domain: 'myportfolio.com',
  author: 'John Doe',
  description: 'My personal portfolio and blog',
  // ... other settings
})
```

**Advanced settings:**
- Database IDs now handled through environment variables only
- `defaultPageIcon/Cover`: Site-wide defaults for pages
- `isPreviewImageSupportEnabled`: Enable image optimization
- `isRedisEnabled`: Enable caching (production recommended)

### Environment Variables
**File**: `.env.local`

**🎯 Simplified Setup - Only 3 variables needed!**

**Required:**
- `NOTION_API_KEY`: Notion integration token
- `NOTION_CATEGORY_DB_ID`: Category/navigation database ID
- `NOTION_CONTENT_DB_ID`: Content database ID

**Optional - Performance:**
- `REDIS_HOST`, `REDIS_PASSWORD`: For caching when `isRedisEnabled: true`

**Quick Setup Example:**
```bash
# .env.local
NOTION_API_KEY=secret_your_integration_token_here
NOTION_CATEGORY_DB_ID=your_category_database_id_here
NOTION_CONTENT_DB_ID=your_content_database_id_here
```

**🚀 Ultra-Simple Setup Process:**

### Method 1: Central Integration Service (Recommended)
1. **Get invited as guest** to Notion workspace
2. **Copy database IDs** from shared databases (2 IDs)
3. **Get your unique User ID** from template provider
4. **Set 3 environment variables** (no token needed!)
5. **Deploy instantly!**

### Method 2: Traditional Setup
1. Create your own Notion Integration
2. Get integration token
3. Copy database IDs
4. Set environment variables
5. Deploy

**🔒 Security Features:**
- Rate limiting (100 requests/hour for free tier)
- User tracking and analytics
- Database access validation
- Request monitoring

## Development Workflow Guidelines

### Branch Management
- **For new features**: Always create a new branch and check out to it before starting development
- **Feature completion**: Commit changes before running tests (to maintain revertible state)
- **Multiple feature requests**: If user requests a different feature while working on current one, ask if they want to create a new branch before proceeding

### Code Quality Workflow
1. Complete feature implementation
2. Commit changes (ensures revertible state)
3. Run `pnpm test` to check formatting and linting
4. Fix any code style issues if tests fail
5. Run tests again to confirm all checks pass

### Code Formatting
- The project uses Prettier and ESLint for code quality
- Run `prettier --write '**/*.{js,jsx,ts,tsx}'` to auto-fix formatting issues
- Ensure all tests pass before considering feature complete