/**
 * Live chat on the website. A visitor's chat is a conversation (channel
 * "chat") in the Inbox; the visitor is recognised by a random token in an
 * http-only cookie (only its hash is stored). The team replies from the
 * Inbox. While nobody on the team has the Inbox open, the chat says so and
 * asks for an email address; replies to visitors who have left are emailed.
 */
import type { Payload, PayloadRequest } from 'payload'
import { env } from '@/lib/env'
import { sendEmail, threadReplyTo } from '@/lib/email'
import { sha256, token } from '@/lib/ids'
import { upsertContact } from '@/lib/crm/leads'
import { notifyTeam } from '@/lib/crm/notify'
import { localReq } from '@/lib/booking/flows'

export const CHAT_COOKIE = 'ngina_chat'
/** The team counts as online for this long after the Inbox last checked in. */
export const ONLINE_MS = 2 * 60_000
/** A visitor counts as gone (replies are emailed) after this long without the chat open. */
export const VISITOR_AWAY_MS = 2 * 60_000

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | undefined))

export async function teamOnline(payload: Payload, now = Date.now()): Promise<boolean> {
  const s = await payload.findGlobal({ slug: 'chat-status', depth: 0, overrideAccess: true }).catch(() => null)
  return Boolean(s?.teamSeenAt && now - new Date(s.teamSeenAt).getTime() < ONLINE_MS)
}

/** Called while a team member has the Inbox open. Writes at most every 30 s. */
export async function markTeamSeen(payload: Payload, now = Date.now()) {
  const s = await payload.findGlobal({ slug: 'chat-status', depth: 0, overrideAccess: true }).catch(() => null)
  if (s?.teamSeenAt && now - new Date(s.teamSeenAt).getTime() < 30_000) return
  await payload.updateGlobal({ slug: 'chat-status', data: { teamSeenAt: new Date(now).toISOString() }, overrideAccess: true })
}

export async function visitorConversation(payload: Payload, cookieToken?: string | null) {
  if (!cookieToken || cookieToken.length < 20) return null
  const { docs } = await payload.find({
    collection: 'conversations', where: { and: [{ visitorTokenHash: { equals: sha256(cookieToken) } }, { channel: { equals: 'chat' } }] },
    limit: 1, depth: 1, overrideAccess: true,
  })
  return docs[0] ?? null
}

export type ChatStart = { name?: string; email?: string; message: string; page?: string }

export async function startChat(payload: Payload, input: ChatStart) {
  const req = await localReq(payload)
  const online = await teamOnline(payload)
  const name = input.name?.trim() || ''
  const email = input.email?.trim().toLowerCase() || ''
  const contact = email ? await upsertContact(payload, { name: name || email.split('@')[0]!, email, source: { channel: 'chat', page: input.page } }) : null
  const visitorToken = token()
  const conv = await payload.create({
    collection: 'conversations', overrideAccess: true, req,
    data: {
      subject: `Live chat${name ? `: ${name}` : ''}`, channel: 'chat', status: 'open', contact: contact?.id,
      assignedTo: idOf(contact?.owner), visitorTokenHash: sha256(visitorToken), visitorSeenAt: new Date().toISOString(),
      threadKey: token(9), source: { channel: 'chat', page: input.page },
    } as never,
  })
  await payload.create({
    collection: 'messages', overrideAccess: true, req,
    data: { conversation: conv.id, direction: 'in', channel: 'chat', fromName: name || undefined, fromEmail: email || undefined, body: input.message },
  })
  if (!online) {
    await payload.create({
      collection: 'messages', overrideAccess: true, req,
      data: {
        conversation: conv.id, direction: 'out', channel: 'chat', automated: true,
        body: email
          ? `Asante! Our team is away from the chat right now. We will reply here and by email to ${email}, usually within a few hours.`
          : 'Asante! Our team is away from the chat right now. Leave your email below and we will reply there too.',
      },
    })
  }
  await notifyTeam(req, `New live chat${name ? ` from ${name}` : ''}`, [input.message.slice(0, 600), online ? 'Someone has the Inbox open.' : 'Nobody had the Inbox open.'], `${env.SITE_URL}/admin/inbox?c=${conv.id}`).catch(() => undefined)
  return { token: visitorToken, conversationId: conv.id }
}

export async function visitorSend(payload: Payload, conv: any, message: string) {
  const req = await localReq(payload)
  const last = (await payload.find({ collection: 'messages', where: { conversation: { equals: conv.id } }, sort: '-createdAt', limit: 1, depth: 0, overrideAccess: true })).docs[0]
  const contact = conv.contact && typeof conv.contact === 'object' ? conv.contact : null
  await payload.create({
    collection: 'messages', overrideAccess: true, req,
    data: { conversation: conv.id, direction: 'in', channel: 'chat', fromName: contact?.firstName, fromEmail: contact?.email, body: message },
  })
  // a new message after the team's reply, while nobody is watching: tell the team
  if (last?.direction !== 'in' && !(await teamOnline(payload))) {
    await notifyTeam(req, `New chat message${contact?.firstName ? ` from ${contact.firstName}` : ''}`, [message.slice(0, 600)], `${env.SITE_URL}/admin/inbox?c=${conv.id}`).catch(() => undefined)
  }
}

/** The visitor leaves an email so the team can reply there. */
export async function visitorEmail(payload: Payload, conv: any, input: { email: string; name?: string; page?: string }) {
  const req = await localReq(payload)
  const contact = await upsertContact(payload, { name: input.name?.trim() || input.email.split('@')[0]!, email: input.email.trim().toLowerCase(), source: { channel: 'chat', page: input.page } })
  await payload.update({
    collection: 'conversations', id: conv.id, overrideAccess: true, req,
    data: { contact: contact.id, assignedTo: idOf(conv.assignedTo) ?? idOf(contact.owner), subject: `Live chat: ${contact.fullName || contact.firstName}` } as never,
  })
  await payload.create({
    collection: 'messages', overrideAccess: true, req,
    data: { conversation: conv.id, direction: 'out', channel: 'chat', automated: true, body: `Thank you. We will reply here and by email to ${contact.email}.` },
  })
}

/** What the visitor's chat window shows. Internal notes and email-only messages stay hidden. */
export async function visitorThread(payload: Payload, conv: any) {
  // remember the visitor is still here (at most every 30 s)
  if (!conv.visitorSeenAt || Date.now() - new Date(conv.visitorSeenAt).getTime() > 30_000) {
    await payload.update({ collection: 'conversations', id: conv.id, data: { visitorSeenAt: new Date().toISOString() }, overrideAccess: true, context: { fromMessage: true } }).catch(() => undefined)
  }
  const { docs } = await payload.find({
    collection: 'messages', where: { and: [{ conversation: { equals: conv.id } }, { direction: { in: ['in', 'out'] } }] },
    sort: 'createdAt', limit: 200, depth: 1, overrideAccess: true,
  })
  const contact = conv.contact && typeof conv.contact === 'object' ? conv.contact : null
  return {
    hasEmail: Boolean(contact?.email),
    status: conv.status,
    messages: docs.map((m: any) => ({
      id: m.id,
      from: m.direction === 'in' ? 'you' : 'team',
      // first names only: never staff emails or surnames
      name: m.direction === 'out' ? (m.automated ? 'Ngina Trails' : String(m.author?.name ?? 'Ngina Trails').split(' ')[0]) : undefined,
      body: m.body,
      at: m.createdAt,
    })),
  }
}

/**
 * The team replied to a chat from the Inbox. If the visitor has closed the
 * chat and left an email, send the reply by email too (their email reply
 * comes back into the same conversation).
 */
export async function emailChatReplyIfAway(req: PayloadRequest, conv: any, body: string, signature: string) {
  const seen = conv.visitorSeenAt ? new Date(conv.visitorSeenAt).getTime() : 0
  if (Date.now() - seen < VISITOR_AWAY_MS) return 'live'
  const contactId = idOf(conv.contact)
  if (!contactId) return 'no-email'
  const contact = await req.payload.findByID({ collection: 'contacts', id: contactId, depth: 0, overrideAccess: true })
  if (!contact.email) return 'no-email'
  const res = await sendEmail({
    to: contact.email, subject: 'Reply to your chat with Ngina Trails and Safaris', tag: 'chat-reply',
    replyTo: conv.threadKey ? await threadReplyTo(conv.threadKey) : undefined,
    content: { heading: `Jambo ${contact.firstName ?? ''}`.trim(), paragraphs: [...body.split(/\n{2,}/), 'You can reply to this email, or carry on in the chat on our website.'], signature },
  })
  return res.status === 'failed' ? 'email-failed' : 'emailed'
}
