import { NextResponse, type NextRequest } from 'next/server'
import { captureEnquiry } from '@/lib/crm/leads'
import { getPayloadSafe } from '@/lib/content'
import { enquirySchema } from '@/lib/forms/schemas'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { spamSignals, verifyTurnstile } from '@/lib/security/spam'

export const dynamic = 'force-dynamic'

/** Public endpoint behind every enquiry CTA. */
export async function POST(req: NextRequest) {
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ ok: false, error: 'Unsupported content type' }, { status: 415 })
  }
  const payload = await getPayloadSafe()
  const ip = clientIp(req.headers)
  const rl = await rateLimit(payload, `enquiry:${ip}`, Number(process.env.ENQUIRY_RATE_LIMIT ?? 5), 10 * 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: 'Too many enquiries from this connection. Please wait a few minutes or email us.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } })
  }
  const raw = await req.json().catch(() => null)
  const parsed = enquirySchema.safeParse(raw)
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? 'form')
      if (k === 'website') return NextResponse.json({ ok: true }) // honeypot: pretend success
      errors[k] ??= issue.message
    }
    return NextResponse.json({ ok: false, errors }, { status: 422 })
  }
  const input = parsed.data
  const signals = spamSignals(input)
  if (signals.length) {
    // pretend success so bots learn nothing
    console.info(`[enquiry] dropped as spam (${signals.join(',')}) from ${ip}`)
    return NextResponse.json({ ok: true })
  }
  if (!(await verifyTurnstile(input.turnstileToken, ip))) {
    return NextResponse.json({ ok: false, error: 'Please complete the security check.' }, { status: 400 })
  }
  if (!payload) {
    return NextResponse.json({ ok: false, error: 'Our system is temporarily unavailable. Please email us directly.' }, { status: 503 })
  }
  try {
    const res = await captureEnquiry(payload, input)
    return NextResponse.json({ ok: true, ref: res.leadId })
  } catch (e) {
    payload.logger.error(`enquiry failed: ${(e as Error).message}`)
    return NextResponse.json({ ok: false, error: 'Something went wrong on our side. Please try again or email us.' }, { status: 500 })
  }
}
