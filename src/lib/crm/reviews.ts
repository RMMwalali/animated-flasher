import type { PayloadRequest } from 'payload'
import { env } from '@/lib/env'
import { sendEmail } from '@/lib/email'
import { token } from '@/lib/ids'
import { advanceLeadStatus, type LeadStatus } from './stages'
import { getSettings } from './settings'

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | undefined))

/**
 * Every completed booking gets exactly one review request (plus one reminder).
 * Nobody is filtered out and nothing is offered in return: that keeps us within
 * Google, TripAdvisor and SafariBookings review policies.
 */
export async function scheduleReviewRequest(req: PayloadRequest, booking: any) {
  const existing = await req.payload.count({ collection: 'review-requests', where: { booking: { equals: booking.id } }, req, overrideAccess: true })
  if (existing.totalDocs > 0) return
  const contact = await req.payload.findByID({ collection: 'contacts', id: idOf(booking.contact)!, depth: 0, req, overrideAccess: true })
  const settings = await getSettings(req)
  const delay = settings.reviews?.delayDays ?? 2
  const base = new Date(booking.endDate ?? Date.now())
  base.setUTCDate(base.getUTCDate() + delay)
  await req.payload.create({
    collection: 'review-requests', req, overrideAccess: true,
    data: {
      label: `${booking.reference} · ${contact.fullName ?? contact.firstName}`,
      booking: booking.id, contact: contact.id, token: token(),
      status: contact.doNotContact || !contact.email ? 'opted_out' : 'scheduled',
      sendAfter: base.toISOString(),
    },
  })
  await req.payload.update({ collection: 'bookings', id: booking.id, data: { reviewRequested: true }, req, overrideAccess: true })
}

/** Send due requests and reminders. Called by the daily cron route. */
export async function processReviewRequests(req: PayloadRequest): Promise<{ sent: number; reminded: number }> {
  const settings = await getSettings(req)
  const platforms = (settings.reviews?.platforms ?? []).filter((p: any) => p.enabled && p.url)
  if (!platforms.length) return { sent: 0, reminded: 0 }
  const now = new Date()
  const reminderDays = settings.reviews?.reminderDays ?? 7
  let sent = 0
  let reminded = 0

  const due = await req.payload.find({
    collection: 'review-requests', where: { and: [{ status: { equals: 'scheduled' } }, { sendAfter: { less_than_equal: now.toISOString() } }] },
    limit: 50, depth: 1, req, overrideAccess: true,
  })
  for (const r of due.docs) {
    if (await sendReviewEmail(req, r, false)) sent++
  }

  const cutoff = new Date(now.getTime() - reminderDays * 864e5).toISOString()
  const remind = await req.payload.find({
    collection: 'review-requests', where: { and: [{ status: { equals: 'sent' } }, { sentAt: { less_than_equal: cutoff } }] },
    limit: 50, depth: 1, req, overrideAccess: true,
  })
  for (const r of remind.docs) {
    if (await sendReviewEmail(req, r, true)) reminded++
  }
  return { sent, reminded }
}

async function sendReviewEmail(req: PayloadRequest, r: any, reminder: boolean): Promise<boolean> {
  const contact = r.contact
  if (!contact?.email || contact.doNotContact) {
    await req.payload.update({ collection: 'review-requests', id: r.id, data: { status: 'opted_out' }, req, overrideAccess: true })
    return false
  }
  const link = `${env.SITE_URL}/review/${r.token}`
  const res = await sendEmail({
    to: contact.email,
    subject: reminder ? 'A gentle reminder: how was your trip?' : 'How was your trip with Ngina?',
    tag: 'review-request',
    content: {
      heading: reminder ? `Just a reminder, ${contact.firstName}` : `Asante sana, ${contact.firstName}`,
      paragraphs: [
        'Thank you for travelling with Ngina Trails & Safaris. We would really value an honest review of your trip, good or bad: it helps other travellers and helps us improve.',
        'It takes about two minutes. Choose where you would like to post it:',
      ],
      button: { label: 'Write a review', href: link },
      footerNote: reminder
        ? 'This is the only reminder we will send.'
        : `Prefer not to? Reply "no thanks" or open ${link}?optout=1 and we won't ask again.`,
    },
  })
  const ok = res.status !== 'failed'
  await req.payload.update({
    collection: 'review-requests', id: r.id, req, overrideAccess: true,
    data: ok ? (reminder ? { status: 'reminded', reminderSentAt: new Date().toISOString() } : { status: 'sent', sentAt: new Date().toISOString() }) : { status: 'failed' },
  })
  if (ok && !reminder) {
    const booking = r.booking
    const leadId = idOf(booking?.lead)
    if (leadId) {
      const lead = await req.payload.findByID({ collection: 'leads', id: leadId, depth: 0, req, overrideAccess: true })
      const next = advanceLeadStatus(lead.status as LeadStatus, 'review_requested')
      if (next !== lead.status) await req.payload.update({ collection: 'leads', id: leadId, data: { status: next }, req, overrideAccess: true })
    }
    await req.payload.create({ collection: 'activities', req, overrideAccess: true, data: { type: 'review', summary: 'Review request sent', contact: contact.id, lead: leadId } })
  }
  return ok
}
