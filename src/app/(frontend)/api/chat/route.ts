import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { GuestError } from '@/lib/booking/flows'
import { guestEndpoint, json } from '@/lib/booking/http'
import { CHAT_COOKIE, startChat, teamOnline, visitorConversation, visitorEmail, visitorSend, visitorThread } from '@/lib/chat'
import { getPayloadSafe } from '@/lib/content'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'

export const dynamic = 'force-dynamic'

const message = z.string().trim().min(1, 'Write a message first.').max(2000, 'Please keep messages under 2000 characters.')
const email = z.string().trim().email('Please check the email address.').max(200)
const startSchema = z.object({ name: z.string().trim().max(80).optional(), email: z.union([email, z.literal('')]).optional(), message, page: z.string().max(300).optional(), website: z.string().optional() })

async function token() {
  return (await cookies()).get(CHAT_COOKIE)?.value
}

/** The visitor's chat: messages so far and whether the team is online. */
export async function GET(req: NextRequest) {
  const payload = await getPayloadSafe()
  if (!payload) return json({ ok: false, enabled: false })
  const rl = await rateLimit(payload, `chat-poll:${clientIp(req.headers)}`, 400, 10 * 60_000)
  if (!rl.ok) return json({ ok: false, error: 'Too many requests.' }, 429)
  const online = await teamOnline(payload)
  const conv = await visitorConversation(payload, await token())
  if (!conv) return json({ ok: true, online, conversation: null })
  return json({ ok: true, online, conversation: await visitorThread(payload, conv) })
}

/** { action: 'start' | 'send' | 'email', ... } */
export async function POST(req: NextRequest) {
  return guestEndpoint(req, 'chat', 40, async (payload, body) => {
    const action = body.action
    if (action === 'start') {
      const input = startSchema.safeParse(body)
      if (!input.success) throw new GuestError(input.error.issues[0]?.message ?? 'Please check your message.')
      // hidden field that only bots fill in: pretend it worked
      if (input.data.website) return { started: true }
      const limited = await rateLimit(payload, `chat-start:${clientIp(req.headers)}`, 6, 60 * 60_000)
      if (!limited.ok) throw new GuestError('Too many new chats. Please email us instead.', 429)
      const existing = await visitorConversation(payload, await token())
      if (existing) {
        await visitorSend(payload, existing, input.data.message)
        return { started: true }
      }
      const { token: t } = await startChat(payload, input.data)
      ;(await cookies()).set(CHAT_COOKIE, t, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 })
      return { started: true }
    }
    const conv = await visitorConversation(payload, await token())
    if (!conv) throw new GuestError('Your chat has ended. Start a new one, or email us.', 404)
    if (action === 'send') {
      const m = message.safeParse(body.message)
      if (!m.success) throw new GuestError(m.error.issues[0]?.message ?? 'Write a message first.')
      await visitorSend(payload, conv, m.data)
      return {}
    }
    if (action === 'email') {
      const e = email.safeParse(body.email)
      if (!e.success) throw new GuestError('Please check the email address.')
      await visitorEmail(payload, conv, { email: e.data, name: typeof body.name === 'string' ? body.name.slice(0, 80) : undefined, page: typeof body.page === 'string' ? body.page.slice(0, 300) : undefined })
      return {}
    }
    throw new GuestError('Unknown action.')
  })
}
