import { env, features } from '@/lib/env'

export const MIN_FILL_MS = 2500

/** Signals that a submission is from a bot. Pure for testing. */
export function spamSignals(input: { website?: string | null; startedAt?: number | null; message?: string | null }, now = Date.now()): string[] {
  const out: string[] = []
  if (input.website) out.push('honeypot')
  if (input.startedAt && now - input.startedAt < MIN_FILL_MS) out.push('too-fast')
  const links = (input.message?.match(/https?:\/\//g) ?? []).length
  if (links > 3) out.push('links')
  return out
}

/** Cloudflare Turnstile check; passes automatically when not configured. */
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  if (!features.turnstile) return true
  if (!token) return false
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY!, response: token })
  if (ip && ip !== 'unknown') body.set('remoteip', ip)
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body, signal: AbortSignal.timeout(5000) })
    const json = (await res.json()) as { success: boolean }
    return json.success
  } catch {
    return false
  }
}
