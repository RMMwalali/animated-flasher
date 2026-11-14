import type { PayloadRequest } from 'payload'
import { env } from '@/lib/env'
import { sendEmail } from '@/lib/email'
import { formatMoney, type Currency } from '@/lib/pricing'
import { paymentReference } from '@/lib/ids'
import { bookingMoneyState, creditedAmount, nextAmountDue } from './math'
import { paymentProvider, type VerifyResult } from './provider'

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number))
const LOCKED = new Set(['travelling', 'completed', 'cancelled'])

/** Recalculate a booking's paid amount / status after a payment changes. */
export async function syncBookingPayments(req: PayloadRequest, payment: any, previous?: any) {
  const bookingId = idOf(payment.booking)
  const booking = await req.payload.findByID({ collection: 'bookings', id: bookingId, depth: 0, req, overrideAccess: true })
  const { docs } = await req.payload.find({ collection: 'payments', where: { booking: { equals: bookingId } }, limit: 500, depth: 0, req, overrideAccess: true })
  const state = bookingMoneyState({ total: booking.total, depositDue: booking.depositDue, currency: booking.currency as Currency }, docs)
  const status = LOCKED.has(booking.status) ? booking.status : state.status
  await req.payload.update({
    collection: 'bookings', id: bookingId, req, overrideAccess: true,
    data: { amountPaid: state.amountPaid, balanceDue: state.balanceDue, status },
  })
  if (payment.status === 'success' && previous?.status !== 'success') {
    await req.payload.create({
      collection: 'activities', req, overrideAccess: true,
      data: { type: 'payment', summary: `Payment received: ${formatMoney(payment.amount, payment.currency)} (${payment.kind})`, contact: idOf(booking.contact), lead: booking.lead ? idOf(booking.lead) : undefined },
    })
    if (!req.context?.seeding) await sendReceipt(req, payment, booking, state.balanceDue).catch((e) => req.payload.logger.warn(`receipt failed: ${e}`))
  }
}

async function sendReceipt(req: PayloadRequest, payment: any, booking: any, balance: number) {
  const contact = await req.payload.findByID({ collection: 'contacts', id: idOf(booking.contact), depth: 0, req, overrideAccess: true })
  if (!contact.email) return
  const receiptNumber = payment.receiptNumber ?? `R-${payment.reference}`
  if (!payment.receiptNumber) {
    await req.payload.update({ collection: 'payments', id: payment.id, data: { receiptNumber }, req, overrideAccess: true, context: { skipPaymentHooks: true } })
  }
  await sendEmail({
    to: contact.email,
    subject: `Receipt ${receiptNumber}: ${booking.title}`,
    tag: 'receipt',
    content: {
      heading: `Thank you, ${contact.firstName}`,
      paragraphs: ['We have received your payment. This email is your receipt.'],
      facts: [
        ['Receipt', receiptNumber],
        ['Booking', `${booking.reference} · ${booking.title}`],
        ['Paid', formatMoney(payment.amount, payment.currency)],
        ['Method', payment.method === 'mobile_money' ? 'M-Pesa' : payment.method === 'card' ? 'Card' : String(payment.method ?? payment.provider)],
        ['Date', new Date(payment.paidAt ?? Date.now()).toLocaleDateString('en-GB', { dateStyle: 'long' })],
        ['Balance remaining', formatMoney(balance, booking.currency)],
      ],
      button: booking.portalToken ? { label: 'Open my trip page', href: `${env.SITE_URL}/trip/${booking.portalToken}` } : undefined,
    },
  })
}

/** Create a pending payment + Paystack link for a booking's deposit or balance. */
export async function createPaymentLink(
  req: PayloadRequest,
  args: { bookingId: number; kind: 'deposit' | 'balance'; currency?: Currency; exchangeRate?: number; amount?: number },
) {
  const provider = paymentProvider()
  if (!provider.configured()) throw new Error('Payments are not set up yet (PAYSTACK_SECRET_KEY missing).')
  const booking = await req.payload.findByID({ collection: 'bookings', id: args.bookingId, depth: 1, req, overrideAccess: true })
  const contact = booking.contact as any
  if (!contact?.email) throw new Error('This booking\'s contact has no email address.')
  const bookingCurrency = booking.currency as Currency
  const dueInBooking = args.amount ?? nextAmountDue({ total: booking.total, depositDue: booking.depositDue, currency: bookingCurrency }, booking.amountPaid ?? 0, args.kind)
  if (dueInBooking <= 0) throw new Error(`Nothing left to pay for the ${args.kind}.`)
  const currency = args.currency ?? bookingCurrency
  let amount = dueInBooking
  if (currency !== bookingCurrency) {
    if (!args.exchangeRate) throw new Error('Enter an exchange rate (KES per 1 US$) to charge in a different currency.')
    amount = currency === 'KES' ? Math.round(dueInBooking * args.exchangeRate) : Math.round((dueInBooking / args.exchangeRate) * 100) / 100
  }
  const reference = paymentReference()
  const { url, providerRef } = await provider.initialize({
    amount, currency, email: contact.email, reference,
    callbackUrl: `${env.SITE_URL}/pay/complete?reference=${reference}`,
    metadata: { bookingId: booking.id, bookingReference: booking.reference, kind: args.kind },
  })
  return req.payload.create({
    collection: 'payments', req, overrideAccess: true,
    data: {
      reference, booking: booking.id, contact: contact.id, kind: args.kind, amount, currency, status: 'pending', provider: provider.name,
      exchangeRate: args.exchangeRate, credited: creditedAmount({ amount, currency, exchangeRate: args.exchangeRate }, bookingCurrency) ?? undefined,
      payUrl: url, providerRef,
    },
  })
}

/** Verify with the provider and record the result. Idempotent. */
export async function verifyAndRecord(req: PayloadRequest, reference: string): Promise<VerifyResult | null> {
  const { docs } = await req.payload.find({ collection: 'payments', where: { reference: { equals: reference } }, limit: 1, depth: 0, req, overrideAccess: true })
  const payment = docs[0]
  if (!payment) return null
  if (payment.status === 'success') return { status: 'success', amount: payment.amount, currency: payment.currency as Currency, raw: null }
  const result = await paymentProvider().verify(reference)
  // never trust an amount lower than asked
  const ok = result.status === 'success' && result.currency === payment.currency && result.amount + 0.001 >= payment.amount
  await req.payload.update({
    collection: 'payments', id: payment.id, req, overrideAccess: true,
    data: {
      status: ok ? 'success' : result.status === 'success' ? 'failed' : result.status,
      method: result.method, paidAt: result.paidAt, fees: result.fees, raw: result.raw as any,
      notes: result.status === 'success' && !ok ? `Amount/currency mismatch: got ${result.amount} ${result.currency}` : payment.notes,
    },
  })
  return result
}
