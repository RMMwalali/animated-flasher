import type { Metadata } from 'next'
import { env } from '@/lib/env'
import type { SEO } from '@/lib/content'

export const SITE_NAME = 'Ngina Trails and Safaris'

/** Per-page metadata with canonical URL and OG image (CMS override > generated). */
export function pageMeta(opts: { title: string; description: string; path: string; seo?: SEO; type?: 'website' | 'article'; ogTitle?: string }): Metadata {
  const title = opts.seo?.title || opts.title
  const description = opts.seo?.description || opts.description
  const url = new URL(opts.path, env.SITE_URL).toString()
  const og = opts.seo?.image?.url
    ? [{ url: opts.seo.image.url, width: 1200, height: 630, alt: opts.seo.image.alt }]
    : [{ url: `/og?title=${encodeURIComponent(opts.ogTitle ?? opts.title)}`, width: 1200, height: 630, alt: title }]
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: opts.seo?.noIndex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, siteName: SITE_NAME, type: opts.type ?? 'website', images: og, locale: 'en_KE' },
    twitter: { card: 'summary_large_image', title, description, images: og.map((o) => o.url) },
  }
}
