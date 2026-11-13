import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TripDetail } from '@/components/journeys/TripDetail'
import { TYPE_META } from '@/components/journeys/TripIndexPage'
import { getTrip, getTrips } from '@/lib/content'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600
export const dynamicParams = true

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getTrips({ type: 'walking' })).map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trip = await getTrip((await params).slug)
  if (!trip || trip.type !== 'walking') return {}
  return pageMeta({ title: `${trip.title}: ${trip.days}-day ${TYPE_META.walking.name.toLowerCase()} from Diani`, description: trip.summary, path: `${TYPE_META.walking.path}/${trip.slug}`, seo: trip.seo, ogTitle: trip.title })
}

export default async function Page({ params }: Props) {
  const trip = await getTrip((await params).slug)
  if (!trip || trip.type !== 'walking') notFound()
  return <TripDetail trip={trip} />
}
