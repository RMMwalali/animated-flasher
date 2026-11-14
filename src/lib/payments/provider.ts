import { createHmac, timingSafeEqual } from 'node:crypto'
import { getConfig } from '@/lib/config'
import type { Currency } from '@/lib/pricing'
import { fromSubunit, toSubunit } from './math'

export type InitArgs = {
  amount: number
  currency: Currency
  email: string
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}
export type VerifyResult = {
  status: 'success' | 'failed' | 'abandoned' | 'pending'
  amount: number
  currency: Currency
  method?: 'card' | 'mobile_money' | 'bank'
  paidAt?: string
  fees?: number
  providerRef?: string
  raw: unknown
}

/** Payment provider interface: Paystack today, M-Pesa Daraja can be added later. */
export interface PaymentProvider {
  name: 'paystack' | 'mpesa'
  configured(): Promise<boolean>
  initialize(a: InitArgs): Promise<{ url: string; providerRef: string }>
  verify(reference: string): Promise<VerifyResult>
  verifyWebhookSignature(rawBody: string, signature: string | null): Promise<boolean>
}

const API = 'https://api.paystack.co'

async function secretKey(): Promise<string> {
  const k = (await getConfig()).paystack.secretKey
  if (!k) throw new Error('Payments are not set up yet (Paystack secret key missing).')
  return k
}

export function paystackSignatureValid(rawBody: string, signature: string | null, secret: string | undefined): boolean {
  if (!signature || !secret) return false
  const expected = createHmac('sha512', secret).update(rawBody).digest('hex')
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(signature, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

const mapChannel = (c?: string): VerifyResult['method'] =>
  c === 'mobile_money' ? 'mobile_money' : c === 'card' ? 'card' : c === 'bank' || c === 'bank_transfer' ? 'bank' : undefined

export const paystack: PaymentProvider = {
  name: 'paystack',
  configured: async () => Boolean((await getConfig()).paystack.secretKey),
  async initialize(a) {
    const res = await fetch(`${API}/transaction/initialize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${await secretKey()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: a.email,
        amount: toSubunit(a.amount, a.currency),
        currency: a.currency,
        reference: a.reference,
        callback_url: a.callbackUrl,
        metadata: a.metadata,
        // M-Pesa is only available for KES
        channels: a.currency === 'KES' ? ['mobile_money', 'card'] : ['card'],
      }),
      signal: AbortSignal.timeout(10000),
    })
    const json = (await res.json()) as { status: boolean; message: string; data?: { authorization_url: string; reference: string } }
    if (!res.ok || !json.status || !json.data) throw new Error(`Paystack: ${json.message}`)
    return { url: json.data.authorization_url, providerRef: json.data.reference }
  },
  async verify(reference) {
    const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${await secretKey()}` },
      signal: AbortSignal.timeout(10000),
    })
    const json = (await res.json()) as {
      status: boolean; message: string
      data?: { status: string; amount: number; currency: Currency; channel?: string; paid_at?: string; fees?: number; id?: number }
    }
    if (!res.ok || !json.status || !json.data) throw new Error(`Paystack: ${json.message}`)
    const d = json.data
    const status = d.status === 'success' ? 'success' : d.status === 'failed' ? 'failed' : d.status === 'abandoned' ? 'abandoned' : 'pending'
    return {
      status, amount: fromSubunit(d.amount, d.currency), currency: d.currency, method: mapChannel(d.channel),
      paidAt: d.paid_at, fees: d.fees != null ? fromSubunit(d.fees, d.currency) : undefined, providerRef: d.id ? String(d.id) : undefined, raw: d,
    }
  },
  verifyWebhookSignature: async (raw, sig) => paystackSignatureValid(raw, sig, (await getConfig()).paystack.secretKey),
}

export const paymentProvider = (): PaymentProvider => paystack
