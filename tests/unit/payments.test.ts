import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { bookingMoneyState, creditedAmount, fromSubunit, nextAmountDue, toSubunit } from '@/lib/payments/math'
import { paystackSignatureValid } from '@/lib/payments/provider'

describe('payment maths', () => {
  it('converts to and from Paystack subunits', () => {
    expect(toSubunit(1234.56, 'USD')).toBe(123456)
    expect(toSubunit(5000, 'KES')).toBe(500000)
    expect(fromSubunit(500000, 'KES')).toBe(5000)
  })

  it('moves a booking from deposit to paid', () => {
    const b = { total: 2000, depositDue: 600, currency: 'USD' as const }
    expect(bookingMoneyState(b, []).status).toBe('pending_deposit')
    expect(bookingMoneyState(b, [{ amount: 300, status: 'success' }]).status).toBe('pending_deposit')
    expect(bookingMoneyState(b, [{ amount: 600, status: 'success' }])).toEqual({ amountPaid: 600, balanceDue: 1400, status: 'deposit_paid' })
    expect(bookingMoneyState(b, [{ amount: 600, status: 'success' }, { amount: 1400, status: 'success' }]).status).toBe('paid')
  })

  it('ignores pending/failed payments', () => {
    const s = bookingMoneyState({ total: 1000, depositDue: 300, currency: 'USD' }, [{ amount: 1000, status: 'pending' }, { amount: 1000, status: 'failed' }])
    expect(s.amountPaid).toBe(0)
  })

  it('credits other-currency payments at the agreed rate only', () => {
    const b = { total: 1000, depositDue: 300, currency: 'USD' as const }
    expect(bookingMoneyState(b, [{ amount: 39000, currency: 'KES', status: 'success', credited: 300 }]).status).toBe('deposit_paid')
    expect(bookingMoneyState(b, [{ amount: 39000, currency: 'KES', status: 'success' }]).amountPaid).toBe(0)
    expect(creditedAmount({ amount: 39000, currency: 'KES', exchangeRate: 130 }, 'USD')).toBe(300)
    expect(creditedAmount({ amount: 39000, currency: 'KES' }, 'USD')).toBeNull()
    expect(creditedAmount({ amount: 100, currency: 'USD', exchangeRate: 130 }, 'KES')).toBe(13000)
  })

  it('works out the next amount due', () => {
    const b = { total: 2000, depositDue: 600, currency: 'USD' as const }
    expect(nextAmountDue(b, 0, 'deposit')).toBe(600)
    expect(nextAmountDue(b, 600, 'deposit')).toBe(0)
    expect(nextAmountDue(b, 600, 'balance')).toBe(1400)
  })

  it('verifies Paystack webhook signatures (HMAC SHA-512)', () => {
    const secret = 'sk_test_123'
    const body = JSON.stringify({ event: 'charge.success', data: { reference: 'PAY-1' } })
    const sig = createHmac('sha512', secret).update(body).digest('hex')
    expect(paystackSignatureValid(body, sig, secret)).toBe(true)
    expect(paystackSignatureValid(body + ' ', sig, secret)).toBe(false)
    expect(paystackSignatureValid(body, 'deadbeef', secret)).toBe(false)
    expect(paystackSignatureValid(body, null, secret)).toBe(false)
    expect(paystackSignatureValid(body, sig, undefined)).toBe(false)
  })
})
