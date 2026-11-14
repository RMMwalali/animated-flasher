import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'
import { MonthBar } from '@/components/home/JourneyCard'
import { Media } from '@/components/site/Media'
import type { DestinationVM, ExperienceVM } from '@/lib/content'

export function DestinationCard({ d }: { d: DestinationVM }) {
  return (
    <article className="group relative flex h-full flex-col">
      <Link href={`/destinations/${d.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-2xl" aria-label={d.name}>
        <div className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105">
          <Media media={d.heroImage} fallback={d.region === 'coast' ? 'coast' : d.region === 'mountain' ? 'dawn' : 'safari'} sizes="(min-width:1024px) 30vw, 90vw" />
        </div>
        <span className="eyebrow absolute left-4 top-4 rounded-full bg-night/75 px-3 py-1.5 text-cream backdrop-blur-sm">{d.region === 'coast' ? 'Coast' : d.region === 'mountain' ? 'Mountain' : 'Safari'}</span>
      </Link>
      <div className="flex flex-1 flex-col gap-2 pt-5">
        <h3 className="font-display text-2xl font-medium leading-tight"><Link href={`/destinations/${d.slug}`} className="link-u">{d.name}</Link></h3>
        <p className="line-clamp-3 opacity-85">{d.summary}</p>
        <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-current/25 pt-4 text-sm">
          <div>
            <dt className="eyebrow opacity-75">From Diani</dt>
            <dd className="mt-1">{d.distanceFromDiani || '-'}</dd>
          </div>
          <div>
            <dt className="eyebrow opacity-75">Best months</dt>
            <dd className="mt-3"><MonthBar months={d.bestMonths} /></dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

const CAT: Record<string, string> = { water: 'On the water', wild: 'In the wild', culture: 'Culture & history', foot: 'On foot' }
const usd = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

export function ExperienceCard({ e }: { e: ExperienceVM }) {
  return (
    <article className="flex h-full flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        <Media media={e.image} fallback={e.category === 'water' ? 'coast' : e.category === 'foot' ? 'dawn' : 'safari'} sizes="(min-width:1024px) 30vw, 90vw" />
        <span className="eyebrow absolute left-4 top-4 rounded-full bg-night/75 px-3 py-1.5 text-cream backdrop-blur-sm">{CAT[e.category] ?? e.category}</span>
      </div>
      <h3 className="mt-5 font-display text-2xl font-medium">{e.title}</h3>
      <p className="mt-2 flex-1 opacity-85">{e.summary}</p>
      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-semibold tabular-nums text-xs uppercase tracking-[0.06em] opacity-85">
        {e.duration && <span className="inline-flex items-center gap-1.5"><Icon name="clock" size={14} />{e.duration}</span>}
        {e.location && <Link href={`/destinations/${e.location.slug}`} className="link-u inline-flex items-center gap-1.5"><Icon name="map-pin" size={14} />{e.location.name}</Link>}
        {e.priceFrom ? <span>From {usd(e.priceFrom)}</span> : null}
      </p>
    </article>
  )
}
