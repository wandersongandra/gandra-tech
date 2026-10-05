import type { MetadataRoute } from 'next'
import { projects } from '@/lib/projects'
import { services } from '@/lib/services'
import { siteLastModified, siteUrl } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const projectUrls: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${siteUrl}/trabalhos/${p.slug}`,
    lastModified: siteLastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const serviceUrls: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${siteUrl}/servicos/${service.slug}`,
    lastModified: siteLastModified,
    changeFrequency: 'monthly',
    priority: 0.9,
  }))

  return [
    { url: siteUrl, lastModified: siteLastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/servicos`, lastModified: siteLastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/trabalhos`, lastModified: siteLastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/contato`, lastModified: siteLastModified, changeFrequency: 'yearly', priority: 0.7 },
    ...serviceUrls,
    ...projectUrls,
  ]
}
