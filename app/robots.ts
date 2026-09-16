import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

export const dynamic = 'force-static'

const allowedCrawlers = [
  'Googlebot',
  'Bingbot',
  'OAI-SearchBot',
  'PerplexityBot',
  'Claude-SearchBot',
  'Applebot',
  'DuckAssistBot',
  'ChatGPT-User',
  'Perplexity-User',
  'Claude-User',
  'Manus Bot',
  'MistralAI-User',
]

const blockedTrainingCrawlers = [
  'GPTBot',
  'ClaudeBot',
  'CCBot',
  'Bytespider',
  'Amazonbot',
  'meta-externalagent',
  'Google-Extended',
  'Applebot-Extended',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...allowedCrawlers.map((userAgent) => ({ userAgent, allow: '/' })),
      ...blockedTrainingCrawlers.map((userAgent) => ({ userAgent, disallow: '/' })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
