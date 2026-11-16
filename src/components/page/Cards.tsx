import type { DestinationVM, ExperienceVM } from '@/lib/content'
import { PhotoCard } from './PhotoCard'

const REGION: Record<string, string> = { coast: 'Coast', mountain: 'Mountain', safari: 'Safari' }

export function DestinationCard({ d }: { d: DestinationVM }) {
  return (
    <PhotoCard
      href={`/destinations/${d.slug}`}
      image={d.heroImage}
      fallback={d.region === 'coast' ? 'coast' : d.region === 'mountain' ? 'dawn' : 'safari'}
      title={d.name}
      meta={REGION[d.region] ?? 'Safari'}
      summary={d.summary}
      cta="Explore"
      aspect="aspect-[4/5] sm:aspect-[4/3]"
    />
  )
}

const CAT: Record<string, string> = { water: 'On the water', wild: 'In the wild', culture: 'Culture & history', foot: 'On foot' }
const usd = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

export function ExperienceCard({ e }: { e: ExperienceVM }) {
  const meta = [CAT[e.category] ?? e.category, e.duration, e.priceFrom ? `from ${usd(e.priceFrom)}` : null].filter(Boolean).join(' · ')
  return (
    <PhotoCard
      href={e.location ? `/destinations/${e.location.slug}` : '/plan-your-trip'}
      image={e.image}
      fallback={e.category === 'water' ? 'coast' : e.category === 'foot' ? 'dawn' : 'safari'}
      title={e.title}
      meta={meta}
      summary={`${e.summary}${e.location ? ` In ${e.location.name}.` : ''}`}
      cta={e.location ? `More about ${e.location.name}` : 'Add to my trip'}
      aspect="aspect-[4/5] sm:aspect-[4/3]"
    />
  )
}
