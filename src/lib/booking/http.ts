import { NextResponse, type NextRequest } from 'next/server'
import type { Payload } from 'payload'
import { getPayloadSafe } from '@/lib/content'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { GuestError } from './flows'

const NO_STORE = { 'Cache-Control': 'no-store' }

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: NO_STORE })

/** Requests from guest pages must come from our own site (blocks cross-site form posts). */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).host === req.headers.get('host')
  } catch {
    return false
  }
}

/** Shared wrapper for guest endpoints: origin check, rate limit, JSON body, friendly errors. */
export async function guestEndpoint(req: NextRequest, name: string, limit: number, fn: (payload: Payload, body: Record<string, unknown>) => Promise<unknown>) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'Bad origin.' }, 403)
  const payload = await getPayloadSafe()
  if (!payload) return json({ ok: false, error: 'Bookings are not available right now. Please email us.' }, 503)
  const rl = await rateLimit(payload, `${name}:${clientIp(req.headers)}`, limit, 10 * 60_000)
  if (!rl.ok) return json({ ok: false, error: 'Too many attempts. Please wait a few minutes and try again.' }, 429)
  let body: Record<string, unknown> = {}
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400)
  }
  try {
    const result = await fn(payload, body)
    return json({ ok: true, ...(result as object) })
  } catch (e) {
    if (e instanceof GuestError) return json({ ok: false, error: e.message }, e.status)
    payload.logger.error(`${name} failed: ${(e as Error).message}`)
    return json({ ok: false, error: 'Something went wrong. Please try again, or reply to your email and we will help.' }, 500)
  }
}

export const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '')
