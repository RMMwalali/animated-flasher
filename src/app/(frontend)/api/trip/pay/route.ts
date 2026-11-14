import type { NextRequest } from 'next/server'
import { GuestError, startGuestPayment } from '@/lib/booking/flows'
import { guestEndpoint, str } from '@/lib/booking/http'

export const dynamic = 'force-dynamic'

/** Guest presses Pay on their trip page: { token, kind } → { url } (Paystack checkout). */
export function POST(req: NextRequest) {
  return guestEndpoint(req, 'trip-pay', 30, async (payload, body) => {
    const kind = body.kind === 'deposit' || body.kind === 'balance' ? body.kind : null
    if (!kind) throw new GuestError('Invalid payment type.')
    return startGuestPayment(payload, str(body.token, 100), kind)
  })
}
