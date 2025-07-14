# Notion Portfolio Template

> A modern, dynamic portfolio template powered by Notion CMS with gallery and single-page views.

[**한국어 README**](./README.ko.md) | [**English README**](./README.md)

[![Next.js](https://img.shields.io/badge/Next.js-13+-black)](https://nextjs.org/)
[![Notion](https://img.shields.io/badge/Notion-CMS-blue)](https://notion.so)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## ✨ Features

- **🎨 Dynamic Gallery Layout**: Perfect for showcasing portfolios, photography, or creative work
- **📄 Single Page Views**: Clean, focused content presentation using react-notion-x
- **🗂️ Dynamic Navigation**: Manage navigation entirely through Notion databases
- **🎯 Dual Display Modes**: Switch between Gallery and Single Page views per category
- **📱 Fully Responsive**: Mobile-first design that works on all devices
- **⚡ Performance Optimized**: Lazy loading, caching, and Next.js optimizations
- **🌍 Korean Language Support**: Built-in support for Korean content and properties
- **🎬 Media Support**: Images and videos with automatic type detection
- **🚀 Easy Deployment**: One-click deployment to Vercel

## 🚀 Quick Start

### 1. Use This Template

Click the **"Use this template"** button above or [click here](../../generate) to create a new repository.

### 2. Set Up Notion Database

Create two databases in Notion:

#### Main Content Database
- **제목** (Title): Title property
- **썸네일** (Files & media): Thumbnail images/videos  
- **Description** (Rich text): Optional description
- **노출 순서** (Number): Display order (optional)
- **페이지 카테고리** (Relation): Link to Navigation Database

#### Navigation Database  
- **표시명** (Title): Display name for navigation
- **네비게이션 순서** (Number): Navigation order
- **활성화** (Checkbox): Enable/disable navigation item
- **표시 방식** (Select): Choose "Gallery" or "Single Page"

### 3. Configure Environment

1. Clone your new repository:
```bash
git clone [your-repo-url]
cd [your-repo-name]
npm install
```

2. Copy environment template:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your Notion credentials:
```bash
NOTION_API_KEY=your_notion_integration_token
NOTION_DATABASE_ID=your_main_database_id
NOTION_NAVIGATION_DB_ID=your_navigation_database_id
```

4. Update `site.config.ts` with your site information:
```typescript
export default siteConfig({
  rootNotionPageId: 'your-notion-page-id',
  name: 'Your Site Name',
  domain: 'yourdomain.com',
  author: 'Your Name',
  description: 'Your site description',
})
```

### 4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## 📖 How It Works

### Display Types

**Gallery Mode**: Perfect for portfolios, showcasing work with thumbnails in a responsive grid
**Single Page Mode**: Clean, focused content presentation for about pages, contact info, etc.

### Dynamic Navigation

All navigation is managed through your Notion Navigation Database:
- Add new categories by creating new rows
- Reorder navigation by changing the "네비게이션 순서" number
- Toggle visibility with the "활성화" checkbox
- Switch between Gallery/Single Page views with "표시 방식"

### Content Management

1. **Add new content**: Create new pages in your Main Content Database
2. **Set category**: Link to appropriate Navigation Database entry
3. **Add media**: Upload images or videos to the "썸네일" property
4. **Control order**: Use "노출 순서" to control display sequence

## 🛠️ Customization

### Styling
- Modify `/styles/globals.css` for global styles
- Update color schemes in CSS custom properties
- Customize component styles in respective `.module.css` files

### Layout
- Gallery grid settings in `components/NotionApiGallery.tsx`
- Single page layouts in `components/SinglePageView.tsx`
- Navigation behavior in `components/OverlayNavigation.tsx`

## 📦 Tech Stack

- **Framework**: Next.js 13+ with App Router
- **CMS**: Notion Official API
- **Rendering**: react-notion-x for rich Notion content
- **Styling**: CSS Modules with custom properties
- **TypeScript**: Full type safety
- **Deployment**: Vercel (recommended)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this template for your projects!

---

**Need help?** Check out the [Notion API documentation](https://developers.notion.com/) or open an issue.
