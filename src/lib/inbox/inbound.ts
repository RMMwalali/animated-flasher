/**
 * Incoming email (Postmark inbound webhook): guest replies to our emails,
 * and emails the owner's Gmail forwards. Each lands in the right
 * conversation in the Inbox; nothing is ever sent back automatically.
 */
import type { Payload } from 'payload'
import { env } from '@/lib/env'
import { sendEmail } from '@/lib/email'
import { token } from '@/lib/ids'
import { stripQuoted } from './index'

export type InboundEmail = {
  MessageID?: string
  From?: string
  FromName?: string
  FromFull?: { Email?: string; Name?: string }
  To?: string
  Subject?: string
  TextBody?: string
  HtmlBody?: string
  StrippedTextReply?: string
  MailboxHash?: string
  Headers?: { Name: string; Value: string }[]
  Attachments?: { Name: string; ContentType?: string; ContentLength?: number }[]
}

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | undefined))
const header = (m: InboundEmail, name: string) => m.Headers?.find((h) => h.Name.toLowerCase() === name.toLowerCase())?.Value

/** Plain text of an HTML email, for messages sent without a text part. Pure. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

/** The readable body of an inbound email: the reply only, plus attachment names. Pure: unit-tested. */
export function inboundBody(m: InboundEmail): string {
  const raw = m.StrippedTextReply?.trim() || stripQuoted(m.TextBody || (m.HtmlBody ? htmlToText(m.HtmlBody) : ''))
  const files = (m.Attachments ?? []).map((a) => a.Name).filter(Boolean)
  const note = files.length ? `\n\n[Attachments: ${files.join(', ')}. Open the original email to download them.]` : ''
  return `${raw || '(no text)'}${note}`.slice(0, 20000)
}

export type InboundResult = { status: 'logged' | 'duplicate' | 'ignored'; conversationId?: number; reason?: string }

export async function handleInbound(payload: Payload, m: InboundEmail, opts: { ourAddresses: string[] }): Promise<InboundResult> {
  const fromEmail = (m.FromFull?.Email || m.From || '').trim().toLowerCase()
  const fromName = (m.FromFull?.Name || m.FromName || '').trim()
  if (!fromEmail.includes('@')) return { status: 'ignored', reason: 'no sender' }
  // our own outgoing emails forwarded back (e.g. a notification sent to the owner's Gmail)
  if (opts.ourAddresses.some((a) => a && fromEmail === a.toLowerCase())) return { status: 'ignored', reason: 'our own address' }

  if (m.MessageID) {
    const dupe = await payload.count({ collection: 'messages', where: { emailMessageId: { equals: m.MessageID } }, overrideAccess: true })
    if (dupe.totalDocs) return { status: 'duplicate' }
  }

  // 1) a reply to one of our emails: the conversation key is after the "+" in the address
  let conv = m.MailboxHash
    ? (await payload.find({ collection: 'conversations', where: { threadKey: { equals: m.MailboxHash } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]
    : undefined

  // 2) otherwise find (or create) the guest by email address
  let contactId = idOf(conv?.contact)
  if (!contactId) {
    const found = (await payload.find({ collection: 'contacts', where: { email: { equals: fromEmail } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]
    if (found) contactId = found.id
    else {
      const [first, ...rest] = (fromName || fromEmail.split('@')[0]!).split(/\s+/)
      const created = await payload.create({
        collection: 'contacts', overrideAccess: true, context: { skipLeadHooks: true },
        data: { firstName: first || 'Guest', lastName: rest.join(' ') || undefined, email: fromEmail, source: { channel: 'email' }, tags: ['email'] } as never,
      })
      contactId = created.id
    }
  }
  if (!conv) {
    conv = (await payload.find({ collection: 'conversations', where: { and: [{ contact: { equals: contactId } }, { channel: { equals: 'email' } }] }, sort: '-lastMessageAt', limit: 1, depth: 0, overrideAccess: true })).docs[0]
  }
  if (!conv) {
    const contact = await payload.findByID({ collection: 'contacts', id: contactId!, depth: 0, overrideAccess: true })
    conv = await payload.create({
      collection: 'conversations', overrideAccess: true,
      data: { subject: (m.Subject || 'Email').slice(0, 200), contact: contactId, channel: 'email', status: 'open', threadKey: token(9), assignedTo: idOf(contact.owner), source: { channel: 'email' } } as never,
    })
  }

  const spam = /^yes/i.test(header(m, 'X-Spam-Status') ?? '')
  const auto = (header(m, 'Auto-Submitted') ?? 'no').toLowerCase() !== 'no'
  await payload.create({
    collection: 'messages', overrideAccess: true,
    data: {
      conversation: conv.id, direction: 'in', channel: 'email', fromName: fromName || undefined, fromEmail,
      body: `${spam ? '[Marked as possible spam by the mail server]\n' : ''}${auto ? '[Automatic reply]\n' : ''}${m.Subject ? `${m.Subject}\n\n` : ''}${inboundBody(m)}`,
      emailMessageId: m.MessageID,
    },
  })

  // tell the assigned agent about replies to website emails (Gmail-forwarded mail is already in their inbox)
  if (m.MailboxHash && conv.assignedTo && !auto && !spam) {
    const agent = await payload.findByID({ collection: 'users', id: idOf(conv.assignedTo)!, depth: 0, overrideAccess: true }).catch(() => null)
    if (agent?.email && agent.active !== false && agent.notify?.newMessages !== false) {
      await sendEmail({
        to: agent.email, subject: `New reply from ${fromName || fromEmail}`, tag: 'agent-notification',
        content: { heading: `${fromName || fromEmail} replied`, paragraphs: [inboundBody(m).slice(0, 600)], button: { label: 'Open in the Inbox', href: `${env.SITE_URL}/admin/inbox?c=${conv.id}` } },
      }).catch(() => undefined)
    }
  }
  return { status: 'logged', conversationId: conv.id }
}
