import type { Metadata } from 'next'
import { PlanForm } from '@/components/forms/PlanForm'
import { PageHero } from '@/components/page/PageHero'
import { getTrips } from '@/lib/content'
import { pageMeta } from '@/lib/seo/meta'

export const metadata: Metadata = pageMeta({
  title: 'Plan your trip or request to book',
  description: 'Tell us your dates, who is travelling and what you would love to see. We reply personally from Diani Beach with a plan and a clear price. Nothing is charged until you accept.',
  path: '/plan-your-trip',
})

type Props = { searchParams: Promise<{ trip?: string }> }

export default async function PlanPage({ searchParams }: Props) {
  const { trip: slug } = await searchParams
  const trips = (await getTrips()).map((t) => ({ slug: t.slug, title: t.title, days: t.days }))
  const initial = slug ? (trips.find((t) => t.slug === slug) ?? null) : null
  return (
    <>
      <PageHero
        eyebrow={initial ? 'Request to book' : 'Plan your trip'}
        title={initial ? `Request to book ${initial.title}.` : 'Tell us where your journey begins.'}
        emphasis={initial ? 'book' : 'begins'}
        intro={initial ? 'Choose your dates and tell us who is travelling. We check availability and send your confirmed price. Nothing is charged until you accept.' : 'Five short steps. We reply personally, usually within one working day, with a plan and a clear price.'}
        tone="cream"
        compact
        crumbs={[{ name: 'Plan your trip', path: '/plan-your-trip' }]}
      />
      <section data-tone="cream" className="pb-24">
        <div className="gutter mx-auto max-w-3xl rounded-3xl bg-paper p-6 sm:p-10">
          <PlanForm trips={trips} initialTrip={initial} />
        </div>
      </section>
    </>
  )
}
