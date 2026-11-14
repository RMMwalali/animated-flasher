import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JourneyCard } from '@/components/home/JourneyCard'
import { Icon } from '@/components/icons/Icon'
import { CtaBand } from '@/components/page/CtaBand'
import { Faq } from '@/components/page/Faq'
import { KeyFacts } from '@/components/page/KeyFacts'
import { PageHero } from '@/components/page/PageHero'
import { Prose } from '@/components/page/Prose'
import { getDestination, getDestinations, getTripsForDestination, getWildlife, type DestinationVM, type Fact } from '@/lib/content'
import { JsonLd, faqPage, touristDestination } from '@/lib/seo/jsonld'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600
type Props = { params: Promise<{ slug: string }> }

const M: Record<string, string> = { jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun', jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec' }

function facts(d: DestinationVM): Fact[] {
  const rows: Fact[] = []
  if (d.distanceFromDiani) rows.push({ label: 'From Diani', value: d.distanceFromDiani })
  if (d.county) rows.push({ label: 'County', value: d.county })
  if (d.area) rows.push({ label: 'Area', value: d.area })
  if (d.altitude) rows.push({ label: 'Altitude', value: d.altitude })
  if (d.bestMonths.length) rows.push({ label: 'Best months', value: d.bestMonths.map((m) => M[m]).join(', ') })
  return [...rows, ...d.keyFacts.filter((f) => !rows.some((r) => r.label.toLowerCase() === f.label.toLowerCase()))]
}

export async function generateStaticParams() {
  return (await getDestinations()).map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await getDestination((await params).slug)
  if (!d) return {}
  return pageMeta({ title: `${d.name}, Kenya: guide, best time to visit and trips from Diani`, description: d.summary, path: `/destinations/${d.slug}`, seo: d.seo, ogTitle: d.name })
}

export default async function DestinationPage({ params }: Props) {
  const d = await getDestination((await params).slug)
  if (!d) notFound()
  const [trips, wildlife] = await Promise.all([getTripsForDestination(d.slug), getWildlife()])
  const animals = wildlife.filter((w) => w.whereToSee.some((x) => x.slug === d.slug))
  const tone = d.region === 'coast' ? 'coast' : d.region === 'mountain' ? 'night' : 'safari'
  return (
    <>
      <JsonLd data={[touristDestination(d), faqPage(d.faqs)]} />
      <PageHero eyebrow={d.region === 'coast' ? 'The coast' : d.region === 'mountain' ? 'Mountain' : 'Safari'} title={d.statement || d.name} emphasis={d.statement ? d.emphasis : null} intro={d.summary} image={d.heroImage} tone={tone} crumbs={[{ name: 'Destinations', path: '/destinations' }, { name: d.name, path: `/destinations/${d.slug}` }]}>
        {d.statement && <p className="mt-6 font-display text-2xl" data-reveal>{d.name}</p>}
      </PageHero>

      <div data-tone="cream" className="py-16 sm:py-24">
        <div className="gutter mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.2fr_1fr]">
          <div className="grid content-start gap-14">
            {d.highlights.length > 0 && (
              <section aria-labelledby="hl">
                <h2 id="hl" className="font-display text-3xl font-medium sm:text-4xl">Why go</h2>
                <ol className="mt-6 border-t border-deep/60">
                  {d.highlights.map((h, i) => (
                    <li key={h} className="grid grid-cols-[2.5rem_1fr] gap-2 border-b border-line py-4 text-lg" data-reveal>
                      <span className="font-semibold tabular-nums text-sm text-orange-600">{String(i + 1).padStart(2, '0')}</span>
                      {h}
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {d.body ? <Prose data={d.body} /> : null}
            <Faq items={d.faqs} heading={`${d.name}: questions`} />
          </div>
          <div className="grid content-start gap-12">
            <KeyFacts facts={facts(d)} />
            {animals.length > 0 && (
              <section aria-labelledby="wl">
                <h2 id="wl" className="eyebrow text-teal-ink">Wildlife here</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {animals.map((a) => (
                    <li key={a.slug}>
                      <Link href={`/wildlife#${a.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-deep/30 px-4 hover:border-deep">
                        <Icon name="binoculars" size={16} />{a.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>

      {trips.length > 0 && (
        <section data-tone="night" className="py-20 sm:py-28">
          <div className="gutter mx-auto max-w-7xl">
            <h2 className="font-display text-4xl font-medium">Journeys to {d.name}</h2>
            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((t) => <JourneyCard key={t.slug} trip={t} ctaPrefix={`dest-${d.slug}`} />)}
            </div>
          </div>
        </section>
      )}
      <CtaBand title={`Plan your time in ${d.name}.`} emphasis={d.name} ctaId={`dest-${d.slug}-cta`} />
    </>
  )
}
