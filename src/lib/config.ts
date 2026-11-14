/**
 * Runtime configuration for outside services. A value set in the environment
 * (Vercel → Environment Variables) always wins; otherwise the key the owner
 * saved in the admin (Integrations, stored encrypted) is used. Server-only.
 */
import type { Payload } from 'payload'

export type RealtimeKind = 'pusher' | 'ably' | 'none'

export type RuntimeConfig = {
  paystack: { secretKey?: string; publicKey?: string }
  postmark: { serverToken?: string; fromEmail?: string; messageStream: string; inboundAddress?: string; inboundUser?: string; inboundPassword?: string }
  realtime: { provider: RealtimeKind; pusherAppId?: string; pusherKey?: string; pusherSecret?: string; pusherCluster: string; ablyApiKey?: string }
  turnstile: { siteKey?: string; secretKey?: string }
  indexNowKey?: string
  analytics: { vercel: boolean; ga4Id?: string; clarityId?: string; metaPixelId?: string; tiktokPixelId?: string }
  google: { placesApiKey?: string; placeId?: string }
}

const pick = (...v: (string | null | undefined)[]) => v.map((x) => (typeof x === 'string' ? x.trim() : x)).find((x) => x) || undefined

/** Merge environment values over stored ones. Pure: unit-tested. */
export function mergeConfig(e: Record<string, string | undefined>, s: any = {}): RuntimeConfig {
  const pusherReady = pick(e.PUSHER_APP_ID, s.realtime?.pusherAppId) && pick(e.PUSHER_KEY, s.realtime?.pusherKey) && pick(e.PUSHER_SECRET, s.realtime?.pusherSecret)
  const ablyReady = pick(e.ABLY_API_KEY, s.realtime?.ablyApiKey)
  const wanted = (pick(e.REALTIME_PROVIDER, s.realtime?.provider) ?? (pusherReady ? 'pusher' : ablyReady ? 'ably' : 'none')) as RealtimeKind
  const provider: RealtimeKind = wanted === 'pusher' && pusherReady ? 'pusher' : wanted === 'ably' && ablyReady ? 'ably' : 'none'
  return {
    paystack: { secretKey: pick(e.PAYSTACK_SECRET_KEY, s.paystack?.secretKey), publicKey: pick(e.PAYSTACK_PUBLIC_KEY, s.paystack?.publicKey) },
    postmark: {
      serverToken: pick(e.POSTMARK_SERVER_TOKEN, s.postmark?.serverToken),
      fromEmail: pick(e.POSTMARK_FROM_EMAIL, s.postmark?.fromEmail),
      messageStream: pick(e.POSTMARK_MESSAGE_STREAM, s.postmark?.messageStream) ?? 'outbound',
      inboundAddress: pick(e.POSTMARK_INBOUND_ADDRESS, s.postmark?.inboundAddress),
      inboundUser: pick(e.POSTMARK_INBOUND_WEBHOOK_USER, s.postmark?.inboundUser),
      inboundPassword: pick(e.POSTMARK_INBOUND_WEBHOOK_PASSWORD, s.postmark?.inboundPassword),
    },
    realtime: {
      provider,
      pusherAppId: pick(e.PUSHER_APP_ID, s.realtime?.pusherAppId),
      pusherKey: pick(e.PUSHER_KEY, s.realtime?.pusherKey),
      pusherSecret: pick(e.PUSHER_SECRET, s.realtime?.pusherSecret),
      pusherCluster: pick(e.PUSHER_CLUSTER, s.realtime?.pusherCluster) ?? 'eu',
      ablyApiKey: pick(e.ABLY_API_KEY, s.realtime?.ablyApiKey),
    },
    turnstile: { siteKey: pick(e.NEXT_PUBLIC_TURNSTILE_SITE_KEY, s.turnstile?.siteKey), secretKey: pick(e.TURNSTILE_SECRET_KEY, s.turnstile?.secretKey) },
    indexNowKey: pick(e.INDEXNOW_KEY, s.indexNow?.key),
    analytics: {
      vercel: s.analytics?.vercel !== false,
      ga4Id: pick(e.NEXT_PUBLIC_GA4_ID, s.analytics?.ga4Id),
      clarityId: pick(e.NEXT_PUBLIC_CLARITY_ID, s.analytics?.clarityId),
      metaPixelId: pick(e.NEXT_PUBLIC_META_PIXEL_ID, s.analytics?.metaPixelId),
      tiktokPixelId: pick(e.NEXT_PUBLIC_TIKTOK_PIXEL_ID, s.analytics?.tiktokPixelId),
    },
    google: { placesApiKey: pick(e.GOOGLE_PLACES_API_KEY, s.google?.placesApiKey), placeId: pick(e.GOOGLE_PLACE_ID, s.google?.placeId) },
  }
}

export type Features = ReturnType<typeof featuresOf>
export function featuresOf(c: RuntimeConfig) {
  return {
    payments: Boolean(c.paystack.secretKey),
    email: Boolean(c.postmark.serverToken && c.postmark.fromEmail),
    inboundEmail: Boolean(c.postmark.inboundUser && c.postmark.inboundPassword),
    realtime: c.realtime.provider,
    turnstile: Boolean(c.turnstile.siteKey && c.turnstile.secretKey),
    indexNow: Boolean(c.indexNowKey),
    googleReviews: Boolean(c.google.placesApiKey && c.google.placeId),
  }
}

// short cache: the admin clears it on save; other server instances refresh within 30 s
let cached: { at: number; value: RuntimeConfig } | null = null
const TTL = 30_000

export function invalidateConfig() {
  cached = null
}

export async function getConfig(payload?: Payload | null): Promise<RuntimeConfig> {
  if (cached && Date.now() - cached.at < TTL) return cached.value
  let stored: unknown = {}
  try {
    const p = payload ?? (await (await import('@/lib/content')).getPayloadSafe())
    if (p) stored = await p.findGlobal({ slug: 'integrations', depth: 0, overrideAccess: true, context: { revealSecrets: true } })
  } catch {
    /* no database or table yet: environment only */
  }
  const value = mergeConfig(process.env, stored)
  cached = { at: Date.now(), value }
  return value
}

export async function getFeatures(payload?: Payload | null) {
  return featuresOf(await getConfig(payload))
}

/** Settings still missing, for the admin "Go-live setup" notices. */
export async function missingSetup(payload?: Payload | null) {
  const f = await getFeatures(payload)
  const base = (await import('@/lib/env')).missingFeatures().filter((m) => ['storage', 'dailyJob'].includes(m.key))
  const list: { key: string; label: string; vars: string }[] = [...base]
  const where = 'Integrations page (or Vercel)'
  if (!f.email) list.push({ key: 'email', label: 'Email (Postmark): emails are logged, not sent', vars: where })
  if (!f.inboundEmail) list.push({ key: 'inboundEmail', label: 'Guest email replies (Postmark inbound): replies will not reach the inbox', vars: where })
  if (f.realtime === 'none') list.push({ key: 'realtime', label: 'Real-time chat (Pusher or Ably): chat refreshes every few seconds instead', vars: where })
  if (!f.payments) list.push({ key: 'payments', label: 'Payments (Paystack: M-Pesa + card): online payment is switched off', vars: where })
  return list
}

