import type { PayloadRequest } from 'payload'
import { env } from '@/lib/env'
import { sendEmail } from '@/lib/email'
import { getSettings } from './settings'

/** Email the agent a lead was assigned to (respecting their preference). */
export async function notifyAgentOfLead(req: PayloadRequest, leadId: number | string, userId: number | string) {
  const user = await req.payload.findByID({ collection: 'users', id: userId, depth: 0, req, overrideAccess: true })
  if (!user?.email || user.notify?.newLeads === false || user.active === false) return
  const lead = await req.payload.findByID({ collection: 'leads', id: leadId, depth: 1, req, overrideAccess: true })
  const contact = lead.contact as any
  await sendEmail({
    to: user.email,
    subject: `New lead for you: ${lead.title}`,
    tag: 'agent-notification',
    content: {
      heading: `New lead: ${contact?.fullName ?? 'a guest'}`,
      paragraphs: [lead.message ? `“${String(lead.message).slice(0, 600)}”` : 'No message was left.'],
      facts: [
        ['Email', contact?.email ?? '-'],
        ['Phone', contact?.phone ?? '-'],
        ['Came from', [lead.source?.channel, lead.source?.page, lead.source?.ctaId].filter(Boolean).join(' · ') || '-'],
        ['Campaign', [lead.source?.utmSource, lead.source?.utmCampaign].filter(Boolean).join(' / ') || '-'],
      ],
      button: { label: 'Open lead', href: `${env.SITE_URL}/admin/collections/leads/${lead.id}` },
    },
  })
}

/** Email the team inbox address(es) from settings, if any. */
export async function notifyTeam(req: PayloadRequest, subject: string, paragraphs: string[], href?: string) {
  const s = await getSettings(req)
  const to = (s.notifications?.teamEmails ?? '').split(/[,\s]+/).filter(Boolean)
  for (const addr of to) {
    await sendEmail({ to: addr, subject, tag: 'team-notification', content: { heading: subject, paragraphs, button: href ? { label: 'Open', href } : undefined } })
  }
}
