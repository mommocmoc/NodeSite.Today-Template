import type { GetServerSideProps } from 'next'
import { NextSeo } from 'next-seo'
import { NotionPage } from '@/components/NotionPage'
import { NotionApiGallery } from '@/components/NotionApiGallery'
import { OverlayNavigation } from '@/components/OverlayNavigation'
import { SinglePageView } from '@/components/SinglePageView'
import { AdminTools } from '@/components/AdminTools'
import type { NavigationItem } from './api/navigation'
import { domain, isDev } from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'
import { resolveNotionPage } from '@/lib/resolve-notion-page'
import { type PageProps, type Params } from '@/lib/types'

interface DynamicPageProps {
  pageType: 'notion' | 'category'
  notionProps?: PageProps
  category?: NavigationItem
  notionPageId?: string
  siteConfig?: any
}

// Single Page 타입에서 여러 페이지 중 우선순위에 따라 선택하는 함수
function selectSinglePageByPriority(items: any[]): any {
  // 1. 노출 순서가 있는 페이지들을 우선 정렬
  const itemsWithOrder = items
    .filter(
      (item) =>
        item.displayOrder !== undefined &&
        item.displayOrder !== null &&
        !isNaN(item.displayOrder)
    )
    .sort((a, b) => a.displayOrder - b.displayOrder)

  // 2. 노출 순서가 없는 페이지들을 최신순으로 정렬
  const itemsWithoutOrder = items
    .filter(
      (item) =>
        item.displayOrder === undefined ||
        item.displayOrder === null ||
        isNaN(item.displayOrder)
    )
    .sort(
      (a, b) =>
        new Date(b.lastEditedTime).getTime() -
        new Date(a.lastEditedTime).getTime()
    )

  // 3. 우선순위 적용
  if (itemsWithOrder.length > 0) {
    // 노출 순서가 있는 페이지 중 첫 번째 (가장 낮은 숫자)
    return itemsWithOrder[0]
  } else if (itemsWithoutOrder.length > 0) {
    // 노출 순서가 없으면 가장 최근에 수정된 페이지
    return itemsWithoutOrder[0]
  } else {
    // 모든 페이지가 없으면 첫 번째 페이지
    return items[0]
  }
}

interface DynamicPageProps {
  pageType: 'notion' | 'category'
  // 노션 페이지 props
  notionProps?: PageProps
  // 카테고리 페이지 props
  category?: NavigationItem
  notionPageId?: string
  siteConfig?: any
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { pageId } = context.params || {}

  console.log('=== Dynamic page getServerSideProps START ===')
  console.log('pageId:', pageId)
  console.log('context.req.url:', context.req.url)

  try {
    // 먼저 네비게이션 데이터 조회하여 카테고리인지 확인
    // 서버사이드에서는 절대 URL이 필요
    const host = context.req.headers.host
    const protocol = context.req.headers['x-forwarded-proto'] || 'http'
    const baseUrl = `${protocol}://${host}`

    const timestamp = new Date().getTime()
    console.log('=== DYNAMIC PAGE getServerSideProps ===')
    console.log('baseUrl:', baseUrl)
    console.log('pageId:', pageId)
    console.log('Fetching navigation data...')

    const navigationResponse = await fetch(
      `${baseUrl}/api/navigation?t=${timestamp}`
    )
    console.log('Navigation response status:', navigationResponse.status)

    const navigationData = (await navigationResponse.json()) as {
      success: boolean
      items?: NavigationItem[]
      message?: string
    }

    console.log('Navigation data:', navigationData)

    let category = null

    if (navigationData.success && navigationData.items) {
      console.log(
        'Available navigation items:',
        navigationData.items.map((item) => ({
          categoryName: item.categoryName,
          displayName: item.displayName,
          displayType: item.displayType,
          urlPath: item.urlPath
        }))
      )

      // URL 경로로 카테고리 찾기
      category = navigationData.items.find(
        (item: NavigationItem) =>
          item.urlPath === `/${pageId}` ||
          item.categoryName.toLowerCase() === pageId
      )

      console.log('Found category for pageId:', pageId, ':', category)
    } else {
      console.error('Navigation API failed:', navigationData)
      // API 실패 시 기본 동작: 갤러리 모드로 처리
      category = {
        id: 'fallback',
        categoryName: pageId as string,
        displayName: pageId as string,
        navigationOrder: 1,
        displayType: 'Gallery',
        isActive: true,
        urlPath: `/${pageId}`
      }
      console.log('Using fallback category:', category)
    }

    if (navigationData.success && navigationData.items) {
      console.log('Looking for:', `/${pageId}`, 'or', pageId)
      console.log(
        'Available categories:',
        navigationData.items.map((item: NavigationItem) => ({
          urlPath: item.urlPath,
          categoryName: item.categoryName,
          displayName: item.displayName
        }))
      )
    }

    console.log('Found category:', category)

    // 카테고리가 발견되면 카테고리 페이지로 처리
    if (category) {
      let notionPageId = null

      // Single Page 타입인 경우 노션 페이지 ID 조회
      if (category.displayType === 'Single Page') {
        const contentResponse = await fetch(
          `${baseUrl}/api/notion-gallery?category=${category.id}&t=${timestamp}`
        )
        const contentData = (await contentResponse.json()) as {
          success: boolean
          items?: any[]
        }

        if (
          contentData.success &&
          contentData.items &&
          contentData.items.length > 0
        ) {
          // 페이지 우선순위에 따라 선택
          const selectedPage = selectSinglePageByPriority(contentData.items)
          notionPageId = selectedPage.id
        }
      }

      return {
        props: {
          pageType: 'category',
          category,
          notionPageId,
          siteConfig: {
            domain: process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000',
            isSearchEnabled: false,
            previewImagesEnabled: true,
            forceRefreshImages: false,
            showTableOfContents: true,
            minTableOfContentsItems: 3,
            defaultPageIcon: null,
            defaultPageCover: null,
            defaultPageCoverPosition: 0.5,
            isLiteMode: false,
            isRedirectToLoginPage: false,
            isShowSocialMediaButtons: false,
            isPageANumberedList: false
          }
        }
      }
    }

    // 카테고리가 아니면 기존 노션 페이지 처리
    const rawPageId = pageId as string
    const notionProps = await resolveNotionPage(domain, rawPageId)

    return {
      props: {
        pageType: 'notion',
        notionProps
      }
    }
  } catch (err) {
    console.error('=== PAGE ERROR ===')
    console.error('domain:', domain)
    console.error('pageId:', pageId)
    console.error('error:', err)
    console.error('=== END PAGE ERROR ===')
    return {
      notFound: true
    }
  }
}

export default function DynamicPage({
  pageType,
  notionProps,
  category,
  notionPageId,
  siteConfig
}: DynamicPageProps) {
  // 기존 노션 페이지 렌더링
  if (pageType === 'notion' && notionProps) {
    return <NotionPage {...notionProps} />
  }

  // 카테고리 페이지 렌더링
  if (pageType === 'category' && category) {
    const pageTitle = category.displayName
    const pageDescription = `${category.displayName} 페이지입니다.`

    return (
      <>
        <NextSeo
          title={pageTitle}
          description={pageDescription}
          openGraph={{
            title: pageTitle,
            description: pageDescription,
            type: 'website'
          }}
        />

        <div className='gallery-layout'>
          <OverlayNavigation />

          {category.displayType === 'Single Page' && notionPageId ? (
            <SinglePageView
              pageId={notionPageId}
            />
          ) : (
            <NotionApiGallery categoryFilter={category.id} />
          )}

          <AdminTools />
        </div>
      </>
    )
  }

  // 기본 404 페이지
  return (
    <div>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>요청하신 페이지가 존재하지 않습니다.</p>
    </div>
  )
}
