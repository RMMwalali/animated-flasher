import Link from 'next/link'
import { EnquiryForm } from '@/components/forms/EnquiryForm'
import { JourneyCard, MonthBar } from '@/components/home/JourneyCard'
import { Icon } from '@/components/icons/Icon'
import { Faq } from '@/components/page/Faq'
import { KeyFacts } from '@/components/page/KeyFacts'
import { PageHero } from '@/components/page/PageHero'
import { getTrips, type Fact, type TripVM } from '@/lib/content'
import { JsonLd, faqPage, touristTrip } from '@/lib/seo/jsonld'
import { TYPE_META } from './TripIndexPage'

const MONTH_NAMES: Record<string, string> = { jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun', jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec' }
const MEALS: Record<string, string> = { B: 'Breakfast', L: 'Lunch', D: 'Dinner' }
const usd = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

/** Facts derived from the journey, then any extra rows the owner added. */
export function tripFacts(t: TripVM): Fact[] {
  const rows: Fact[] = [
    { label: 'Duration', value: `${t.days} ${t.days === 1 ? 'day' : 'days'}${t.nights ? `, ${t.nights} ${t.nights === 1 ? 'night' : 'nights'}` : ''}` },
    { label: 'Starts from', value: t.startsFrom || 'Diani Beach' },
  ]
  if (t.priceFrom) rows.push({ label: 'Price from', value: `${usd(t.priceFrom)} ${t.priceBasis ?? 'per person'}` })
  if (t.bestMonths.length) rows.push({ label: 'Best months', value: t.bestMonths.map((m) => MONTH_NAMES[m]).join(', ') })
  if (t.destinations.length) rows.push({ label: 'Destinations', value: t.destinations.map((d) => d.name).join(', ') })
  if (t.groupSizeMax) rows.push({ label: 'Group size', value: `Up to ${t.groupSizeMax}` })
  if (t.difficulty) rows.push({ label: 'Difficulty', value: t.difficulty[0]!.toUpperCase() + t.difficulty.slice(1) })
  const own = t.keyFacts.filter((f) => !rows.some((r) => r.label.toLowerCase() === f.label.toLowerCase()))
  return [...rows, ...own]
}

export async function TripDetail({ trip }: { trip: TripVM }) {
  const meta = TYPE_META[trip.type]
  const related = (await getTrips({ type: trip.type })).filter((t) => t.slug !== trip.slug).slice(0, 3)
  const tone = trip.type === 'coastal' ? 'coast' : trip.type === 'walking' ? 'night' : 'safari'
  return (
    <>
      <JsonLd data={[touristTrip(trip), faqPage(trip.faqs)]} />
      <PageHero
        eyebrow={`${trip.days} ${trip.days === 1 ? 'day' : 'days'} · ${meta.name}`}
        title={trip.statement || trip.title}
        emphasis={trip.statement ? trip.emphasis : null}
        intro={trip.summary}
        image={trip.heroImage}
        tone={tone}
        crumbs={[{ name: meta.name, path: meta.path }, { name: trip.title, path: `${meta.path}/${trip.slug}` }]}
      >
        <p className="mt-6 font-display text-2xl" data-reveal>{trip.title}</p>
      </PageHero>

      <div data-tone="cream" className="py-16 sm:py-24">
        <div className="gutter mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-20">
            {trip.highlights.length > 0 && (
              <section aria-labelledby="highlights">
                <h2 id="highlights" className="font-display text-3xl font-medium sm:text-4xl">Highlights</h2>
                <ol className="mt-6 grid gap-0 border-t border-deep/60 sm:grid-cols-2 sm:gap-x-10">
                  {trip.highlights.map((h, i) => (
                    <li key={h} className="grid grid-cols-[2.5rem_1fr] gap-2 border-b border-line py-4" data-reveal style={{ ['--d' as string]: `${i * 0.05}s` }}>
                      <span className="font-mono text-sm text-orange-600">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-lg">{h}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {trip.itinerary.length > 0 && (
              <section aria-labelledby="itinerary">
                <h2 id="itinerary" className="font-display text-3xl font-medium sm:text-4xl">Day by day</h2>
                <ol className="relative mt-8 grid gap-10 border-l border-deep/30 pl-8">
                  {trip.itinerary.map((d, i) => (
                    <li key={i} className="relative" data-reveal>
                      <span className="absolute -left-[3.05rem] top-0 grid size-9 place-items-center rounded-full bg-deep font-mono text-xs text-cream">{i + 1}</span>
                      <p className="eyebrow text-teal-ink">Day {i + 1}</p>
                      <h3 className="mt-1 font-display text-2xl font-medium">{d.title}</h3>
                      {d.description && <p className="mt-2 text-lg leading-relaxed">{d.description}</p>}
                      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs uppercase tracking-[0.12em] text-deep/85">
                        {d.overnight && <span className="inline-flex items-center gap-1.5"><Icon name="bed" size={14} />{d.overnight}</span>}
                        {d.meals?.length ? <span className="inline-flex items-center gap-1.5"><Icon name="sun" size={14} />{d.meals.map((m) => MEALS[m] ?? m).join(', ')}</span> : null}
                        {d.drive && <span className="inline-flex items-center gap-1.5"><Icon name="vehicle" size={14} />{d.drive}</span>}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {(trip.inclusions.length > 0 || trip.exclusions.length > 0) && (
              <section aria-labelledby="included" className="grid gap-10 sm:grid-cols-2">
                <div>
                  <h2 id="included" className="font-display text-3xl font-medium">Included</h2>
                  <ul className="mt-5 grid gap-3">
                    {trip.inclusions.map((x) => <li key={x} className="flex gap-3"><Icon name="check" size={20} className="mt-0.5 shrink-0 text-green" />{x}</li>)}
                  </ul>
                </div>
                <div>
                  <h2 className="font-display text-3xl font-medium">Not included</h2>
                  <ul className="mt-5 grid gap-3">
                    {trip.exclusions.map((x) => <li key={x} className="flex gap-3"><Icon name="minus" size={20} className="mt-0.5 shrink-0 text-orange-600" />{x}</li>)}
                  </ul>
                </div>
              </section>
            )}

            <KeyFacts facts={tripFacts(trip)} />

            {trip.destinations.length > 0 && (
              <section aria-labelledby="where">
                <h2 id="where" className="eyebrow text-teal-ink">Where you will go</h2>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {trip.destinations.map((d) => (
                    <li key={d.slug}>
                      <Link href={`/destinations/${d.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-deep/30 px-4 hover:border-deep">
                        <Icon name="map-pin" size={16} />{d.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Faq items={trip.faqs} />

            <section id="ask" aria-labelledby="ask-title" className="rounded-3xl bg-paper p-6 sm:p-10">
              <h2 id="ask-title" className="font-display text-3xl font-medium">Ask about this journey</h2>
              <p className="mt-2 text-deep/85">Questions about dates, rooms or children? We reply personally from Diani.</p>
              <div className="mt-8">
                <EnquiryForm ctaId={`trip-${trip.slug}-form`} tripSlug={trip.slug} />
              </div>
            </section>
          </div>

          {/* booking panel */}
          <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Book this journey">
            <div className="rounded-3xl bg-deep p-7 text-cream" data-tone="night">
              <p className="eyebrow text-ochre">From</p>
              <p className="mt-1 font-display text-5xl">{trip.priceFrom ? usd(trip.priceFrom) : 'On request'}</p>
              {trip.priceBasis && <p className="mt-1 text-sm text-cream/80">{trip.priceBasis}</p>}
              <dl className="mt-6 grid gap-4 border-t border-cream/20 pt-5 text-sm">
                <div className="flex justify-between gap-4"><dt className="eyebrow text-cream/80">Length</dt><dd>{trip.days} {trip.days === 1 ? 'day' : 'days'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="eyebrow text-cream/80">From</dt><dd>{trip.startsFrom || 'Diani Beach'}</dd></div>
                {trip.bestMonths.length > 0 && <div><dt className="eyebrow text-cream/80">Best months</dt><dd className="mt-3 text-ochre"><MonthBar months={trip.bestMonths} /></dd></div>}
              </dl>
              <Link href={`/plan-your-trip?trip=${trip.slug}`} className="btn btn-primary mt-7 w-full justify-center" data-cta={`trip-${trip.slug}-request`}>
                Request to book <Icon name="arrow-right" size={18} />
              </Link>
              <a href="#ask" className="mt-3 flex min-h-11 items-center justify-center gap-2 text-sm underline-offset-4 hover:underline" data-cta={`trip-${trip.slug}-ask`}>
                <Icon name="chat" size={16} /> Ask a question first
              </a>
              <p className="mt-5 border-t border-cream/20 pt-4 text-xs leading-relaxed text-cream/80">
                No payment now. We confirm availability and your price, then you pay a deposit by M-Pesa or card.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section data-tone="night" className="py-20 sm:py-28">
          <div className="gutter mx-auto max-w-7xl">
            <h2 className="font-display text-4xl font-medium">You might also like</h2>
            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => <JourneyCard key={t.slug} trip={t} ctaPrefix={`trip-${trip.slug}-related`} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
