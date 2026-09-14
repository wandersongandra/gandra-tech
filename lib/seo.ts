import type { Metadata } from 'next'
import { siteDescription, siteName, siteUrl } from '@/lib/site'

const defaultImage = '/og-image.png'

type PageMetadataOptions = {
  title: string
  description?: string
  path: string
  image?: string
}

export function createPageMetadata({
  title,
  description = siteDescription,
  path,
  image = defaultImage,
}: PageMetadataOptions): Metadata {
  const fullTitle = `${title} — ${siteName}`
  const canonical = new URL(path, siteUrl).toString()
  const imageUrl = new URL(image, siteUrl).toString()

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: canonical,
      siteName,
      title: fullTitle,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${siteName} — ${title}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  }
}
