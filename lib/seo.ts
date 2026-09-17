import type { Metadata } from 'next'
import type { Service } from '@/lib/services'
import { absoluteAssetUrl, siteDescription, siteName, siteUrl } from '@/lib/site'

const defaultImage = '/og/home.png'

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
  const imageUrl = absoluteAssetUrl(image)

  return {
    title,
    description,
    robots: { index: true, follow: true },
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

export function createServiceJsonLd(service: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteUrl}/servicos#${service.slug}`,
    name: service.title,
    serviceType: service.title,
    description: service.description,
    url: `${siteUrl}/servicos#${service.slug}`,
    provider: { '@id': `${siteUrl}#organization` },
    areaServed: { '@type': 'Country', name: 'Brasil' },
    availableLanguage: 'pt-BR',
  }
}

export function createBreadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.href, siteUrl).toString(),
    })),
  }
}
