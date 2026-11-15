import type { NextRequest } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { json } from '@/lib/booking/http'
import { getConfig } from '@/lib/config'
import { getPayloadSafe } from '@/lib/content'
import { handleInbound, type InboundEmail } from '@/lib/inbox/inbound'

export const dynamic = 'force-dynamic'

const same = (a: string, b: string) => {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/**
 * Postmark inbound webhook. Set the URL in Postmark (Inbound stream →
 * Settings) to https://USER:PASSWORD@yourdomain/api/webhooks/postmark-inbound,
 * using the username and password saved on the Integrations page.
 */
export async function POST(req: NextRequest) {
  const c = (await getConfig()).postmark
  if (!c.inboundUser || !c.inboundPassword) return json({ ok: false, error: 'Inbound email is not set up.' }, 503)
  const auth = req.headers.get('authorization') ?? ''
  const expected = `Basic ${Buffer.from(`${c.inboundUser}:${c.inboundPassword}`).toString('base64')}`
  if (!same(auth, expected)) return json({ ok: false }, 401)
  let msg: InboundEmail
  try {
    msg = (await req.json()) as InboundEmail
  } catch {
    return json({ ok: false }, 400)
  }
  const payload = await getPayloadSafe()
  if (!payload) return json({ ok: false }, 503)
  try {
    const from = c.fromEmail?.match(/<([^>]+)>/)?.[1] ?? c.fromEmail ?? ''
    const res = await handleInbound(payload, msg, { ourAddresses: [from, c.inboundAddress ?? ''] })
    return json({ ok: true, ...res })
  } catch (e) {
    payload.logger.error(`inbound email failed: ${(e as Error).message}`)
    // 5xx: Postmark retries later
    return json({ ok: false }, 500)
  }
}
