import { CtaBand } from '@/components/page/CtaBand'
import { PageHero } from '@/components/page/PageHero'
import { getTrips, type TripVM } from '@/lib/content'
import { TripFilter } from './TripFilter'

export const TYPE_META: Record<TripVM['type'], { path: string; name: string; eyebrow: string; title: string; emphasis: string; intro: string; tone: 'safari' | 'coast' | 'night' }> = {
  safari: { path: '/safaris', name: 'Safaris', eyebrow: 'Safaris from Diani Beach', title: 'Into the red earth and golden plains.', emphasis: 'golden', intro: 'Tsavo is three hours from our door; Amboseli, the Mara and Samburu are a drive or a short flight away. Private vehicles, guides we know, and a pace that suits you.', tone: 'safari' },
  coastal: { path: '/coastal-tours', name: 'Coastal tours', eyebrow: 'The Swahili coast', title: 'Dhows, reefs and old stone towns.', emphasis: 'reefs', intro: 'Day trips and short escapes from Diani: the Kisite-Mpunguti marine park, Mombasa Old Town, Watamu and Lamu.', tone: 'coast' },
  walking: { path: '/walking-and-mountain', name: 'Walking & mountain', eyebrow: 'On foot', title: 'Slow down. Walk it.', emphasis: 'Walk', intro: 'Sacred forests a few minutes from the beach, waterfalls in the Shimba Hills and the trek to Point Lenana on Mount Kenya.', tone: 'night' },
}

export async function TripIndexPage({ type }: { type: TripVM['type'] }) {
  const meta = TYPE_META[type]
  const trips = await getTrips({ type })
  const hero = trips.find((t) => t.heroImage)?.heroImage
  return (
    <>
      <PageHero eyebrow={meta.eyebrow} title={meta.title} emphasis={meta.emphasis} intro={meta.intro} image={hero} tone={meta.tone} crumbs={[{ name: meta.name, path: meta.path }]} />
      <section data-tone="cream" className="py-16 sm:py-24">
        <div className="gutter mx-auto max-w-7xl">
          <TripFilter trips={trips} ctaPrefix={`${type}-index`} />
        </div>
      </section>
      <CtaBand title="Want something made for you?" emphasis="you" body="Tell us your dates, who is travelling and what you would love to see. We will plan it and send a clear price." ctaId={`${type}-index-cta`} />
    </>
  )
}
