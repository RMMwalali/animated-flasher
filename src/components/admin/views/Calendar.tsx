import type { AdminViewServerProps, Where } from 'payload'
import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'
import { Page } from '../ui'
import { Shell } from './Shell'

const iso = (d: Date) => d.toISOString().slice(0, 10)

export async function CalendarView(props: AdminViewServerProps) {
  const { req } = props.initPageResult
  const m = typeof props.searchParams?.m === 'string' && /^\d{4}-\d{2}$/.test(props.searchParams.m) ? props.searchParams.m : iso(new Date()).slice(0, 7)
  const [y, mo] = m.split('-').map(Number) as [number, number]
  const first = new Date(Date.UTC(y, mo - 1, 1))
  const last = new Date(Date.UTC(y, mo, 0))
  const range: Where = { and: [{ startDate: { less_than_equal: last.toISOString() } }, { or: [{ endDate: { greater_than_equal: first.toISOString() } }, { startDate: { greater_than_equal: first.toISOString() } }] }] }
  const [bookings, departures] = await Promise.all([
    req.payload.find({ collection: 'bookings', where: { and: [range, { status: { not_equals: 'cancelled' } }] }, limit: 300, depth: 0, req }),
    req.payload.find({ collection: 'departures', where: { and: [range, { status: { not_equals: 'cancelled' } }] }, limit: 300, depth: 1, req }),
  ])
  type Ev = { href: string; label: string; kind: 'booking' | 'departure' }
  const events = new Map<string, Ev[]>()
  const add = (start: string, end: string | null | undefined, ev: Ev) => {
    const s = new Date(start)
    const e = new Date(end ?? start)
    for (let d = new Date(s); d <= e; d.setUTCDate(d.getUTCDate() + 1)) {
      const k = iso(d)
      events.set(k, [...(events.get(k) ?? []), ev])
    }
  }
  for (const b of bookings.docs) add(b.startDate, b.endDate, { href: `/admin/collections/bookings/${b.id}`, label: `${b.reference} · ${b.pax ?? ''} pax`, kind: 'booking' })
  for (const d of departures.docs) add(d.startDate, d.endDate, { href: `/admin/collections/departures/${d.id}`, label: (d.trip as { title?: string })?.title ?? 'Departure', kind: 'departure' })

  const lead = (first.getUTCDay() + 6) % 7 // Monday first
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: last.getUTCDate() }, (_, i) => new Date(Date.UTC(y, mo - 1, i + 1)))]
  const prev = iso(new Date(Date.UTC(y, mo - 2, 1))).slice(0, 7)
  const next = iso(new Date(Date.UTC(y, mo, 1))).slice(0, 7)
  const today = iso(new Date())

  return (
    <Shell props={props} roles={['admin', 'sales']}>
      <Page
        eyebrow="Operations"
        title={first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
        intro="Bookings (teal) and scheduled departures (ochre). Each runs from first to last day."
        actions={
          <div className="ng-cal-nav">
            <Link href={`/admin/calendar?m=${prev}`} aria-label="Previous month"><Icon name="arrow-left" /></Link>
            <Link href="/admin/calendar">Today</Link>
            <Link href={`/admin/calendar?m=${next}`} aria-label="Next month"><Icon name="arrow-right" /></Link>
          </div>
        }
      >
        <div className="ng-cal" role="grid">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d} className="ng-cal__dow" role="columnheader">{d}</div>)}
          {cells.map((c, i) => (
            <div key={i} className={`ng-cal__cell${c && iso(c) === today ? ' is-today' : ''}`} role="gridcell">
              {c && (
                <>
                  <span className="ng-cal__day">{c.getUTCDate()}</span>
                  <ul>
                    {(events.get(iso(c)) ?? []).slice(0, 4).map((e, j) => (
                      <li key={j}><Link href={e.href} className={`ng-cal__ev ng-cal__ev--${e.kind}`}>{e.label}</Link></li>
                    ))}
                    {(events.get(iso(c))?.length ?? 0) > 4 && <li className="ng-cal__more">+{events.get(iso(c))!.length - 4} more</li>}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </Page>
    </Shell>
  )
}
