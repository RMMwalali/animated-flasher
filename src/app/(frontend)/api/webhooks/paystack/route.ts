import type { NextRequest } from 'next/server'
import { localReq } from '@/lib/booking/flows'
import { json } from '@/lib/booking/http'
import { getPayloadSafe } from '@/lib/content'
import { paymentProvider } from '@/lib/payments/provider'
import { verifyAndRecord } from '@/lib/payments/service'

export const dynamic = 'force-dynamic'

/**
 * Paystack webhook (set in Paystack → Settings → API Keys & Webhooks).
 * The signature is checked, then the payment is re-verified with Paystack's
 * API before anything is recorded: the webhook body itself is never trusted.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text()
  const provider = paymentProvider()
  if (!(await provider.configured())) return json({ ok: false }, 503)
  if (!(await provider.verifyWebhookSignature(raw, req.headers.get('x-paystack-signature')))) return json({ ok: false }, 401)
  let event: { event?: string; data?: { reference?: string } }
  try {
    event = JSON.parse(raw)
  } catch {
    return json({ ok: false }, 400)
  }
  const reference = event.data?.reference
  if (event.event !== 'charge.success' || !reference) return json({ ok: true, ignored: true })
  const payload = await getPayloadSafe()
  if (!payload) return json({ ok: false }, 503)
  try {
    const r = await verifyAndRecord(await localReq(payload), reference)
    return json({ ok: true, known: Boolean(r) })
  } catch (e) {
    payload.logger.error(`paystack webhook ${reference}: ${(e as Error).message}`)
    // a 5xx makes Paystack retry later
    return json({ ok: false }, 500)
  }
}
