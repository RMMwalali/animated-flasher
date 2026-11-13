import type { Payload } from 'payload'

export type RateResult = { ok: boolean; remaining: number; resetAt: number }

/** Fixed-window counter. Pure so it can be unit-tested. */
export function windowStep(state: { count: number; resetAt: number } | undefined, now: number, limit: number, windowMs: number) {
  const fresh = !state || state.resetAt <= now
  const next = fresh ? { count: 1, resetAt: now + windowMs } : { count: state.count + 1, resetAt: state.resetAt }
  return { state: next, result: { ok: next.count <= limit, remaining: Math.max(0, limit - next.count), resetAt: next.resetAt } }
}

const memory = new Map<string, { count: number; resetAt: number }>()

/**
 * Rate limit by key. Uses the database so limits hold across serverless
 * instances; falls back to memory if the database is unavailable.
 */
export async function rateLimit(payload: Payload | null, key: string, limit: number, windowMs: number): Promise<RateResult> {
  const now = Date.now()
  if (payload) {
    try {
      const { docs } = await payload.find({ collection: 'rate-limits', where: { key: { equals: key } }, limit: 1, depth: 0, overrideAccess: true })
      const cur = docs[0]
      const { state, result } = windowStep(cur ? { count: cur.count, resetAt: new Date(cur.resetAt).getTime() } : undefined, now, limit, windowMs)
      const data = { key, count: state.count, resetAt: new Date(state.resetAt).toISOString() }
      if (cur) await payload.update({ collection: 'rate-limits', id: cur.id, data, overrideAccess: true })
      else await payload.create({ collection: 'rate-limits', data, overrideAccess: true }).catch(() => undefined)
      if (Math.random() < 0.02) {
        payload.delete({ collection: 'rate-limits', where: { resetAt: { less_than: new Date(now - 864e5).toISOString() } }, overrideAccess: true }).catch(() => undefined)
      }
      return result
    } catch {
      /* fall through to memory */
    }
  }
  const { state, result } = windowStep(memory.get(key), now, limit, windowMs)
  memory.set(key, state)
  return result
}

export function clientIp(headers: Headers): string {
  return headers.get('x-real-ip') || headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('cf-connecting-ip') || 'unknown'
}
