import type { Payload } from 'payload'
import { env } from '@/lib/env'
import { sendEmail, threadReplyTo } from '@/lib/email'
import type { EnquiryInput } from '@/lib/forms/schemas'
import { token } from '@/lib/ids'
import { normalizeSource, pickAgent, splitName } from './source'
import { notifyTeam } from './notify'
import { getSettings } from './settings'

const CLOSED = ['travelled', 'review_requested', 'lost']

export async function chooseAgent(payload: Payload, preferred?: number | string | null) {
  if (preferred) {
    const u = await payload.findByID({ collection: 'users', id: preferred, depth: 0, overrideAccess: true }).catch(() => null)
    if (u && u.active !== false) return u.id
  }
  const { docs: agents } = await payload.find({
    collection: 'users', where: { and: [{ takesNewLeads: { equals: true } }, { active: { not_equals: false } }, { roles: { in: ['sales', 'admin'] } }] },
    limit: 50, depth: 0, overrideAccess: true,
  })
  if (!agents.length) return undefined
  const counts = new Map<number, number>()
  await Promise.all(
    agents.map(async (a) => {
      const { totalDocs } = await payload.count({ collection: 'leads', where: { and: [{ assignedTo: { equals: a.id } }, { status: { not_in: CLOSED } }] }, overrideAccess: true })
      counts.set(a.id, totalDocs)
    }),
  )
  return pickAgent(agents, counts)?.id
}

/** Find a contact by email, or create one. Never overwrites data with blanks. */
export async function upsertContact(payload: Payload, input: { name: string; email?: string; phone?: string; country?: string; consentMarketing?: boolean; source?: any }) {
  const email = input.email?.trim().toLowerCase()
  const { firstName, lastName } = splitName(input.name)
  if (email) {
    const { docs } = await payload.find({ collection: 'contacts', where: { email: { equals: email } }, limit: 1, depth: 0, overrideAccess: true })
    const found = docs[0]
    if (found) {
      const patch: Record<string, unknown> = {}
      if (!found.phone && input.phone) patch.phone = input.phone
      if (!found.country && input.country) patch.country = input.country
      if (input.consentMarketing && !found.marketingConsent) patch.marketingConsent = true
      if (Object.keys(patch).length) return payload.update({ collection: 'contacts', id: found.id, data: patch, overrideAccess: true })
      return found
    }
  }
  return payload.create({
    collection: 'contacts', overrideAccess: true,
    data: { firstName, lastName, email, phone: input.phone || undefined, country: input.country || undefined, marketingConsent: Boolean(input.consentMarketing), source: input.source },
  })
}

/**
 * Every website CTA ends here: contact + lead (with source), an inbox
 * conversation holding the message, an acknowledgement email to the guest,
 * and a notification to the assigned agent (via the lead hook).
 */
export async function captureEnquiry(payload: Payload, input: EnquiryInput) {
  const source = normalizeSource(input.source ?? {}, env.SITE_URL)
  const contact = await upsertContact(payload, { ...input, phone: input.phone || undefined, country: input.country || undefined, source })
  const assignedTo = await chooseAgent(payload, typeof contact.owner === 'object' ? contact.owner?.id : contact.owner)
  if (assignedTo && !contact.owner) await payload.update({ collection: 'contacts', id: contact.id, data: { owner: assignedTo }, overrideAccess: true })

  let tripIds: number[] = []
  let tripTitle: string | undefined
  if (input.tripSlug) {
    const { docs } = await payload.find({ collection: 'trips', where: { slug: { equals: input.tripSlug } }, limit: 1, depth: 0, overrideAccess: true })
    if (docs[0]) {
      tripIds = [docs[0].id]
      tripTitle = docs[0].title
    }
  }
  const title = `${contact.fullName || contact.firstName}: ${tripTitle ?? (input.interests?.length ? input.interests.join(', ') : source.channel === 'plan' ? 'trip plan' : 'enquiry')}`
  const lead = await payload.create({
    collection: 'leads', overrideAccess: true,
    data: {
      title: title.slice(0, 200), contact: contact.id, status: 'new', assignedTo, trips: tripIds, interests: input.interests,
      travelStart: input.travelStart, travelEnd: input.travelEnd, datesFlexible: input.datesFlexible,
      adults: input.adults, children: input.children, budget: input.budget, message: input.message || undefined,
      extra: input.extra, source,
    },
  })

  const threadKey = token(9)
  const conversation = await payload.create({
    collection: 'conversations', overrideAccess: true,
    data: { subject: tripTitle ? `Enquiry: ${tripTitle}` : 'Website enquiry', contact: contact.id, lead: lead.id, channel: 'email', status: 'open', assignedTo, threadKey, source },
  })
  await payload.create({
    collection: 'messages', overrideAccess: true,
    data: {
      conversation: conversation.id, direction: 'in', channel: 'email', fromName: contact.fullName, fromEmail: contact.email,
      body: enquirySummary(input, tripTitle),
    },
  })

  const settings = await getSettings({ payload })
  const ack = await sendEmail({
    to: contact.email!,
    subject: 'We have your enquiry · Ngina Trails and Safaris',
    replyTo: threadReplyTo(threadKey),
    tag: 'enquiry-ack',
    content: {
      preheader: 'Thank you. A member of our Diani team will reply personally.',
      heading: `Thank you, ${contact.firstName}`,
      paragraphs: [
        `We have received your enquiry${tripTitle ? ` about ${tripTitle}` : ''}. A member of our team in Diani Beach will reply personally, usually within ${settings.responseTime || '24 hours'}.`,
        'You can reply to this email to add anything else: dates, who is travelling, or questions.',
      ],
      facts: [
        ...(input.travelStart ? ([['Dates', `${input.travelStart}${input.travelEnd ? ` to ${input.travelEnd}` : ''}${input.datesFlexible ? ' (flexible)' : ''}`]] as [string, string][]) : []),
        ...(input.adults != null ? ([['Travellers', `${input.adults} adult(s)${input.children ? `, ${input.children} child(ren)` : ''}`]] as [string, string][]) : []),
      ],
      footerNote: 'You are receiving this because you contacted us through our website.',
    },
  })
  await payload.create({
    collection: 'activities', overrideAccess: true,
    data: { type: 'email_out', summary: `Acknowledgement email ${ack.status}`, contact: contact.id, lead: lead.id },
  })
  if (!assignedTo) {
    await notifyTeam({ payload } as never, `New unassigned lead: ${title}`, [input.message || 'No message.'], `${env.SITE_URL}/admin/collections/leads/${lead.id}`).catch(() => undefined)
  }
  return { contactId: contact.id, leadId: lead.id, conversationId: conversation.id }
}

function enquirySummary(i: EnquiryInput, tripTitle?: string): string {
  const lines = [
    i.message || '(no message)',
    '',
    tripTitle && `Journey: ${tripTitle}`,
    i.interests?.length && `Interests: ${i.interests.join(', ')}`,
    i.travelStart && `Dates: ${i.travelStart}${i.travelEnd ? ` to ${i.travelEnd}` : ''}${i.datesFlexible ? ' (flexible)' : ''}`,
    i.adults != null && `Travellers: ${i.adults} adults, ${i.children ?? 0} children`,
    i.budget && `Budget: ${i.budget}`,
    i.phone && `Phone: ${i.phone}`,
    i.country && `Country: ${i.country}`,
    ...Object.entries(i.extra ?? {}).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`),
  ]
  return lines.filter((l) => l !== false && l !== undefined && l !== '').join('\n').trim()
}
