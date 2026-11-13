import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'
import { Media } from '@/components/site/Media'
import type { TripVM } from '@/lib/content'
import { tripHref } from '@/lib/routes'

const M = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const usd = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

export function MonthBar({ months, className = '' }: { months: string[]; className?: string }) {
  return (
    <span className={`flex gap-[3px] ${className}`} role="img" aria-label={`Best months: ${months.map((m) => m.toUpperCase()).join(', ') || 'all year'}`}>
      {M.map((m) => (
        <span key={m} className={`h-1.5 flex-1 rounded-full ${months.includes(m) ? 'bg-current' : 'bg-current/20'}`} />
      ))}
    </span>
  )
}

export function JourneyCard({ trip, ctaPrefix }: { trip: TripVM; ctaPrefix: string }) {
  const href = tripHref(trip)
  return (
    <article className="group relative flex h-full flex-col">
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden rounded-2xl" aria-label={trip.title}>
        <div className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105">
          <Media media={trip.heroImage} fallback={trip.type === 'coastal' ? 'coast' : trip.type === 'walking' ? 'dawn' : 'safari'} sizes="(min-width:1024px) 30vw, 80vw" />
        </div>
        <span className="eyebrow absolute left-4 top-4 rounded-full bg-night/75 px-3 py-1.5 text-cream backdrop-blur-sm">
          {trip.days} {trip.days === 1 ? 'day' : 'days'} · {trip.type === 'coastal' ? 'Coast' : trip.type === 'walking' ? 'On foot' : 'Safari'}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 pt-5">
        <h3 className="font-display text-2xl font-medium leading-tight"><Link href={href} className="link-u">{trip.title}</Link></h3>
        <p className="line-clamp-3 opacity-85">{trip.summary}</p>
        <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-current/25 pt-4 text-sm">
          <div>
            <dt className="eyebrow opacity-75">From</dt>
            <dd className="mt-1 font-display text-xl">{trip.priceFrom ? usd(trip.priceFrom) : 'On request'}</dd>
          </div>
          <div>
            <dt className="eyebrow opacity-75">Best months</dt>
            <dd className="mt-3"><MonthBar months={trip.bestMonths} /></dd>
          </div>
        </dl>
        <Link href={`/plan-your-trip?trip=${trip.slug}`} className="tone-accent inline-flex items-center gap-2 font-semibold" data-cta={`${ctaPrefix}-plan-${trip.slug}`}>
          Plan this journey <Icon name="arrow-right" size={18} />
        </Link>
      </div>
    </article>
  )
}
