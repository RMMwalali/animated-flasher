import type { Currency } from '@/lib/pricing'
import { roundMoney } from '@/lib/pricing'

/** Paystack amounts are in the currency's subunit (cents / KES cents). */
export const toSubunit = (amount: number, _currency: Currency) => Math.round(amount * 100)
export const fromSubunit = (amount: number, _currency: Currency) => amount / 100

export type PaymentLike = { amount: number; status: string; currency?: string | null; credited?: number | null }

export type BookingMoneyState = {
  amountPaid: number
  balanceDue: number
  status: 'pending_deposit' | 'deposit_paid' | 'paid'
}

/**
 * Money state of a booking from its payments. Only successful payments
 * count. A payment in another currency counts by its `credited` amount
 * (converted at the rate the agent entered); without one it is ignored.
 */
export function bookingMoneyState(
  booking: { total: number; depositDue?: number | null; currency: Currency },
  payments: PaymentLike[],
): BookingMoneyState {
  const credit = (p: PaymentLike) =>
    !p.currency || p.currency === booking.currency ? p.amount : (p.credited ?? 0)
  const paid = payments.filter((p) => p.status === 'success').reduce((a, p) => a + credit(p), 0)
  const amountPaid = roundMoney(paid, booking.currency)
  const balanceDue = roundMoney(Math.max(0, booking.total - amountPaid), booking.currency)
  const deposit = booking.depositDue ?? 0
  let status: BookingMoneyState['status'] = 'pending_deposit'
  if (amountPaid >= booking.total && booking.total > 0) status = 'paid'
  else if (amountPaid > 0 && amountPaid >= deposit) status = 'deposit_paid'
  return { amountPaid, balanceDue, status }
}

/** How much the next payment link should ask for. */
export function nextAmountDue(
  booking: { total: number; depositDue?: number | null; currency: Currency },
  amountPaid: number,
  kind: 'deposit' | 'balance',
): number {
  if (kind === 'deposit') return roundMoney(Math.max(0, (booking.depositDue ?? 0) - amountPaid), booking.currency)
  return roundMoney(Math.max(0, booking.total - amountPaid), booking.currency)
}

/** Booking-currency value of a payment made in another currency. */
export function creditedAmount(
  payment: { amount: number; currency: Currency; exchangeRate?: number | null },
  bookingCurrency: Currency,
): number | null {
  if (payment.currency === bookingCurrency) return payment.amount
  const rate = payment.exchangeRate
  if (!rate || rate <= 0) return null
  // rate is always "KES per 1 US$"
  const v = payment.currency === 'KES' ? payment.amount / rate : payment.amount * rate
  return roundMoney(v, bookingCurrency)
}
