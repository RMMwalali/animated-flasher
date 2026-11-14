import type { NextRequest } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { runDaily } from '@/lib/booking/flows'
import { json } from '@/lib/booking/http'
import { getPayloadSafe } from '@/lib/content'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const authorised = (header: string | null) => {
  if (!env.CRON_SECRET || !header) return false
  const a = Buffer.from(header)
  const b = Buffer.from(`Bearer ${env.CRON_SECRET}`)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Daily job (Vercel Cron, see vercel.json): expires old quotes, sends balance
 * and eTA reminders, moves bookings to travelling/completed and sends review
 * requests. Vercel sends `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: NextRequest) {
  if (!authorised(req.headers.get('authorization'))) return json({ ok: false, error: 'Unauthorised.' }, 401)
  const payload = await getPayloadSafe()
  if (!payload) return json({ ok: false, error: 'No database.' }, 503)
  const result = await runDaily(payload)
  payload.logger.info(`[daily] ${JSON.stringify(result)}`)
  return json({ ok: true, ...result })
}
