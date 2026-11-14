import type { NextRequest } from 'next/server'
import { isSales } from '@/access'
import { GuestError, localReq, quoteUrl, requestPayment, sendBookingConfirmation, sendQuoteToGuest, tripUrl } from '@/lib/booking/flows'
import { json, sameOrigin } from '@/lib/booking/http'
import { getPayloadSafe } from '@/lib/content'
import { verifyAndRecord } from '@/lib/payments/service'

export const dynamic = 'force-dynamic'

/**
 * Back-office buttons on Quotes, Bookings and Payments (sales team only):
 * send-quote · quote-link · send-confirmation · request-payment · trip-link · verify-payment
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'Bad origin.' }, 403)
  const payload = await getPayloadSafe()
  if (!payload) return json({ ok: false, error: 'No database connected.' }, 503)
  const { user } = await payload.auth({ headers: req.headers })
  if (!user || !isSales(user as never)) return json({ ok: false, error: 'Sales team only.' }, 403)
  const body = (await req.json().catch(() => ({}))) as { action?: string; id?: number | string; kind?: string; currency?: string; exchangeRate?: number }
  const id = body.id
  if (!id) return json({ ok: false, error: 'Missing record.' }, 400)
  const r = await localReq(payload)
  r.user = user as never
  try {
    switch (body.action) {
      case 'send-quote':
        return json({ ok: true, ...(await sendQuoteToGuest(r, id)) })
      case 'quote-link': {
        const q = await payload.findByID({ collection: 'quotes', id, depth: 0, overrideAccess: true })
        return json({ ok: true, url: q.acceptToken ? quoteUrl(q.acceptToken) : null })
      }
      case 'send-confirmation':
        return json({ ok: true, ...(await sendBookingConfirmation(r, id)) })
      case 'trip-link': {
        const b = await payload.findByID({ collection: 'bookings', id, depth: 0, overrideAccess: true })
        return json({ ok: true, url: b.portalToken ? tripUrl(b.portalToken) : null })
      }
      case 'request-payment': {
        const kind = body.kind === 'balance' ? 'balance' : 'deposit'
        const currency = body.currency === 'KES' || body.currency === 'USD' ? body.currency : undefined
        const rate = Number(body.exchangeRate) > 0 ? Number(body.exchangeRate) : undefined
        return json({ ok: true, ...(await requestPayment(r, id, { kind, currency, exchangeRate: rate })) })
      }
      case 'verify-payment': {
        const p = await payload.findByID({ collection: 'payments', id, depth: 0, overrideAccess: true })
        if (p.provider !== 'paystack' || !p.reference) throw new GuestError('Only Paystack payments can be checked online.')
        const res = await verifyAndRecord(r, p.reference)
        return json({ ok: true, status: res?.status ?? 'unknown' })
      }
      default:
        return json({ ok: false, error: 'Unknown action.' }, 400)
    }
  } catch (e) {
    const msg = (e as Error).message
    if (!(e instanceof GuestError)) payload.logger.error(`admin booking action ${body.action}: ${msg}`)
    return json({ ok: false, error: msg }, e instanceof GuestError ? e.status : 500)
  }
}
