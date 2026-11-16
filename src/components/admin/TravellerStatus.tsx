'use client'
import { useEffect, useState } from 'react'
import { travellerGaps, type TravellerLike } from '@/lib/booking/rules'
import { useFieldValue } from './BookingTools'

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number))

/** On a booking: how complete the traveller details are, and what is missing. */
export function TravellerStatus() {
  const ids = (useFieldValue<unknown[]>('travellers') ?? []).map(idOf).filter(Boolean)
  const pax = useFieldValue<number>('pax')
  const arrivalFlight = useFieldValue<string>('arrivalFlight')
  const pickup = useFieldValue<string>('pickup')
  const [travellers, setTravellers] = useState<TravellerLike[]>([])
  const key = ids.join(',')
  useEffect(() => {
    if (!key) {
      const raf = requestAnimationFrame(() => setTravellers([]))
      return () => cancelAnimationFrame(raf)
    }
    const ctrl = new AbortController()
    fetch(`/api/travellers?where[id][in]=${key}&depth=0&limit=50`, { credentials: 'include', signal: ctrl.signal })
      .then((r) => r.json())
      .then((r) => setTravellers(r.docs ?? []))
      .catch(() => undefined)
    return () => ctrl.abort()
  }, [key])
  const g = travellerGaps({ pax, arrivalFlight, pickup }, travellers)
  const done = g.missing.length === 0
  return (
    <div className="ng-traveller-status" style={{ margin: '0 0 1rem', padding: '0.75rem 1rem', borderRadius: 8, background: done ? 'var(--theme-success-100, #e6f4ea)' : 'var(--theme-warning-100, #fdf3e1)' }}>
      <strong>{done ? 'All traveller details are in.' : `Traveller details: ${g.added} of ${g.expected} travellers added`}</strong>
      {!done && <p style={{ margin: '0.25rem 0 0' }}>Still missing: {g.missing.join('; ')}.</p>}
    </div>
  )
}
