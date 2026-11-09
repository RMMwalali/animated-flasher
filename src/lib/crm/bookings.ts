import type { PayloadRequest } from 'payload'
import { advanceLeadStatus, type LeadStatus } from './stages'

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | undefined))

/** When a guest accepts a quote, open a booking awaiting the deposit. */
export async function createBookingFromQuote(req: PayloadRequest, quote: any) {
  const tripId = idOf(quote.trip)
  const trip = tripId ? await req.payload.findByID({ collection: 'trips', id: tripId, depth: 0, req, overrideAccess: true }).catch(() => null) : null
  const start = quote.startDate ?? new Date(Date.now() + 30 * 864e5).toISOString()
  let end: string | undefined
  if (trip?.days) {
    const d = new Date(start)
    d.setUTCDate(d.getUTCDate() + trip.days - 1)
    end = d.toISOString()
  }
  const balanceDueDate = new Date(start)
  balanceDueDate.setUTCDate(balanceDueDate.getUTCDate() - 30)
  const booking = await req.payload.create({
    collection: 'bookings', req, overrideAccess: true,
    data: {
      title: quote.title, contact: idOf(quote.contact)!, lead: idOf(quote.lead), quote: quote.id, trip: tripId,
      startDate: start, endDate: end, pax: (quote.adults ?? 1) + (quote.children ?? 0),
      currency: quote.currency, total: quote.total, depositDue: quote.deposit, status: 'pending_deposit',
      balanceDueDate: balanceDueDate > new Date() ? balanceDueDate.toISOString() : undefined,
    },
  })
  await req.payload.update({ collection: 'quotes', id: quote.id, data: { booking: booking.id }, req, overrideAccess: true, context: { skipQuoteHooks: true } })
  const leadId = idOf(quote.lead)
  if (leadId) {
    const lead = await req.payload.findByID({ collection: 'leads', id: leadId, depth: 0, req, overrideAccess: true })
    const next = advanceLeadStatus(lead.status as LeadStatus, 'quoted')
    if (next !== lead.status) await req.payload.update({ collection: 'leads', id: leadId, data: { status: next }, req, overrideAccess: true })
  }
  return booking
}
