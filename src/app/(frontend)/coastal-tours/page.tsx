import type { Metadata } from 'next'
import { TripIndexPage, TYPE_META } from '@/components/journeys/TripIndexPage'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600

export const metadata: Metadata = pageMeta({
  title: `${TYPE_META.coastal.name} from Diani Beach, Kenya`,
  description: TYPE_META.coastal.intro,
  path: TYPE_META.coastal.path,
  ogTitle: TYPE_META.coastal.title,
})

export default function Page() {
  return <TripIndexPage type="coastal" />
}
