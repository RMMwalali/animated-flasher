import type { MetadataRoute } from 'next'
import { getSettings } from '@/lib/content'
import { env } from '@/lib/env'

export const revalidate = 3600

const SEARCH = ['Googlebot', 'Bingbot', 'Applebot']
const AI = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended']

/**
 * Search engines and AI assistants are welcome; private areas are not.
 * Both switches live in Business settings → Search & Google.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSettings()
  const disallow = ['/admin', '/api/', '/pay/', '/trip/', '/quote/']
  if (s.search.hideFromSearch) return { rules: [{ userAgent: '*', disallow: '/' }] }
  const aiRule = s.search.allowAiCrawlers ? { allow: '/', disallow } : { disallow: '/' }
  return {
    rules: [
      ...SEARCH.map((userAgent) => ({ userAgent, allow: '/', disallow })),
      ...AI.map((userAgent) => ({ userAgent, ...aiRule })),
      { userAgent: '*', allow: '/', disallow },
    ],
    sitemap: new URL('/sitemap.xml', env.SITE_URL).toString(),
    host: env.SITE_URL,
  }
}
