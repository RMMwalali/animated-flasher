import { env } from '@/lib/env'

/**
 * Payload returns absolute media URLs built from SITE_URL, but next/image
 * only accepts absolute URLs from configured hosts. Files served by this app
 * (/api/media/file/…) become relative paths; external storage URLs (R2
 * public URL, allowed in next.config) stay absolute.
 */
export function localizeUrl(url: string): string {
  if (!/^https?:\/\//i.test(url)) return url
  try {
    const u = new URL(url)
    if (u.origin === new URL(env.SITE_URL).origin || u.pathname.startsWith('/api/media/file/')) return u.pathname + u.search
    return url
  } catch {
    return url
  }
}
