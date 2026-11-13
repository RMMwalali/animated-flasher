import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

/** Search engines and AI assistants are welcome; private areas are not. */
export default function robots(): MetadataRoute.Robots {
  const disallow = ['/admin', '/api/', '/pay/', '/trip/']
  const agents = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended']
  return {
    rules: [...agents.map((userAgent) => ({ userAgent, allow: '/', disallow })), { userAgent: '*', allow: '/', disallow }],
    sitemap: new URL('/sitemap.xml', env.SITE_URL).toString(),
    host: env.SITE_URL,
  }
}
