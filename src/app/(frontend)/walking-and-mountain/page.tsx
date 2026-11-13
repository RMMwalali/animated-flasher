import type { Metadata } from 'next'
import { TripIndexPage, TYPE_META } from '@/components/journeys/TripIndexPage'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600

export const metadata: Metadata = pageMeta({
  title: `${TYPE_META.walking.name} from Diani Beach, Kenya`,
  description: TYPE_META.walking.intro,
  path: TYPE_META.walking.path,
  ogTitle: TYPE_META.walking.title,
})

export default function Page() {
  return <TripIndexPage type="walking" />
}
