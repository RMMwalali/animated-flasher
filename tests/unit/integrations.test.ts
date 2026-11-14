import { describe, expect, it } from 'vitest'
import { otherWaysToPayLines } from '@/components/booking/OtherWaysToPay'
import { featuresOf, mergeConfig } from '@/lib/config'
import { decryptSecret, encryptSecret, isMasked, maskSecret } from '@/lib/secrets'
import { tiktokIdFrom } from '@/lib/social/tiktok'

describe('secret storage', () => {
  const S = 'test-secret-for-unit-tests'
  it('round-trips and never stores the plain key', () => {
    const enc = encryptSecret('sk_live_abcdef123456', S)
    expect(enc).not.toContain('abcdef')
    expect(enc.startsWith('enc:v1:')).toBe(true)
    expect(decryptSecret(enc, S)).toBe('sk_live_abcdef123456')
    expect(encryptSecret('same', S)).not.toBe(encryptSecret('same', S)) // random IV
  })
  it('fails closed with the wrong secret or tampered data', () => {
    const enc = encryptSecret('sk_live_abcdef123456', S)
    expect(decryptSecret(enc, 'another-secret')).toBeNull()
    expect(decryptSecret(enc.slice(0, -4) + 'AAAA', S)).toBeNull()
  })
  it('masks to the last four characters', () => {
    expect(maskSecret('sk_live_abcdef123456')).toBe('••••••••3456')
    expect(isMasked(maskSecret('xyz12345'))).toBe(true)
    expect(maskSecret(null)).toBe('')
  })
})

describe('mergeConfig', () => {
  const stored = { paystack: { secretKey: 'sk_test_stored', publicKey: 'pk_test_stored' }, postmark: { serverToken: 'pm-stored', fromEmail: 'hello@ngina.example' }, realtime: { provider: 'ably', ablyApiKey: 'ably:key' }, analytics: { vercel: false, ga4Id: 'G-STORED' } }
  it('uses admin values when the environment is empty', () => {
    const c = mergeConfig({}, stored)
    expect(c.paystack.secretKey).toBe('sk_test_stored')
    expect(c.postmark.messageStream).toBe('outbound')
    expect(c.realtime.provider).toBe('ably')
    expect(c.analytics).toMatchObject({ vercel: false, ga4Id: 'G-STORED' })
    expect(featuresOf(c)).toMatchObject({ payments: true, email: true, realtime: 'ably', googleReviews: false })
  })
  it('lets the environment win', () => {
    const c = mergeConfig({ PAYSTACK_SECRET_KEY: 'sk_live_env', POSTMARK_FROM_EMAIL: 'env@ngina.example' }, stored)
    expect(c.paystack.secretKey).toBe('sk_live_env')
    expect(c.paystack.publicKey).toBe('pk_test_stored')
    expect(c.postmark.fromEmail).toBe('env@ngina.example')
  })
  it('falls back to no real-time when the chosen provider has no keys', () => {
    expect(mergeConfig({}, { realtime: { provider: 'pusher', pusherKey: 'k' } }).realtime.provider).toBe('none')
    expect(mergeConfig({}, {}).analytics.vercel).toBe(true)
  })
})

describe('tiktokIdFrom', () => {
  it('reads the video id from full links only', () => {
    expect(tiktokIdFrom('https://www.tiktok.com/@ngina/video/7312345678901234567?lang=en')).toBe('7312345678901234567')
    expect(tiktokIdFrom('https://vm.tiktok.com/ZMabc123/')).toBeNull()
  })
})

describe('otherWaysToPayLines', () => {
  it('lists M-Pesa and bank details with the booking reference', () => {
    const lines = otherWaysToPayLines({ mpesa: { paybill: '123456' }, bankAccounts: [{ label: 'US$ account', currency: 'USD', bankName: 'Sample Bank', accountName: 'Ngina Trails and Safaris', accountNumber: '0001', swift: 'SAMPKENA' }] }, 'NG-ABC123')
    expect(lines[0]).toBe('Other ways to pay:')
    expect(lines.join('\n')).toContain('Paybill 123456, account NG-ABC123')
    expect(lines.join('\n')).toContain('SWIFT SAMPKENA · Reference NG-ABC123')
  })
  it('is empty when nothing is set', () => {
    expect(otherWaysToPayLines({}, 'NG-1')).toEqual([])
  })
})
