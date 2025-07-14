# Deployment Guide

## Vercel Deployment

### 1. Environment Variables

Make sure to set the following environment variables in your Vercel dashboard:

**Required:**
- `NOTION_API_KEY` - Your Notion integration token
- `NOTION_DATABASE_ID` - Your main content database ID
- `NOTION_NAVIGATION_DB_ID` - Your navigation database ID

**Optional:**
- `NEXT_PUBLIC_SITE_URL` - Your site URL (only needed for custom domains)
- `NEXT_PUBLIC_DOMAIN` - Your domain name
- `REVALIDATE_SECRET` - Secret for manual cache revalidation

**Note:** Vercel automatically provides `VERCEL_URL` environment variable, so `NEXT_PUBLIC_SITE_URL` is only needed for custom domains or special cases.

### 2. Common Issues & Solutions

#### 400 Error (Bad Request)
- **Cause**: Missing or incorrect environment variables
- **Solution**: Check that all required environment variables are set in Vercel dashboard
- **Debug**: Visit `/api/debug?admin=true` to check environment variable status

#### 401 Error (Unauthorized)
- **Cause**: Notion API key is missing or invalid
- **Solution**: 
  1. Go to https://www.notion.so/my-integrations
  2. Create a new integration
  3. Copy the "Internal Integration Token"
  4. Set it as `NOTION_API_KEY` in Vercel

#### Navigation Not Working
- **Cause**: Navigation database not properly connected
- **Solution**: 
  1. Make sure your navigation database is shared with your Notion integration
  2. Check that `NOTION_NAVIGATION_DB_ID` is correct
  3. Verify database properties match the code expectations

### 3. Database Setup

#### Main Content Database Properties:
- **제목** (Title): Title property
- **썸네일** (Files & media): Thumbnail images/videos  
- **Description** (Rich text): Optional description
- **노출 순서** (Number): Display order (optional)
- **페이지 카테고리** (Relation): Link to Navigation Database

#### Navigation Database Properties:
- **표시명** (Title): Display name for navigation
- **네비게이션 순서** (Number): Navigation order
- **활성화** (Checkbox): Enable/disable navigation item
- **표시 방식** (Select): Choose "Gallery" or "Single Page"
- **URL 경로** (Rich text): Custom URL path (optional)

### 4. Vercel Configuration

Add these settings to your Vercel project:

1. **Build Command**: `pnpm build`
2. **Install Command**: `pnpm install`
3. **Output Directory**: Leave empty (Next.js default)
4. **Node.js Version**: 18.x or higher

### 5. Domain Configuration

1. Add your custom domain in Vercel dashboard
2. Update `NEXT_PUBLIC_SITE_URL` to your custom domain
3. Update `NEXT_PUBLIC_DOMAIN` to your domain name

### 6. Troubleshooting

#### Debug API Endpoints:
- `/api/debug?admin=true` - Check environment variables
- `/api/navigation` - Test navigation API
- `/api/notion-gallery` - Test gallery API

#### Force Cache Refresh:
- Add `?admin=true` to any page URL to show admin tools
- Click the "Force Refresh Cache" button to clear all caches

#### Check Logs:
- Go to Vercel dashboard → Functions → View logs
- Look for console.error messages from the APIs

### 7. Performance Optimization

- API responses are cached for 1 minute in production
- Use `?force=true` parameter to bypass cache during development
- Consider using ISR (Incremental Static Regeneration) for better performance

### 8. Security

- Never commit `.env.local` or `.env` files
- Use Vercel's environment variables for sensitive data
- Regularly rotate your Notion API keys
- Enable Vercel's security headers if needed