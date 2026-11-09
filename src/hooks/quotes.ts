import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'
import { calcQuote, itemsFromTrip, type Currency } from '@/lib/pricing'
import { quoteNumber, token } from '@/lib/ids'
import { createBookingFromQuote } from '@/lib/crm/bookings'
import { advanceLeadStatus, type LeadStatus } from '@/lib/crm/stages'

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | undefined))

const before: CollectionBeforeChangeHook = async ({ data, originalDoc, req, operation }) => {
  if (operation === 'create') {
    data.number ??= quoteNumber()
    data.acceptToken ??= token()
    if (!data.validUntil) {
      const d = new Date()
      d.setDate(d.getDate() + 14)
      data.validUntil = d.toISOString()
    }
  }
  // Build from a journey the first time one is picked.
  const tripId = idOf(data.trip)
  if (tripId && tripId !== idOf(originalDoc?.trip)) {
    const trip = await req.payload.findByID({ collection: 'trips', id: tripId, depth: 0, req, overrideAccess: true, draft: false }).catch(() => null)
    if (trip) {
      if (!data.items?.length) data.items = itemsFromTrip(trip, data.adults ?? 2, data.children ?? 0)
      if (!data.days?.length) data.days = (trip.itinerary ?? []).map((d) => ({ title: d.title, description: d.description, overnight: d.overnight }))
      if (!data.inclusions) data.inclusions = (trip.inclusions ?? []).map((i) => `• ${i.text}`).join('\n')
      if (!data.exclusions) data.exclusions = (trip.exclusions ?? []).map((i) => `• ${i.text}`).join('\n')
      if (!data.title) data.title = trip.title
    }
  }
  const totals = calcQuote(data.items ?? [], { discount: data.discount, depositPercent: data.depositPercent, currency: (data.currency ?? 'USD') as Currency })
  data.subtotal = totals.subtotal
  data.total = totals.total
  data.deposit = totals.deposit
  return data
}

const after: CollectionAfterChangeHook = async ({ doc, previousDoc, req, operation, context }) => {
  if (context?.skipQuoteHooks) return doc
  const leadId = idOf(doc.lead)
  if (operation === 'update' && previousDoc?.status !== doc.status) {
    await req.payload.create({
      collection: 'activities', req, overrideAccess: true,
      data: { type: 'quote', summary: `Quote ${doc.number} ${doc.status}`, contact: idOf(doc.contact), lead: leadId, by: req.user?.id },
    })
    if (doc.status === 'sent' && leadId) {
      const lead = await req.payload.findByID({ collection: 'leads', id: leadId, depth: 0, req, overrideAccess: true })
      const next = advanceLeadStatus(lead.status as LeadStatus, 'quoted')
      if (next !== lead.status) await req.payload.update({ collection: 'leads', id: leadId, data: { status: next }, req, overrideAccess: true })
    }
    if (doc.status === 'accepted' && !doc.booking) await createBookingFromQuote(req, doc)
  }
  return doc
}

export const onQuoteChange = { before, after }
