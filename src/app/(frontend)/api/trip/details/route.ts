import type { NextRequest } from 'next/server'
import { saveTravellerDetails } from '@/lib/booking/details'
import { guestEndpoint, str } from '@/lib/booking/http'

export const dynamic = 'force-dynamic'

/** Guest saves traveller details and flights on their trip page: { token, ...details } → { missing } */
export function POST(req: NextRequest) {
  return guestEndpoint(req, 'trip-details', 20, async (payload, body) => {
    const { token, ...details } = body
    return saveTravellerDetails(payload, str(token, 100), details)
  })
}
