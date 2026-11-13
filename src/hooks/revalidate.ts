import type { CollectionAfterChangeHook } from 'payload'
import { pingIndexNow } from '@/lib/seo/indexnow'

type Doc = Record<string, any>

/**
 * After a published change: refresh cached pages (ISR) and tell search
 * engines (IndexNow: Bing, Yandex, Seznam...) that the URLs changed.
 * Safe to call from scripts (seed): revalidation is skipped outside Next.
 */
export const revalidateAfterChange =
  (paths: (doc: Doc) => string[]): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req, context }) => {
    if (context?.skipRevalidate) return doc
    const published = doc._status === undefined || doc._status === 'published'
    const wasPublished = previousDoc?._status === 'published'
    if (!published && !wasPublished) return doc
    const urls = paths(doc).filter(Boolean)
    try {
      const { revalidatePath, revalidateTag } = await import('next/cache')
      revalidateTag('content', 'max')
      for (const p of urls) revalidatePath(p)
      revalidatePath('/')
      revalidatePath('/sitemap.xml')
    } catch {
      // not running inside Next.js (e.g. seed script)
    }
    if (published && !req.context?.seeding) {
      pingIndexNow(urls).catch((e) => req.payload.logger.warn(`IndexNow ping failed: ${String(e)}`))
    }
    return doc
  }
