import type { NextRequest } from 'next/server'
import { GuestError, acceptQuote } from '@/lib/booking/flows'
import { guestEndpoint, str } from '@/lib/booking/http'

export const dynamic = 'force-dynamic'

/** Guest accepts a quote: { token, name, agree }. */
export function POST(req: NextRequest) {
  return guestEndpoint(req, 'quote-accept', 20, async (payload, body) => {
    if (body.agree !== true) throw new GuestError('Please confirm you agree to the booking terms.')
    return acceptQuote(payload, str(body.token, 100), str(body.name, 200))
  })
}
