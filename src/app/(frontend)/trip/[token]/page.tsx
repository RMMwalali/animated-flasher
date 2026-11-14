import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PayButton } from '@/components/booking/PayButton'
import { PrintButton } from '@/components/booking/PrintButton'
import { Icon } from '@/components/icons/Icon'
import { Media } from '@/components/site/Media'
import { findBookingByToken } from '@/lib/booking/flows'
import { daysUntil, nextPayment } from '@/lib/booking/rules'
import { getPayloadSafe, getSettings, media } from '@/lib/content'
import { features } from '@/lib/env'
import { formatMoney, type Currency } from '@/lib/pricing'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'My trip', robots: { index: false, follow: false } }

type Props = { params: Promise<{ token: string }> }
const longDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi' }) : null)

const STEPS = [
  { key: 'pending_deposit', label: 'Booked' },
  { key: 'deposit_paid', label: 'Deposit paid' },
  { key: 'paid', label: 'Paid in full' },
  { key: 'travelling', label: 'On your trip' },
  { key: 'completed', label: 'Home again' },
]

/** The guest's private trip page: plan, payments, balance, checklist. */
export default async function TripPage({ params }: Props) {
  const { token } = await params
  const payload = await getPayloadSafe()
  if (!payload) notFound()
  const b = await findBookingByToken(payload, token)
  if (!b) notFound()
  const settings = await getSettings()
  const { docs: payments } = await payload.find({ collection: 'payments', where: { and: [{ booking: { equals: b.id } }, { status: { equals: 'success' } }] }, sort: 'paidAt', limit: 100, depth: 0, overrideAccess: true })
  const currency = b.currency as Currency
  const contact = b.contact as any
  const trip = b.trip as any
  const quote = b.quote && typeof b.quote === 'object' ? (b.quote as any) : null
  const next = nextPayment({ status: b.status, depositDue: b.depositDue, amountPaid: b.amountPaid, total: b.total })
  const depositLeft = Math.max(0, (b.depositDue ?? 0) - (b.amountPaid ?? 0))
  const cancelled = b.status === 'cancelled'
  const stepIndex = STEPS.findIndex((s) => s.key === b.status)
  const toGo = daysUntil(b.startDate)
  const flyIn = /fly|flight|air/i.test(`${b.title} ${trip?.title ?? ''}`)

  return (
    <>
      <section data-tone="night" className="relative isolate flex min-h-[48svh] items-end overflow-hidden pb-12 pt-40 text-cream print:min-h-0 print:pt-0 print:text-deep">
        <div className="absolute inset-0 -z-10 print:hidden">
          <Media media={media(trip?.heroImage)} fallback={trip?.type === 'coastal' ? 'coast' : 'safari'} priority />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/20" />
        </div>
        <div className="gutter w-full">
          <p className="eyebrow text-ochre print:text-deep">My trip · {b.reference}</p>
          <h1 className="mt-3 max-w-[22ch] font-display text-5xl font-medium leading-[1.02] sm:text-6xl">{b.title}</h1>
          <p className="mt-4 text-lg opacity-90">
            {longDate(b.startDate)}{b.endDate ? ` – ${longDate(b.endDate)}` : ''} · {b.pax} traveller{b.pax === 1 ? '' : 's'}
            {!cancelled && toGo > 0 && <> · <strong>{toGo} day{toGo === 1 ? '' : 's'} to go</strong></>}
          </p>
        </div>
      </section>

      <section data-tone="cream" className="py-12 sm:py-16">
        <div className="gutter mx-auto max-w-6xl">
          <p className="text-lg">Jambo {contact?.firstName ?? ''}! Everything about your trip is on this page. Keep the link private: anyone with it can see your booking.</p>
          {cancelled ? (
            <p role="status" className="mt-8 rounded-2xl bg-ochre/20 px-5 py-4 font-semibold">This booking has been cancelled. Questions? Contact us below.</p>
          ) : (
            <ol className="mt-10 grid grid-cols-5 gap-2" aria-label="Booking progress">
              {STEPS.map((s, i) => (
                <li key={s.key} aria-current={i === stepIndex ? 'step' : undefined} className="grid gap-2">
                  <span className={`h-1.5 rounded-full ${i <= stepIndex ? 'bg-teal' : 'bg-deep/15'}`} />
                  <span className={`text-xs sm:text-sm ${i === stepIndex ? 'font-semibold' : 'opacity-75'}`}>{s.label}</span>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="min-w-0">
              {(quote?.days?.length ?? 0) > 0 && (
                <section aria-labelledby="plan-title">
                  <h2 id="plan-title" className="font-display text-4xl font-medium">Your plan</h2>
                  <ol className="mt-6 border-t border-line">
                    {quote.days.map((d: any, i: number) => (
                      <li key={d.id ?? i} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[6rem_1fr] print:break-inside-avoid">
                        <p className="eyebrow text-orange-600">Day {i + 1}</p>
                        <div>
                          <h3 className="font-display text-2xl">{d.title}</h3>
                          {d.description && <p className="mt-1 leading-relaxed">{d.description}</p>}
                          {d.overnight && <p className="mt-1 text-sm text-deep/80"><span className="font-semibold">Overnight:</span> {d.overnight}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                  {quote.acceptToken && <p className="mt-4 text-sm"><Link href={`/quote/${quote.acceptToken}`} className="underline underline-offset-4">See the full quote, with what is included</Link></p>}
                </section>
              )}

              <section className="mt-14" aria-labelledby="check-title">
                <h2 id="check-title" className="font-display text-4xl font-medium">Before you fly</h2>
                <ul className="mt-6 grid gap-4">
                  {[
                    { icon: 'globe', title: 'Kenya eTA for every traveller', body: <>Apply on the official website, etakenya.go.ke, ideally at least 2 weeks before you fly. Children need their own. <Link href="/kenya-eta" className="underline underline-offset-4">Our eTA guide</Link></> },
                    { icon: 'card', title: 'Passport valid for 6 months', body: 'From your arrival date, with at least one blank page.' },
                    { icon: 'shield', title: 'Travel insurance', body: 'We recommend cover that includes medical evacuation.' },
                    { icon: 'leaf', title: 'Health', body: 'Ask a travel clinic about vaccinations and malaria prevention, ideally 6–8 weeks before travel.' },
                    { icon: 'footprints', title: 'Packing', body: <>Layers in neutral colours, a hat and binoculars. {flyIn && 'Small planes usually allow about 15 kg per person in soft bags. '}<Link href="/blog/what-to-pack-kenya-safari" className="underline underline-offset-4">Our packing guide</Link></> },
                  ].map((c) => (
                    <li key={c.title} className="grid grid-cols-[auto_1fr] gap-4 rounded-2xl bg-paper p-5">
                      <Icon name={c.icon as any} size={22} className="mt-1 text-teal" />
                      <div><p className="font-semibold">{c.title}</p><p className="mt-1 text-[0.97rem] leading-relaxed">{c.body}</p></div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <aside className="grid content-start gap-6 lg:sticky lg:top-28 lg:self-start" aria-label="Payments">
              <div id="pay" className="scroll-mt-28 rounded-3xl border border-line bg-paper p-6">
                <h2 className="font-display text-2xl">Payments</h2>
                <dl className="mt-4 grid gap-2 text-[0.97rem]">
                  <div className="flex justify-between"><dt>Total</dt><dd className="font-semibold">{formatMoney(b.total, currency)}</dd></div>
                  <div className="flex justify-between"><dt>Paid</dt><dd>{formatMoney(b.amountPaid ?? 0, currency)}</dd></div>
                  <div className="flex justify-between border-t border-line pt-2 font-display text-xl"><dt>Balance</dt><dd>{formatMoney(b.balanceDue ?? b.total, currency)}</dd></div>
                  {b.balanceDueDate && (b.balanceDue ?? 0) > 0 && <p className="text-sm text-deep/80">Balance due by {longDate(b.balanceDueDate)}</p>}
                </dl>
                {next && !cancelled && (
                  <div className="mt-6 grid gap-3" data-no-print>
                    {!features.payments ? (
                      <p className="rounded-xl bg-cream px-4 py-3 text-sm">Online payment is not switched on yet. We will email you payment details (M-Pesa, card or bank transfer).</p>
                    ) : next === 'deposit' ? (
                      <>
                        <PayButton token={token} kind="deposit" label={`Pay deposit ${formatMoney(depositLeft, currency)}`} />
                        <PayButton token={token} kind="balance" primary={false} label={`Pay in full ${formatMoney(b.balanceDue ?? b.total, currency)}`} />
                      </>
                    ) : (
                      <PayButton token={token} kind="balance" label={`Pay balance ${formatMoney(b.balanceDue ?? 0, currency)}`} />
                    )}
                    {features.payments && <p className="text-xs leading-relaxed text-deep/75">Secure payment by Paystack. {currency === 'KES' ? 'M-Pesa or card.' : 'Card in US$. For M-Pesa in KES, reply to your booking email and we will send an M-Pesa link.'} We never see your card details.</p>}
                  </div>
                )}
                {payments.length > 0 && (
                  <ul className="mt-6 grid gap-2 border-t border-line pt-4 text-sm">
                    {payments.map((p) => (
                      <li key={p.id} className="flex justify-between gap-3">
                        <span>{longDate(p.paidAt ?? p.createdAt)} · {p.kind}{p.receiptNumber ? ` · ${p.receiptNumber}` : ''}</span>
                        <span className="font-semibold">{formatMoney(p.amount, p.currency as Currency)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-3xl bg-paper p-6">
                <h2 className="font-display text-2xl">Questions?</h2>
                <ul className="mt-3 grid gap-2 text-[0.97rem]">
                  {settings.whatsapp && <li><a className="underline underline-offset-4" href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Booking ${b.reference}: `)}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a></li>}
                  {settings.email && <li><a className="underline underline-offset-4" href={`mailto:${settings.email}?subject=${encodeURIComponent(`Booking ${b.reference}`)}`}>{settings.email}</a></li>}
                  {settings.phone && <li><a className="underline underline-offset-4" href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a></li>}
                </ul>
                {!settings.whatsapp && !settings.email && !settings.phone && <p className="mt-3">Reply to any email from us and it reaches your planner.</p>}
                <p className="mt-3 text-sm text-deep/80">Quote your booking reference, {b.reference}.</p>
              </div>
              <PrintButton label="Print or save this page" />
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
