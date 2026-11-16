import type { NextRequest } from 'next/server'
import { isSales } from '@/access'
import { localReq } from '@/lib/booking/flows'
import { json, sameOrigin } from '@/lib/booking/http'
import { getPayloadSafe } from '@/lib/content'
import { sendToGuest } from '@/lib/inbox'
import { emailChatReplyIfAway, markTeamSeen } from '@/lib/chat'

export const dynamic = 'force-dynamic'

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | undefined))
const str = (v: unknown, max = 20000) => (typeof v === 'string' ? v.slice(0, max) : '')

/**
 * Inbox actions (sales team): reply by email, internal note, log a WhatsApp
 * or phone conversation, start a new email, update status / assignee.
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'Bad origin.' }, 403)
  const payload = await getPayloadSafe()
  if (!payload) return json({ ok: false, error: 'No database connected.' }, 503)
  const { user } = await payload.auth({ headers: req.headers })
  if (!user || !isSales(user as never)) return json({ ok: false, error: 'Sales team only.' }, 403)
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const r = await localReq(payload)
  r.user = user as never
  const me = user as unknown as { id: number; name?: string; title?: string; signature?: string }
  const signature = me.signature || [me.name, me.title, 'Ngina Trails and Safaris · Diani Beach, Kenya'].filter(Boolean).join('\n')

  try {
    switch (b.action) {
      case 'presence': {
        // the Inbox is open: live chat shows the team as online
        await markTeamSeen(payload)
        return json({ ok: true })
      }
      case 'reply': {
        const conv = await payload.findByID({ collection: 'conversations', id: Number(b.conversationId), depth: 0, overrideAccess: true })
        const body = str(b.body).trim()
        if (!body) return json({ ok: false, error: 'Write a message first.' }, 400)
        if (conv.channel === 'chat') {
          await payload.create({ collection: 'messages', overrideAccess: true, req: r, data: { conversation: conv.id, direction: 'out', channel: 'chat', author: me.id, body } })
          // the visitor has left the chat: send the reply to their email too
          const delivery = await emailChatReplyIfAway(r, conv, body, signature)
          return json({ ok: true, status: delivery === 'emailed' ? 'sent' : 'logged', delivery })
        }
        if (conv.channel !== 'email') {
          await payload.create({ collection: 'messages', overrideAccess: true, req: r, data: { conversation: conv.id, direction: 'out', channel: conv.channel, author: me.id, body } })
          return json({ ok: true, status: 'logged' })
        }
        const contactId = idOf(conv.contact)
        if (!contactId) return json({ ok: false, error: 'This conversation has no guest attached.' }, 400)
        const subject = /^re:/i.test(conv.subject) ? conv.subject : `Re: ${conv.subject}`
        const res = await sendToGuest(r, {
          contactId, conversationId: conv.id, authorId: me.id, subject, tag: 'inbox-reply',
          content: { heading: '', paragraphs: body.split(/\n{2,}/), signature },
        })
        if (res.status === 'failed') return json({ ok: false, error: `Not sent: ${res.error}` }, 502)
        return json({ ok: true, status: res.status })
      }
      case 'note': {
        const body = str(b.body).trim()
        if (!body) return json({ ok: false, error: 'Write a note first.' }, 400)
        await payload.create({ collection: 'messages', overrideAccess: true, req: r, data: { conversation: Number(b.conversationId), direction: 'note', channel: 'email', author: me.id, body } })
        return json({ ok: true })
      }
      case 'log': {
        // a WhatsApp chat or phone call, typed in by the agent so the record stays complete
        const channel = b.channel === 'phone' ? 'phone' : 'whatsapp'
        const direction = b.direction === 'out' ? 'out' : 'in'
        const body = str(b.body).trim()
        const contactId = Number(b.contactId)
        if (!body || !contactId) return json({ ok: false, error: 'Choose the guest and write what was said.' }, 400)
        let conv = (await payload.find({ collection: 'conversations', where: { and: [{ contact: { equals: contactId } }, { channel: { equals: channel } }] }, sort: '-lastMessageAt', limit: 1, depth: 0, overrideAccess: true })).docs[0]
        if (!conv) {
          const c = await payload.findByID({ collection: 'contacts', id: contactId, depth: 0, overrideAccess: true })
          conv = await payload.create({ collection: 'conversations', overrideAccess: true, req: r, data: { subject: `${channel === 'phone' ? 'Phone' : 'WhatsApp'}: ${c.fullName ?? c.firstName}`, contact: contactId, channel, status: 'open', assignedTo: me.id } })
        }
        await payload.create({ collection: 'messages', overrideAccess: true, req: r, data: { conversation: conv.id, direction, channel, author: me.id, body } })
        return json({ ok: true, conversationId: conv.id })
      }
      case 'new': {
        const contactId = Number(b.contactId)
        const subject = str(b.subject, 200).trim()
        const body = str(b.body).trim()
        if (!contactId || !subject || !body) return json({ ok: false, error: 'Choose the guest, a subject and a message.' }, 400)
        const conv = await payload.create({ collection: 'conversations', overrideAccess: true, req: r, data: { subject, contact: contactId, channel: 'email', status: 'pending', assignedTo: me.id, threadKey: (await import('@/lib/ids')).token(9) } })
        const res = await sendToGuest(r, { contactId, conversationId: conv.id, authorId: me.id, subject, tag: 'inbox-new', content: { heading: '', paragraphs: body.split(/\n{2,}/), signature } })
        if (res.status === 'failed') return json({ ok: false, error: `Not sent: ${res.error}`, conversationId: conv.id }, 502)
        return json({ ok: true, conversationId: conv.id, status: res.status })
      }
      case 'update': {
        const data: Record<string, unknown> = {}
        if (['open', 'pending', 'closed'].includes(String(b.status))) data.status = b.status
        if (b.assignedTo !== undefined) data.assignedTo = b.assignedTo ? Number(b.assignedTo) : null
        if (b.read === true) data.unread = 0
        if (!Object.keys(data).length) return json({ ok: false, error: 'Nothing to change.' }, 400)
        await payload.update({ collection: 'conversations', id: Number(b.conversationId), data, overrideAccess: true, req: r, context: { fromMessage: true } })
        return json({ ok: true })
      }
      default:
        return json({ ok: false, error: 'Unknown action.' }, 400)
    }
  } catch (e) {
    payload.logger.error(`inbox ${String(b.action)}: ${(e as Error).message}`)
    return json({ ok: false, error: (e as Error).message }, 500)
  }
}
