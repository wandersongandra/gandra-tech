import type { MetadataRoute } from 'next'
import { projects } from '@/lib/projects'
import { siteLastModified, siteUrl } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const projectUrls: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${siteUrl}/trabalhos/${p.slug}`,
    lastModified: siteLastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    { url: siteUrl, lastModified: siteLastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/servicos`, lastModified: siteLastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/trabalhos`, lastModified: siteLastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/contato`, lastModified: siteLastModified, changeFrequency: 'yearly', priority: 0.8 },
    ...projectUrls,
  ]
}
