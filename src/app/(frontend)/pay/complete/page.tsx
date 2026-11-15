import type { Metadata } from 'next'
import Link from 'next/link'
import { localReq } from '@/lib/booking/flows'
import { getPayloadSafe } from '@/lib/content'
import { paymentProvider } from '@/lib/payments/provider'
import { verifyAndRecord } from '@/lib/payments/service'
import { formatMoney, type Currency } from '@/lib/pricing'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Payment', robots: { index: false, follow: false } }

type Props = { searchParams: Promise<{ reference?: string; trxref?: string }> }

/** Paystack sends the guest back here; we check the payment with Paystack before saying anything. */
export default async function PayComplete({ searchParams }: Props) {
  const sp = await searchParams
  const reference = (sp.reference || sp.trxref || '').slice(0, 64)
  const payload = await getPayloadSafe()
  let status: 'success' | 'pending' | 'failed' | 'unknown' = 'unknown'
  let amount = ''
  let trip: string | null = null
  if (payload && reference && (await paymentProvider().configured())) {
    try {
      const res = await verifyAndRecord(await localReq(payload), reference)
      status = !res ? 'unknown' : res.status === 'success' ? 'success' : res.status === 'pending' ? 'pending' : 'failed'
      const { docs } = await payload.find({ collection: 'payments', where: { reference: { equals: reference } }, limit: 1, depth: 1, overrideAccess: true })
      const p = docs[0]
      if (p) {
        if (p.status !== 'success' && status === 'success') status = 'failed' // amount mismatch
        amount = formatMoney(p.amount, p.currency as Currency)
        const b = p.booking as any
        if (b?.portalToken) trip = `/trip/${b.portalToken}`
      }
    } catch {
      status = 'pending'
    }
  }
  const copy = {
    success: { title: 'Payment received. Asante!', body: `We have received ${amount}. A receipt is on its way to your email.` },
    pending: { title: 'Your payment is being processed', body: 'This can take a few minutes, for example while M-Pesa confirms. Your trip page updates as soon as it is through, and we email you a receipt.' },
    failed: { title: 'The payment did not go through', body: 'Nothing has been charged that we can see. You can try again from your trip page, or reply to your booking email and we will help.' },
    unknown: { title: 'We could not find this payment', body: 'If you have paid, please reply to your booking email with the reference and we will check it for you.' },
  }[status]
  return (
    <section data-tone="cream" className="min-h-[70svh] pb-24 pt-40">
      <div className="gutter mx-auto max-w-2xl">
        <p className="eyebrow text-teal-ink">Payment{reference ? ` · ${reference}` : ''}</p>
        <h1 className="mt-3 font-display text-5xl font-medium leading-tight" data-pay-status={status}>{copy.title}</h1>
        <p className="mt-5 text-lg">{copy.body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {trip && <Link href={trip} className="btn btn-primary">Back to my trip page</Link>}
          <Link href="/" className="btn btn-ghost">Home</Link>
        </div>
      </div>
    </section>
  )
}
