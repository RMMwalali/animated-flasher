import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'
import { bookingReference, token } from '@/lib/ids'
import { roundMoney, type Currency } from '@/lib/pricing'
import { advanceLeadStatus, type LeadStatus } from '@/lib/crm/stages'
import { scheduleReviewRequest } from '@/lib/crm/reviews'

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | undefined))

const before: CollectionBeforeChangeHook = ({ data, operation, originalDoc }) => {
  if (operation === 'create') data.reference ??= bookingReference()
  // private link to the guest's "My trip" page
  if (!data.portalToken && !originalDoc?.portalToken) data.portalToken = token()
  const total = data.total ?? originalDoc?.total ?? 0
  const paid = data.amountPaid ?? originalDoc?.amountPaid ?? 0
  data.balanceDue = roundMoney(Math.max(0, total - paid), (data.currency ?? 'USD') as Currency)
  return data
}

const LEAD_FOR_STATUS: Partial<Record<string, LeadStatus>> = {
  deposit_paid: 'deposit_paid',
  paid: 'confirmed',
  travelling: 'confirmed',
  completed: 'travelled',
}

const after: CollectionAfterChangeHook = async ({ doc, previousDoc, req, operation }) => {
  if (operation === 'update' && previousDoc?.status !== doc.status) {
    await req.payload.create({
      collection: 'activities', req, overrideAccess: true,
      data: { type: 'booking', summary: `Booking ${doc.reference}: ${String(doc.status).replace('_', ' ')}`, contact: idOf(doc.contact), lead: idOf(doc.lead), by: req.user?.id },
    })
    const target = LEAD_FOR_STATUS[doc.status]
    const leadId = idOf(doc.lead)
    if (target && leadId) {
      const lead = await req.payload.findByID({ collection: 'leads', id: leadId, depth: 0, req, overrideAccess: true })
      const next = advanceLeadStatus(lead.status as LeadStatus, target, { evidence: 'payment' })
      if (next !== lead.status) await req.payload.update({ collection: 'leads', id: leadId, data: { status: next }, req, overrideAccess: true })
    }
    if (doc.status === 'completed') await scheduleReviewRequest(req, doc)
  }
  return doc
}

export const onBookingChange = { before, after }
