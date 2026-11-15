/**
 * Every email to a guest goes through here, so it is also saved in the
 * guest's conversation in the Inbox, and the guest's reply threads back to
 * the same conversation (reply-to address with the conversation's key).
 */
import type { Payload, PayloadRequest } from 'payload'
import { sendEmail, threadReplyTo, type SendResult } from '@/lib/email'
import { renderEmail, type EmailContent } from '@/lib/email/template'
import { token } from '@/lib/ids'

type P = { payload: Payload } | PayloadRequest
const payloadOf = (p: P) => p.payload
const reqOf = (p: P) => ('user' in p ? (p as PayloadRequest) : undefined)
const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | undefined))

/** The guest's current email conversation, or a new one. */
export async function guestConversation(p: P, opts: { contactId: number; subject: string; leadId?: number | null }) {
  const payload = payloadOf(p)
  const req = reqOf(p)
  const { docs } = await payload.find({
    collection: 'conversations', limit: 1, depth: 0, overrideAccess: true, req, sort: '-lastMessageAt',
    where: { and: [{ contact: { equals: opts.contactId } }, { channel: { equals: 'email' } }, { status: { not_equals: 'closed' } }] },
  })
  let conv = docs[0]
  if (!conv) {
    const contact = await payload.findByID({ collection: 'contacts', id: opts.contactId, depth: 0, overrideAccess: true, req })
    conv = await payload.create({
      collection: 'conversations', overrideAccess: true, req,
      data: { subject: opts.subject, contact: opts.contactId, lead: opts.leadId ?? undefined, channel: 'email', status: 'pending', threadKey: token(9), assignedTo: idOf(contact.owner) },
    })
  } else if (!conv.threadKey) {
    conv = await payload.update({ collection: 'conversations', id: conv.id, data: { threadKey: token(9) }, overrideAccess: true, req })
  }
  return conv
}

export type GuestEmail = {
  contactId: number
  subject: string
  content: EmailContent
  tag?: string
  /** Sent by a person from the Inbox (false = automatic: receipt, reminder…). */
  authorId?: number | null
  conversationId?: number | null
  leadId?: number | null
}

/** Send an email to a guest and save it in their conversation. */
export async function sendToGuest(p: P, e: GuestEmail): Promise<SendResult & { conversationId?: number }> {
  const payload = payloadOf(p)
  const req = reqOf(p)
  const contact = await payload.findByID({ collection: 'contacts', id: e.contactId, depth: 0, overrideAccess: true, req })
  if (!contact.email) return { status: 'failed', error: 'This guest has no email address.' }
  const conv = e.conversationId
    ? await payload.findByID({ collection: 'conversations', id: e.conversationId, depth: 0, overrideAccess: true, req })
    : await guestConversation(p, { contactId: e.contactId, subject: e.subject, leadId: e.leadId })
  const replyTo = conv.threadKey ? await threadReplyTo(conv.threadKey) : undefined
  const res = await sendEmail({ to: contact.email, subject: e.subject, content: e.content, tag: e.tag, replyTo, metadata: { conversation: String(conv.id) } })
  await payload.create({
    collection: 'messages', overrideAccess: true, req,
    data: {
      conversation: conv.id, direction: 'out', channel: 'email', automated: !e.authorId, author: e.authorId ?? undefined,
      body: `${e.subject}\n\n${renderEmail(e.content).text}`.slice(0, 20000),
      deliveryStatus: res.status, emailMessageId: res.messageId,
    },
  })
  return { ...res, conversationId: conv.id }
}

/** Strip the quoted history from an email reply (most clients). Pure: unit-tested. */
export function stripQuoted(text: string): string {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  for (const line of lines) {
    if (/^On .{4,200}wrote:\s*$/.test(line) || /^-{2,}\s*Original Message\s*-{2,}/i.test(line) || /^_{5,}$/.test(line) || /^From: .+/.test(line) && out.length > 0) break
    if (/^>/.test(line)) continue
    out.push(line)
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
