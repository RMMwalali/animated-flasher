import type { MetadataRoute } from 'next'
import { TYPE_META } from '@/components/journeys/TripIndexPage'
import { getDestinations, getPages, getPosts, getTrips } from '@/lib/content'
import { env } from '@/lib/env'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const u = (p: string) => new URL(p, env.SITE_URL).toString()
  const [trips, destinations, posts, pages] = await Promise.all([getTrips(), getDestinations(), getPosts(), getPages()])
  const listed = (x: { seo?: { noIndex?: boolean | null } }) => !x.seo?.noIndex
  // fixed sections of the site; content pages (Our story, eTA guide, legal…) come from the CMS below
  const statics = ['/', '/safaris', '/coastal-tours', '/walking-and-mountain', '/destinations', '/wildlife', '/experiences', '/when-to-go', '/blog', '/plan-your-trip', '/contact', '/licences']
  const authors = [...new Map(posts.map((p) => [p.author.slug, p])).values()]
  const entries: MetadataRoute.Sitemap = [
    ...statics.map((p) => ({ url: u(p), changeFrequency: 'weekly' as const, priority: p === '/' ? 1 : 0.8 })),
    ...trips.filter(listed).map((t) => ({ url: u(`${TYPE_META[t.type].path}/${t.slug}`), lastModified: t.updatedAt, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...destinations.filter(listed).map((d) => ({ url: u(`/destinations/${d.slug}`), lastModified: d.updatedAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...pages.filter((p) => !p.noIndex).map((p) => ({ url: u(`/${p.slug}`), lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: ['privacy', 'terms', 'cookies'].includes(p.slug) ? 0.2 : 0.6 })),
    ...posts.filter(listed).map((p) => ({ url: u(`/blog/${p.slug}`), lastModified: p.updatedAt ?? p.publishedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...authors.map((p) => ({ url: u(`/blog/author/${p.author.slug}`), changeFrequency: 'monthly' as const, priority: 0.3 })),
  ]
  // one entry per address
  return [...new Map(entries.map((e) => [e.url, e])).values()]
}
