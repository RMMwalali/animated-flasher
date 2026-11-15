import type { NextRequest } from 'next/server'
import { findBookingByToken } from '@/lib/booking/flows'
import { guestEndpoint, str } from '@/lib/booking/http'

export const dynamic = 'force-dynamic'

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | undefined))

/** A guest tapped WhatsApp on their trip page: note it on their timeline (the chat itself happens in WhatsApp). */
export function POST(req: NextRequest) {
  return guestEndpoint(req, 'trip-whatsapp', 20, async (payload, body) => {
    const b = await findBookingByToken(payload, str(body.token, 100), 0)
    if (!b) return {}
    await payload.create({
      collection: 'activities', overrideAccess: true,
      data: { type: 'whatsapp', summary: `Opened WhatsApp from the trip page (${b.reference})`, contact: idOf(b.contact), lead: idOf(b.lead) },
    })
    return {}
  })
}
