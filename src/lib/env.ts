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

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.warn('[env] invalid environment variables:', parsed.error.flatten().fieldErrors)
}
export const env = parsed.success ? parsed.data : schema.parse({})

const realtime = (): 'pusher' | 'ably' | 'none' => {
  if (env.REALTIME_PROVIDER) return env.REALTIME_PROVIDER
  if (env.PUSHER_APP_ID && env.PUSHER_KEY && env.PUSHER_SECRET) return 'pusher'
  if (env.ABLY_API_KEY) return 'ably'
  return 'none'
}

export const features = {
  database: Boolean(env.DATABASE_URL),
  storage: Boolean(env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY),
  email: Boolean(env.POSTMARK_SERVER_TOKEN && env.POSTMARK_FROM_EMAIL),
  inboundEmail: Boolean(env.POSTMARK_INBOUND_WEBHOOK_USER && env.POSTMARK_INBOUND_WEBHOOK_PASSWORD),
  realtime: realtime(),
  payments: Boolean(env.PAYSTACK_SECRET_KEY),
  turnstile: Boolean(env.TURNSTILE_SECRET_KEY && env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  indexNow: Boolean(env.INDEXNOW_KEY),
}

/** Human-readable list for the admin "setup" notices. */
export function missingFeatures(): { key: keyof typeof features; label: string; vars: string }[] {
  const list: { key: keyof typeof features; label: string; vars: string }[] = []
  if (!features.storage) list.push({ key: 'storage', label: 'Photo storage (Cloudflare R2): uploads are saved on this server only', vars: 'S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL' })
  if (!features.email) list.push({ key: 'email', label: 'Email (Postmark): emails are logged, not sent', vars: 'POSTMARK_SERVER_TOKEN, POSTMARK_FROM_EMAIL' })
  if (!features.inboundEmail) list.push({ key: 'inboundEmail', label: 'Guest email replies (Postmark inbound): replies will not reach the inbox', vars: 'POSTMARK_INBOUND_WEBHOOK_USER, POSTMARK_INBOUND_WEBHOOK_PASSWORD, POSTMARK_INBOUND_ADDRESS' })
  if (features.realtime === 'none') list.push({ key: 'realtime', label: 'Real-time chat (Pusher or Ably): chat refreshes every few seconds instead', vars: 'PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER or ABLY_API_KEY' })
  if (!features.payments) list.push({ key: 'payments', label: 'Payments (Paystack: M-Pesa + card): payment links are disabled', vars: 'PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY' })
  if (!features.turnstile) list.push({ key: 'turnstile', label: 'Cloudflare Turnstile (optional extra spam check)', vars: 'TURNSTILE_SECRET_KEY, NEXT_PUBLIC_TURNSTILE_SITE_KEY' })
  return list
}
