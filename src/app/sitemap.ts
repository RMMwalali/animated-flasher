import type { MetadataRoute } from 'next'
import { TYPE_META } from '@/components/journeys/TripIndexPage'
import { getDestinations, getPosts, getTrips } from '@/lib/content'
import { env } from '@/lib/env'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const u = (p: string) => new URL(p, env.SITE_URL).toString()
  const [trips, destinations, posts] = await Promise.all([getTrips(), getDestinations(), getPosts()])
  const statics = ['/', '/safaris', '/coastal-tours', '/walking-and-mountain', '/destinations', '/wildlife', '/experiences', '/when-to-go', '/our-story', '/blog', '/plan-your-trip', '/contact', '/licences', '/kenya-eta', '/privacy', '/terms', '/cookies']
  return [
    ...statics.map((p) => ({ url: u(p), changeFrequency: 'weekly' as const, priority: p === '/' ? 1 : 0.7 })),
    ...trips.map((t) => ({ url: u(`${TYPE_META[t.type].path}/${t.slug}`), lastModified: t.updatedAt, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...destinations.map((d) => ({ url: u(`/destinations/${d.slug}`), lastModified: d.updatedAt, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...posts.map((p) => ({ url: u(`/blog/${p.slug}`), lastModified: p.updatedAt ?? p.publishedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ]
}
