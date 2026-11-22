import type { MetadataRoute } from 'next'
import { siteDescription, siteName, siteUrl } from '@/lib/site'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: 'Gandra Tech',
    description: siteDescription,
    start_url: siteUrl,
    scope: '/',
    display: 'standalone',
    background_color: '#ece8df',
    theme_color: '#12110e',
    lang: 'pt-BR',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
