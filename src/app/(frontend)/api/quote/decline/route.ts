import type { NextRequest } from 'next/server'
import { declineQuote } from '@/lib/booking/flows'
import { guestEndpoint, str } from '@/lib/booking/http'

export const dynamic = 'force-dynamic'

/** Guest declines a quote: { token, reason }. */
export function POST(req: NextRequest) {
  return guestEndpoint(req, 'quote-decline', 20, async (payload, body) => {
    await declineQuote(payload, str(body.token, 100), str(body.reason, 1000))
    return {}
  })
}
