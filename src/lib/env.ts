import { createHash } from 'node:crypto'
import { z } from 'zod'

/**
 * Server-side environment. Every variable is optional except where noted so
 * the app builds and runs without third-party keys; features check
 * `features.*` and degrade gracefully (admin shows a notice).
 * Documented in .env.example.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SITE_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().optional(),
  PAYLOAD_SECRET: z.string().optional(),
  CRON_SECRET: z.string().optional(),

  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default('auto'),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  POSTMARK_SERVER_TOKEN: z.string().optional(),
  POSTMARK_FROM_EMAIL: z.string().optional(),
  POSTMARK_MESSAGE_STREAM: z.string().default('outbound'),
  POSTMARK_INBOUND_ADDRESS: z.string().optional(),
  POSTMARK_INBOUND_WEBHOOK_USER: z.string().optional(),
  POSTMARK_INBOUND_WEBHOOK_PASSWORD: z.string().optional(),

  REALTIME_PROVIDER: z.enum(['pusher', 'ably', 'none']).optional(),
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().optional(),
  ABLY_API_KEY: z.string().optional(),

  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),
  PAYMENT_CURRENCY: z.enum(['KES', 'USD']).default('KES'),

  TURNSTILE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  INDEXNOW_KEY: z.string().optional(),
})

/**
 * Public address of the site. SITE_URL wins; on Vercel without it, use the
 * production domain Vercel provides (so canonicals and the sitemap never
 * point at localhost); otherwise the local dev address.
 */
export function resolveSiteUrl(e: Record<string, string | undefined>): string | undefined {
  if (e.SITE_URL) return e.SITE_URL.replace(/\/+$/, '')
  const vercel = e.VERCEL_PROJECT_PRODUCTION_URL || e.VERCEL_URL
  return vercel ? `https://${vercel.replace(/^https?:\/\//, '')}` : undefined
}

/**
 * Database URL. Vercel's Neon integration (Storage tab) sets DATABASE_URL and
 * POSTGRES_URL; either works, so connecting the database needs no typing.
 */
export function resolveDatabaseUrl(e: Record<string, string | undefined>): string | undefined {
  return e.DATABASE_URL || e.POSTGRES_URL || e.DATABASE_URL_UNPOOLED || undefined
}

/**
 * Secret that signs admin logins. Use PAYLOAD_SECRET when set. Otherwise
 * derive one from the database URL (itself a server-only secret), so the
 * admin works as soon as a database is connected. Setting PAYLOAD_SECRET is
 * still recommended; changing it (or the database password) logs everyone out.
 */
export function resolvePayloadSecret(e: Record<string, string | undefined>, dbUrl?: string): string | undefined {
  if (e.PAYLOAD_SECRET) return e.PAYLOAD_SECRET
  if (dbUrl) return createHash('sha256').update(`ngina-payload-secret:${dbUrl}`).digest('hex')
  return undefined
}

const dbUrl = resolveDatabaseUrl(process.env)
const resolved = { SITE_URL: resolveSiteUrl(process.env), DATABASE_URL: dbUrl, PAYLOAD_SECRET: resolvePayloadSecret(process.env, dbUrl) }
const parsed = schema.safeParse({ ...process.env, ...resolved })
if (!parsed.success) {
  console.warn('[env] invalid environment variables:', parsed.error.flatten().fieldErrors)
}
export const env = parsed.success ? parsed.data : schema.parse(resolved)

const realtime = (): 'pusher' | 'ably' | 'none' => {
  if (env.REALTIME_PROVIDER) return env.REALTIME_PROVIDER
  if (env.PUSHER_APP_ID && env.PUSHER_KEY && env.PUSHER_SECRET) return 'pusher'
  if (env.ABLY_API_KEY) return 'ably'
  return 'none'
}

export const features = {
  database: Boolean(env.DATABASE_URL),
  storage: Boolean((env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY) || env.BLOB_READ_WRITE_TOKEN),
  storageProvider: (env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY ? 's3' : env.BLOB_READ_WRITE_TOKEN ? 'vercel-blob' : 'local') as 's3' | 'vercel-blob' | 'local',
  email: Boolean(env.POSTMARK_SERVER_TOKEN && env.POSTMARK_FROM_EMAIL),
  inboundEmail: Boolean(env.POSTMARK_INBOUND_WEBHOOK_USER && env.POSTMARK_INBOUND_WEBHOOK_PASSWORD),
  realtime: realtime(),
  payments: Boolean(env.PAYSTACK_SECRET_KEY),
  turnstile: Boolean(env.TURNSTILE_SECRET_KEY && env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  indexNow: Boolean(env.INDEXNOW_KEY),
  dailyJob: Boolean(env.CRON_SECRET),
}

/** Human-readable list for the admin "setup" notices. */
export function missingFeatures(): { key: keyof typeof features; label: string; vars: string }[] {
  const list: { key: keyof typeof features; label: string; vars: string }[] = []
  if (!features.storage) list.push({ key: 'storage', label: 'Photo storage (Vercel Blob or Cloudflare R2): uploads are saved on this server only, and are lost on Vercel', vars: 'BLOB_READ_WRITE_TOKEN (Vercel Storage tab) or S3_*' })
  if (!features.email) list.push({ key: 'email', label: 'Email (Postmark): emails are logged, not sent', vars: 'POSTMARK_SERVER_TOKEN, POSTMARK_FROM_EMAIL' })
  if (!features.inboundEmail) list.push({ key: 'inboundEmail', label: 'Guest email replies (Postmark inbound): replies will not reach the inbox', vars: 'POSTMARK_INBOUND_WEBHOOK_USER, POSTMARK_INBOUND_WEBHOOK_PASSWORD, POSTMARK_INBOUND_ADDRESS' })
  if (features.realtime === 'none') list.push({ key: 'realtime', label: 'Real-time chat (Pusher or Ably): chat refreshes every few seconds instead', vars: 'PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER or ABLY_API_KEY' })
  if (!features.payments) list.push({ key: 'payments', label: 'Payments (Paystack: M-Pesa + card): payment links are disabled', vars: 'PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY' })
  if (!features.dailyJob) list.push({ key: 'dailyJob', label: 'Daily automation (balance and eTA reminders, quote expiry, review requests): not running', vars: 'CRON_SECRET (any long random text)' })
  if (!features.turnstile) list.push({ key: 'turnstile', label: 'Cloudflare Turnstile (optional extra spam check)', vars: 'TURNSTILE_SECRET_KEY, NEXT_PUBLIC_TURNSTILE_SITE_KEY' })
  return list
}
