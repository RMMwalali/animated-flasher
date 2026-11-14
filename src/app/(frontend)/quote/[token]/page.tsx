import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PrintButton } from '@/components/booking/PrintButton'
import { QuoteDecision } from '@/components/booking/QuoteDecision'
import { Media } from '@/components/site/Media'
import { findQuoteByToken, markQuoteViewed, tripUrl } from '@/lib/booking/flows'
import { quoteState } from '@/lib/booking/rules'
import { getPayloadSafe, media } from '@/lib/content'
import { calcQuote, formatMoney, type Currency } from '@/lib/pricing'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Your trip plan', robots: { index: false, follow: false } }

type Props = { params: Promise<{ token: string }> }
const longDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi' }) : null)
const lines = (s?: string | null) => (s ?? '').split('\n').map((l) => l.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean)
const UNIT: Record<string, string> = { per_person: 'per adult', per_child: 'per child', per_group: 'per group', fixed: '' }

/** The guest's private quote: plan, price, accept or decline. Printable. */
export default async function QuotePage({ params }: Props) {
  const { token } = await params
  const payload = await getPayloadSafe()
  if (!payload) notFound()
  const q = await findQuoteByToken(payload, token)
  if (!q || q.status === 'draft') notFound()
  await markQuoteViewed(payload, q)
  const state = quoteState(q)
  const currency = q.currency as Currency
  const totals = calcQuote(q.items ?? [], { discount: q.discount, depositPercent: q.depositPercent, currency })
  const contact = q.contact as any
  const trip = q.trip as any
  const hero = media(trip?.heroImage)
  const booking = q.booking && typeof q.booking === 'object' ? (q.booking as any) : null
  const travellers = `${q.adults ?? 0} adult${q.adults === 1 ? '' : 's'}${q.children ? `, ${q.children} child${q.children === 1 ? '' : 'ren'}` : ''}`

  return (
    <>
      <section data-tone="night" className="relative isolate flex min-h-[52svh] items-end overflow-hidden pb-12 pt-40 text-cream print:min-h-0 print:pt-0 print:text-deep">
        <div className="absolute inset-0 -z-10 print:hidden">
          <Media media={hero} fallback={trip?.type === 'coastal' ? 'coast' : 'safari'} priority />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/20" />
        </div>
        <div className="gutter w-full">
          <p className="eyebrow text-ochre print:text-deep">Trip plan · {q.number}</p>
          <h1 className="mt-3 max-w-[22ch] font-display text-5xl font-medium leading-[1.02] sm:text-6xl">{q.title}</h1>
          <p className="mt-4 text-lg opacity-90">Prepared for {contact?.fullName ?? contact?.firstName ?? 'you'}</p>
        </div>
      </section>

      <section data-tone="cream" className="py-14 sm:py-20">
        <div className="gutter mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            {state === 'expired' && <p role="status" className="mb-8 rounded-2xl bg-ochre/20 px-5 py-4 font-semibold">This quote expired on {longDate(q.validUntil)}. Reply to our email and we will send you an updated plan.</p>}
            {state === 'declined' && <p role="status" className="mb-8 rounded-2xl bg-paper px-5 py-4 font-semibold">You declined this plan. Changed your mind? Reply to our email.</p>}
            {state === 'accepted' && (
              <p role="status" className="mb-8 rounded-2xl bg-teal/15 px-5 py-4 font-semibold">
                Accepted on {longDate(q.acceptedAt)}. {booking?.portalToken && <a className="underline underline-offset-4" href={new URL(tripUrl(booking.portalToken)).pathname}>Open your trip page</a>}
              </p>
            )}
            <dl className="grid grid-cols-2 gap-6 border-y border-line py-6 sm:grid-cols-4">
              {[['Starting', longDate(q.startDate) ?? 'To be agreed'], ['Travellers', travellers], ['Total', formatMoney(totals.total, currency)], ['Valid until', longDate(q.validUntil) ?? '-']].map(([k, v]) => (
                <div key={k}><dt className="eyebrow text-teal-ink">{k}</dt><dd className="mt-2 font-display text-xl">{v}</dd></div>
              ))}
            </dl>

            {q.notes && <p className="mt-10 whitespace-pre-line text-lg leading-relaxed">{q.notes}</p>}

            {(q.days?.length ?? 0) > 0 && (
              <section className="mt-14" aria-labelledby="days-title">
                <h2 id="days-title" className="font-display text-4xl font-medium">Day by day</h2>
                <ol className="mt-6 border-t border-line">
                  {q.days!.map((d, i) => (
                    <li key={d.id ?? i} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[6rem_1fr] print:break-inside-avoid">
                      <p className="eyebrow text-orange-600">Day {i + 1}</p>
                      <div>
                        <h3 className="font-display text-2xl">{d.title}</h3>
                        {d.description && <p className="mt-2 leading-relaxed">{d.description}</p>}
                        {d.overnight && <p className="mt-2 text-sm text-deep/80"><span className="font-semibold">Overnight:</span> {d.overnight}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {(lines(q.inclusions).length > 0 || lines(q.exclusions).length > 0) && (
              <section className="mt-14 grid gap-10 sm:grid-cols-2 print:break-inside-avoid" aria-label="What is included">
                {lines(q.inclusions).length > 0 && (
                  <div><h2 className="font-display text-3xl font-medium">Included</h2><ul className="mt-4 grid gap-2">{lines(q.inclusions).map((l) => <li key={l} className="flex gap-3"><span aria-hidden="true" className="text-teal">✓</span>{l}</li>)}</ul></div>
                )}
                {lines(q.exclusions).length > 0 && (
                  <div><h2 className="font-display text-3xl font-medium">Not included</h2><ul className="mt-4 grid gap-2">{lines(q.exclusions).map((l) => <li key={l} className="flex gap-3"><span aria-hidden="true" className="opacity-60">–</span>{l}</li>)}</ul></div>
                )}
              </section>
            )}
          </div>

          <aside className="grid content-start gap-6 lg:sticky lg:top-28 lg:self-start" aria-label="Price">
            <div className="rounded-3xl border border-line bg-paper p-6 print:break-inside-avoid">
              <h2 className="font-display text-2xl">Price</h2>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  {(q.items ?? []).map((it, i) => (
                    <tr key={it.id ?? i} className="border-t border-line align-top">
                      <td className="py-3 pr-3">{it.description}<span className="block text-deep/70">{it.quantity ?? 1} × {formatMoney(it.unitPrice, currency)} {UNIT[it.unit ?? ''] ?? ''}</span></td>
                      <td className="py-3 text-right font-semibold">{formatMoney(totals.lines[i], currency)}</td>
                    </tr>
                  ))}
                  {totals.discount > 0 && <tr className="border-t border-line"><td className="py-3">Discount</td><td className="py-3 text-right">−{formatMoney(totals.discount, currency)}</td></tr>}
                  <tr className="border-t-2 border-deep"><td className="py-3 font-display text-xl">Total</td><td className="py-3 text-right font-display text-xl">{formatMoney(totals.total, currency)}</td></tr>
                  <tr><td className="pb-1 text-deep/85">Deposit to confirm ({q.depositPercent ?? 30}%)</td><td className="pb-1 text-right">{formatMoney(totals.deposit, currency)}</td></tr>
                  <tr><td className="text-deep/85">Balance, due 30 days before travel</td><td className="text-right">{formatMoney(totals.balance, currency)}</td></tr>
                </tbody>
              </table>
            </div>
            <PrintButton />
          </aside>
        </div>
        {state === 'open' && (
          <div className="gutter mx-auto mt-14 max-w-6xl">
            <div className="max-w-2xl"><QuoteDecision token={token} depositText={formatMoney(totals.deposit, currency)} guestName={contact?.fullName ?? ''} /></div>
          </div>
        )}
      </section>
    </>
  )
}
