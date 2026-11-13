import type { Metadata } from 'next'
import { KenyaMap } from '@/components/destinations/KenyaMap'
import { DestinationCard } from '@/components/page/Cards'
import { CtaBand } from '@/components/page/CtaBand'
import { PageHero } from '@/components/page/PageHero'
import { SectionHead } from '@/components/page/SectionHead'
import { getDestinations } from '@/lib/content'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600

export const metadata: Metadata = pageMeta({
  title: 'Destinations: Kenya coast and safari parks from Diani Beach',
  description: 'Diani, Wasini and Kisite, Shimba Hills, Tsavo East and West, Amboseli, the Maasai Mara, Samburu, Lake Nakuru, Mount Kenya, Watamu, Lamu and Mombasa: distances from Diani, best months and key facts.',
  path: '/destinations',
  ogTitle: 'Thirteen places we know well',
})

const GROUPS = [
  { region: 'coast', eyebrow: 'The coast', title: 'Reefs, dhows and Swahili towns', tone: 'coast' },
  { region: 'safari', eyebrow: 'Safari', title: 'Parks and reserves', tone: 'cream' },
  { region: 'mountain', eyebrow: 'Mountain', title: 'High ground', tone: 'night' },
] as const

export default async function DestinationsPage() {
  const destinations = await getDestinations()
  const hero = destinations.find((d) => d.slug === 'amboseli')?.heroImage ?? destinations.find((d) => d.heroImage)?.heroImage
  return (
    <>
      <PageHero eyebrow="Destinations" title="Thirteen places we know well." emphasis="know" intro="Every journey starts from Diani Beach. Here is where we go, how far it is, and when it is at its best." image={hero} tone="safari" crumbs={[{ name: 'Destinations', path: '/destinations' }]} />
      <section data-tone="cream" className="py-16 sm:py-24">
        <div className="gutter mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <KenyaMap destinations={destinations} />
          <SectionHead eyebrow="From our door" title="The coast by day, the wild beyond." emphasis="wild" intro="Shimba Hills is 45 minutes away and Tsavo East about three hours by road. Amboseli and Tsavo West combine into one road trip; the Mara, Samburu and Lake Nakuru are a short flight away." />
        </div>
      </section>
      {GROUPS.map((g) => {
        const list = destinations.filter((d) => d.region === g.region)
        if (!list.length) return null
        return (
          <section key={g.region} data-tone={g.tone} className="py-20 sm:py-24">
            <div className="gutter mx-auto max-w-7xl">
              <SectionHead eyebrow={g.eyebrow} title={g.title} />
              <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((d) => <DestinationCard key={d.slug} d={d} />)}
              </div>
            </div>
          </section>
        )
      })}
      <CtaBand ctaId="destinations-cta" />
    </>
  )
}
