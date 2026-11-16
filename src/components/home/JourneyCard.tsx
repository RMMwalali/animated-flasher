import { PhotoCard } from '@/components/page/PhotoCard'
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

/** A journey: photo, title and length/price; the summary appears on hover. */
export function JourneyCard({ trip, ctaPrefix }: { trip: TripVM; ctaPrefix: string }) {
  const kind = trip.type === 'coastal' ? 'Coast' : trip.type === 'walking' ? 'On foot' : 'Safari'
  return (
    <PhotoCard
      href={tripHref(trip)}
      image={trip.heroImage}
      fallback={trip.type === 'coastal' ? 'coast' : trip.type === 'walking' ? 'dawn' : 'safari'}
      title={trip.title}
      meta={<>{kind} · {trip.days} {trip.days === 1 ? 'day' : 'days'}{trip.priceFrom ? <> · from {usd(trip.priceFrom)}</> : null}</>}
      summary={trip.summary}
      cta="View journey"
      ctaId={`${ctaPrefix}-${trip.slug}`}
    />
  )
}
