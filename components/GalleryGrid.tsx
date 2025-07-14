import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/legacy/image'
import { getBlockTitle, getPageProperty } from 'notion-utils'
import { mapPageUrl } from '@/lib/map-page-url'
import { mapImageUrl } from '@/lib/map-image-url'
import type * as types from '@/lib/types'
import type { SiteConfig } from '@/lib/site-config'
import styles from './GalleryGrid.module.css'

interface GalleryGridProps {
  site: SiteConfig
  recordMap: types.ExtendedRecordMap
  collection: any
  collectionView: any
  collectionData: any
}

interface GalleryItemProps {
  blockId: string
  block: any
  title: string
  imageUrl: string | null
  description: string | null
  pageUrl: string
}

function GalleryItem({ blockId, block, title, imageUrl, description, pageUrl }: GalleryItemProps) {
  const [imageError, setImageError] = useState(false)
  
  return (
    <Link key={blockId} href={pageUrl} className={styles.galleryItem}>
      <div className={styles.imageContainer}>
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={title || ''}
            layout="fill"
            objectFit="cover"
            className={styles.image}
            sizes="(max-width: 768px) 25vw, 10vw"
            priority={false}
            onError={(e) => {
              console.log('Image load error:', imageUrl)
              setImageError(true)
            }}
          />
        ) : (
          <div className={styles.placeholder}>
            <span>{title?.charAt(0) || '?'}</span>
          </div>
        )}
      </div>
      <div className={styles.caption}>
        <h3 className={styles.title}>{title}</h3>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </div>
    </Link>
  )
}

export function GalleryGrid({
  site,
  recordMap,
  collection,
  collectionView,
  collectionData
}: GalleryGridProps) {
  // Get all blocks from the record map for gallery display
  const allBlocks = recordMap ? Object.values(recordMap.block || {}) : []
  
  // Filter for page blocks that could be gallery items
  const galleryBlocks = allBlocks.filter((blockWrapper) => {
    const block = blockWrapper?.value
    return block && (
      block.type === 'page' || 
      block.type === 'image' ||
      block.parent_table === 'collection'
    )
  })

  // If we have collection data, use it; otherwise use filtered blocks
  const blocksToRender = collectionData?.blockIds || galleryBlocks.map(b => b.value.id)
  
  // Demo data if no real data
  const demoItems = [
    { id: '1', title: 'Sample Item 1', description: 'Demo description 1' },
    { id: '2', title: 'Sample Item 2', description: 'Demo description 2' },
    { id: '3', title: 'Sample Item 3', description: 'Demo description 3' },
    { id: '4', title: 'Sample Item 4', description: 'Demo description 4' },
    { id: '5', title: 'Sample Item 5', description: 'Demo description 5' },
    { id: '6', title: 'Sample Item 6', description: 'Demo description 6' },
    { id: '7', title: 'Sample Item 7', description: 'Demo description 7' },
    { id: '8', title: 'Sample Item 8', description: 'Demo description 8' },
    { id: '9', title: 'Sample Item 9', description: 'Demo description 9' },
    { id: '10', title: 'Sample Item 10', description: 'Demo description 10' }
  ]
  
  return (
    <div className={styles.galleryGrid}>
      {blocksToRender.length > 0 ? (
        blocksToRender.map((blockId: string) => {
          const block = recordMap.block[blockId]?.value
          if (!block) return null

          const title = getBlockTitle(block, recordMap)
          const coverImage = getPageProperty<string>('Cover', block, recordMap)
          const description = getPageProperty<string>('Description', block, recordMap)
          const searchParams = new URLSearchParams()
          const pageUrl = mapPageUrl(site as any, recordMap, searchParams)(blockId)
          
          // Try to get image from various sources
          let imageUrl = null
          
          // Helper function to find image properties
          const findImageProperty = () => {
            // Common image property names (English and Korean)
            const imagePropertyNames = [
              'Cover', 'Image', 'Thumbnail', 'Photo', 'Picture', 'Media',
              '커버', '이미지', '썸네일', '사진', '그림', '미디어'
            ]
            
            for (const propName of imagePropertyNames) {
              const prop = getPageProperty<string>(propName, block, recordMap)
              if (prop) return prop
            }
            
            // Check all properties for file/media types
            if (collection?.schema) {
              for (const [propId, propSchema] of Object.entries(collection.schema)) {
                const schema = propSchema as any
                if (schema.type === 'file' || schema.type === 'media') {
                  const prop = getPageProperty<string>(schema.name, block, recordMap)
                  if (prop) return prop
                }
              }
            }
            
            return null
          }
          
          // 1. Check for Cover property first
          const imageProperty = coverImage || findImageProperty()
          if (imageProperty) {
            imageUrl = mapImageUrl(imageProperty, block)
            console.log('Found image property:', imageProperty, '-> mapped to:', imageUrl)
          }
          
          // 2. Check for page cover (format.page_cover)
          if (!imageUrl && block.format?.page_cover) {
            imageUrl = mapImageUrl(block.format.page_cover, block)
            console.log('Found page cover:', block.format.page_cover, '-> mapped to:', imageUrl)
          }
          
          // 3. Check for page icon if it's an image URL
          if (!imageUrl && block.format?.page_icon && block.format.page_icon.startsWith('http')) {
            imageUrl = block.format.page_icon
            console.log('Found page icon:', imageUrl)
          }

          return (
            <GalleryItem
              key={blockId}
              blockId={blockId}
              block={block}
              title={title}
              imageUrl={imageUrl}
              description={description}
              pageUrl={pageUrl}
            />
          )
        })
      ) : (
        // Demo gallery items
        demoItems.map((item) => (
          <div key={item.id} className={styles.galleryItem}>
            <div className={styles.imageContainer}>
              <div className={styles.placeholder}>
                <span>{item.title.charAt(0)}</span>
              </div>
            </div>
            <div className={styles.caption}>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.description}>{item.description}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}