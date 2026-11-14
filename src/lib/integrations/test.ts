/** "Test connection" checks for the Integrations page. Each makes one harmless read-only call. */
import type { RuntimeConfig } from '@/lib/config'

export type TestResult = { ok: boolean; message: string }

const call = (url: string, init: RequestInit = {}) => fetch(url, { ...init, signal: AbortSignal.timeout(8000) })

export async function testService(service: string, c: RuntimeConfig): Promise<TestResult> {
  switch (service) {
    case 'paystack': {
      const key = c.paystack.secretKey
      if (!key) return { ok: false, message: 'Add the secret key and save first.' }
      const res = await call('https://api.paystack.co/balance', { headers: { Authorization: `Bearer ${key}` } })
      if (res.status === 401) return { ok: false, message: 'Paystack rejected this secret key. Copy it again from Settings → API Keys & Webhooks.' }
      if (!res.ok) return { ok: false, message: `Paystack answered with error ${res.status}. Try again in a minute.` }
      const mode = key.startsWith('sk_live_') ? 'LIVE mode: real payments' : 'TEST mode: no real money moves'
      return { ok: true, message: `Connected to Paystack (${mode}).${c.paystack.publicKey ? '' : ' Add the public key too.'}` }
    }
    case 'postmark': {
      const p = c.postmark
      if (!p.serverToken) return { ok: false, message: 'Add the server API token and save first.' }
      const res = await call('https://api.postmarkapp.com/server', { headers: { Accept: 'application/json', 'X-Postmark-Server-Token': p.serverToken } })
      if (res.status === 401) return { ok: false, message: 'Postmark rejected this token. Copy the Server API token (not the Account token).' }
      if (!res.ok) return { ok: false, message: `Postmark answered with error ${res.status}.` }
      const name = ((await res.json()) as { Name?: string }).Name
      if (!p.fromEmail) return { ok: false, message: `Connected to Postmark server "${name}", but "Send from" is empty.` }
      if (/@(gmail|yahoo|outlook|hotmail)\./i.test(p.fromEmail)) return { ok: false, message: 'Connected, but "Send from" uses a free email address. Postmark (like every sending service) needs an address on your own domain.' }
      return { ok: true, message: `Connected to Postmark server "${name}". Emails will be sent from ${p.fromEmail}.${p.inboundAddress ? '' : ' Add the inbound address so guest replies reach the inbox.'}` }
    }
    case 'turnstile': {
      const t = c.turnstile
      if (!t.secretKey || !t.siteKey) return { ok: false, message: 'Add both the site key and the secret key, then save.' }
      const res = await call('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret: t.secretKey, response: 'connection-test' }) })
      const j = (await res.json()) as { 'error-codes'?: string[] }
      if (j['error-codes']?.includes('invalid-input-secret')) return { ok: false, message: 'Cloudflare rejected this secret key.' }
      return { ok: true, message: 'Cloudflare accepted the secret key. The spam check now appears on the forms.' }
    }
    case 'google': {
      const g = c.google
      if (!g.placesApiKey || !g.placeId) return { ok: false, message: 'Add the API key and the Place ID, then save.' }
      const res = await call(`https://places.googleapis.com/v1/places/${encodeURIComponent(g.placeId)}`, { headers: { 'X-Goog-Api-Key': g.placesApiKey, 'X-Goog-FieldMask': 'displayName,rating,userRatingCount' } })
      const j = (await res.json()) as { displayName?: { text: string }; rating?: number; userRatingCount?: number; error?: { message: string } }
      if (!res.ok) return { ok: false, message: `Google says: ${j.error?.message ?? res.status}` }
      return { ok: true, message: `Found "${j.displayName?.text}"${j.rating ? `: ${j.rating}★ from ${j.userRatingCount} reviews` : ' (no reviews yet: the section appears once there are some)'}.` }
    }
    default:
      return { ok: false, message: 'Unknown service.' }
  }
}
