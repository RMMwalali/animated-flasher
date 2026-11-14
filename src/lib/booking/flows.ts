/**
 * The guest booking journey: quote sent → viewed → accepted (booking created)
 * → deposit → balance → travel → completed. Everything here is called from
 * API routes, admin buttons or the daily job; nothing trusts the browser.
 */
import { createLocalReq, type Payload, type PayloadRequest } from 'payload'
import { sendEmail } from '@/lib/email'
import { env } from '@/lib/env'
import { formatMoney, type Currency } from '@/lib/pricing'
import { notifyTeam } from '@/lib/crm/notify'
import { createPaymentLink } from '@/lib/payments/service'
import { paymentProvider } from '@/lib/payments/provider'
import { processReviewRequests } from '@/lib/crm/reviews'
import { dueActions, nextPayment, quoteState } from './rules'

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number))
const longDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi' }) : '-')

export const quoteUrl = (token: string) => `${env.SITE_URL}/quote/${token}`
export const tripUrl = (token: string) => `${env.SITE_URL}/trip/${token}`

export class GuestError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}

export const localReq = (payload: Payload) => createLocalReq({}, payload)

function signatureOf(user: any): string {
  if (!user) return 'The Ngina Trails and Safaris team\nDiani Beach, Kenya'
  return user.signature || [user.name, user.title, 'Ngina Trails and Safaris · Diani Beach, Kenya'].filter(Boolean).join('\n')
}

// ---------------------------------------------------------------- quotes

/** Email the quote to the guest with their private link. */
export async function sendQuoteToGuest(req: PayloadRequest, quoteId: number | string) {
  const quote = await req.payload.findByID({ collection: 'quotes', id: quoteId, depth: 1, req, overrideAccess: true })
  const contact = quote.contact as any
  if (!contact?.email) throw new GuestError('This quote\'s contact has no email address.')
  if (!quote.total || quote.total <= 0) throw new GuestError('Add at least one price line before sending.')
  if (quote.status === 'accepted') throw new GuestError('This quote has already been accepted.')
  const data: Record<string, unknown> = { status: 'sent', sentAt: new Date().toISOString() }
  // re-sending an expired quote gives the guest another 14 days
  if (quoteState({ ...quote, status: 'sent' }) === 'expired' || !quote.validUntil) {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    data.validUntil = d.toISOString()
  }
  const updated = await req.payload.update({ collection: 'quotes', id: quote.id, data, req, overrideAccess: true })
  const currency = quote.currency as Currency
  const url = quoteUrl(updated.acceptToken!)
  const res = await sendEmail({
    to: contact.email,
    subject: `Your trip plan: ${quote.title} (${quote.number})`,
    tag: 'quote',
    replyTo: (req.user as any)?.email,
    content: {
      preheader: `Your plan and price for ${quote.title}, ready to review.`,
      heading: `Jambo ${contact.firstName},`,
      paragraphs: [
        `Here is your plan for ${quote.title}. Open it to see the day-by-day plan, what is included and the price. If it looks right, you can accept it online and we will confirm your booking.`,
        'Want to change something? Just reply to this email.',
      ],
      facts: [
        ['Quote', String(quote.number)],
        ['Starting', longDate(quote.startDate)],
        ['Travellers', `${quote.adults ?? 0} adult${quote.adults === 1 ? '' : 's'}${quote.children ? `, ${quote.children} child${quote.children === 1 ? '' : 'ren'}` : ''}`],
        ['Total', formatMoney(quote.total, currency)],
        ['Deposit to confirm', formatMoney(quote.deposit, currency)],
        ['Valid until', longDate((data.validUntil as string) ?? quote.validUntil)],
      ],
      button: { label: 'View your trip plan', href: url },
      signature: signatureOf(req.user),
      footerNote: 'This link is private to you. Please do not share it.',
    },
  })
  if (res.status === 'failed') throw new GuestError(`The email could not be sent: ${res.error}`, 502)
  return { url, email: res.status }
}

export async function findQuoteByToken(payload: Payload, token: string, depth = 2) {
  if (!token || token.length < 16) return null
  const { docs } = await payload.find({ collection: 'quotes', where: { acceptToken: { equals: token } }, limit: 1, depth, overrideAccess: true })
  return docs[0] ?? null
}

/** First time the guest opens the link. */
export async function markQuoteViewed(payload: Payload, quote: any) {
  if (quote.status !== 'sent') return
  await payload.update({ collection: 'quotes', id: quote.id, data: { status: 'viewed', viewedAt: new Date().toISOString() }, overrideAccess: true }).catch(() => undefined)
}

/** Guest accepts online: creates the booking (see hooks/quotes) and emails the confirmation. */
export async function acceptQuote(payload: Payload, token: string, name: string) {
  const quote = await findQuoteByToken(payload, token, 0)
  if (!quote) throw new GuestError('We could not find this quote.', 404)
  const state = quoteState(quote)
  if (state === 'accepted') {
    const booking = quote.booking ? await payload.findByID({ collection: 'bookings', id: idOf(quote.booking), depth: 0, overrideAccess: true }) : null
    if (booking?.portalToken) return { tripUrl: tripUrl(booking.portalToken), already: true }
    throw new GuestError('This quote has already been accepted.', 409)
  }
  if (state === 'expired') throw new GuestError('This quote has expired. Reply to our email and we will send you an updated one.', 410)
  if (state !== 'open') throw new GuestError('This quote cannot be accepted yet.', 409)
  const clean = name.replace(/\s+/g, ' ').trim().slice(0, 120)
  if (clean.length < 2) throw new GuestError('Please type your full name to accept.')

  const req = await localReq(payload)
  await payload.update({
    collection: 'quotes', id: quote.id, req, overrideAccess: true,
    data: { status: 'accepted', acceptedAt: new Date().toISOString(), acceptedName: clean },
  })
  const fresh = await payload.findByID({ collection: 'quotes', id: quote.id, depth: 0, req, overrideAccess: true })
  if (!fresh.booking) throw new GuestError('Your acceptance was saved, but the booking could not be created. We will be in touch.', 500)
  const booking = await payload.findByID({ collection: 'bookings', id: idOf(fresh.booking), depth: 0, req, overrideAccess: true })
  await sendBookingConfirmation(req, booking.id).catch((e) => payload.logger.warn(`confirmation email failed: ${e}`))
  await notifyTeam(req, `Quote accepted: ${quote.title}`, [`${clean} accepted quote ${quote.number} online. Booking ${booking.reference} is waiting for the deposit.`], `${env.SITE_URL}/admin/collections/bookings/${booking.id}`).catch(() => undefined)
  return { tripUrl: tripUrl(booking.portalToken!), already: false }
}

export async function declineQuote(payload: Payload, token: string, reason: string) {
  const quote = await findQuoteByToken(payload, token, 0)
  if (!quote) throw new GuestError('We could not find this quote.', 404)
  const state = quoteState(quote)
  if (state !== 'open' && state !== 'expired') throw new GuestError('This quote can no longer be declined.', 409)
  const req = await localReq(payload)
  const why = reason.trim().slice(0, 1000)
  await payload.update({ collection: 'quotes', id: quote.id, req, overrideAccess: true, data: { status: 'declined', declinedAt: new Date().toISOString(), declineReason: why || undefined } })
  await notifyTeam(req, `Quote declined: ${quote.title}`, [`Quote ${quote.number} was declined online.`, why ? `Reason: “${why}”` : 'No reason was given.'], `${env.SITE_URL}/admin/collections/quotes/${quote.id}`).catch(() => undefined)
}

// ---------------------------------------------------------------- bookings

export async function findBookingByToken(payload: Payload, token: string, depth = 2) {
  if (!token || token.length < 16) return null
  const { docs } = await payload.find({ collection: 'bookings', where: { portalToken: { equals: token } }, limit: 1, depth, overrideAccess: true })
  return docs[0] ?? null
}

async function bookingWithContact(req: PayloadRequest, bookingId: number | string) {
  const booking = await req.payload.findByID({ collection: 'bookings', id: bookingId, depth: 1, req, overrideAccess: true })
  const contact = booking.contact as any
  if (!contact?.email) throw new GuestError('This booking\'s contact has no email address.')
  let token = booking.portalToken
  if (!token) {
    // bookings made before guest pages existed
    const { token: make } = await import('@/lib/ids')
    token = make()
    await req.payload.update({ collection: 'bookings', id: booking.id, data: { portalToken: token }, req, overrideAccess: true })
  }
  return { booking: { ...booking, portalToken: token }, contact }
}

/** "Your booking is confirmed (pending deposit)" with the trip page link. */
export async function sendBookingConfirmation(req: PayloadRequest, bookingId: number | string) {
  const { booking, contact } = await bookingWithContact(req, bookingId)
  const currency = booking.currency as Currency
  const depositLeft = Math.max(0, (booking.depositDue ?? 0) - (booking.amountPaid ?? 0))
  const res = await sendEmail({
    to: contact.email,
    subject: `Booking ${booking.reference}: ${booking.title}`,
    tag: 'booking-confirmation',
    content: {
      preheader: `Your trip page and next steps for ${booking.title}.`,
      heading: `Asante, ${contact.firstName}!`,
      paragraphs: [
        depositLeft > 0
          ? `Thank you for booking ${booking.title}. Your dates are held for you: pay the deposit from your trip page to confirm them.`
          : `Thank you for booking ${booking.title}. Your trip is confirmed.`,
        'Your trip page has your plan, payments, balance and a checklist for before you fly (including the Kenya eTA). Keep this email: the link is private to you.',
      ],
      facts: [
        ['Booking', String(booking.reference)],
        ['Dates', `${longDate(booking.startDate)}${booking.endDate ? ` – ${longDate(booking.endDate)}` : ''}`],
        ['Travellers', String(booking.pax ?? '-')],
        ['Total', formatMoney(booking.total, currency)],
        ...(depositLeft > 0 ? ([['Deposit to confirm', formatMoney(depositLeft, currency)]] as [string, string][]) : []),
        ...(booking.balanceDueDate ? ([['Balance due by', longDate(booking.balanceDueDate)]] as [string, string][]) : []),
      ],
      button: { label: depositLeft > 0 ? 'Open my trip page and pay the deposit' : 'Open my trip page', href: tripUrl(booking.portalToken) },
      signature: signatureOf(null),
      footerNote: 'Questions? Just reply to this email.',
    },
  })
  if (res.status === 'failed') throw new GuestError(`The email could not be sent: ${res.error}`, 502)
  await req.payload.update({ collection: 'bookings', id: booking.id, req, overrideAccess: true, data: { emails: { ...(booking.emails ?? {}), confirmationSentAt: new Date().toISOString() } } })
  return { url: tripUrl(booking.portalToken), email: res.status }
}

/**
 * Ask the guest to pay. In the booking currency the email points to the trip
 * page (which always makes a fresh Paystack link). In another currency (e.g.
 * KES for M-Pesa on a US$ booking) a link at the agent's exchange rate is made now.
 */
export async function requestPayment(req: PayloadRequest, bookingId: number | string, opts: { kind: 'deposit' | 'balance'; currency?: Currency; exchangeRate?: number }) {
  const { booking, contact } = await bookingWithContact(req, bookingId)
  const bookingCurrency = booking.currency as Currency
  let href = `${tripUrl(booking.portalToken)}#pay`
  let amountText: string
  if (opts.currency && opts.currency !== bookingCurrency) {
    const payment = await createPaymentLink(req, { bookingId: booking.id, kind: opts.kind, currency: opts.currency, exchangeRate: opts.exchangeRate })
    href = payment.payUrl!
    amountText = formatMoney(payment.amount, opts.currency)
  } else {
    const due = opts.kind === 'deposit' ? Math.max(0, (booking.depositDue ?? 0) - (booking.amountPaid ?? 0)) : Math.max(0, booking.total - (booking.amountPaid ?? 0))
    if (due <= 0) throw new GuestError(`Nothing left to pay for the ${opts.kind}.`)
    amountText = formatMoney(due, bookingCurrency)
  }
  const res = await sendEmail({
    to: contact.email,
    subject: `${opts.kind === 'deposit' ? 'Deposit' : 'Balance'} for booking ${booking.reference}`,
    tag: `payment-request-${opts.kind}`,
    replyTo: (req.user as any)?.email,
    content: {
      heading: `Jambo ${contact.firstName},`,
      paragraphs: [
        opts.kind === 'deposit'
          ? `To confirm ${booking.title}, please pay the deposit of ${amountText}.`
          : `The balance of ${amountText} for ${booking.title} is now due${booking.balanceDueDate ? ` (by ${longDate(booking.balanceDueDate)})` : ''}.`,
        opts.currency === 'KES' ? 'You can pay by M-Pesa or card.' : 'You can pay securely by card.',
      ],
      button: { label: `Pay ${amountText}`, href },
      signature: signatureOf(req.user),
      footerNote: 'Payments are processed securely by Paystack. We never see your card details.',
    },
  })
  if (res.status === 'failed') throw new GuestError(`The email could not be sent: ${res.error}`, 502)
  return { url: href, email: res.status }
}

/** The guest pressed "Pay" on their trip page. Returns the Paystack checkout URL. */
export async function startGuestPayment(payload: Payload, token: string, kind: 'deposit' | 'balance') {
  const booking = await findBookingByToken(payload, token, 0)
  if (!booking) throw new GuestError('We could not find this booking.', 404)
  const allowed = nextPayment({ status: booking.status, depositDue: booking.depositDue, amountPaid: booking.amountPaid, total: booking.total })
  if (!allowed) throw new GuestError('There is nothing to pay on this booking.', 409)
  if (kind === 'deposit' && allowed !== 'deposit') throw new GuestError('The deposit has already been paid.', 409)
  if (!paymentProvider().configured()) throw new GuestError('Online payment is not switched on yet. Please reply to your booking email and we will send you payment details.', 503)
  // a balance payment may be made instead of a deposit (paying in full)
  const req = await localReq(payload)
  // reuse a link made in the last 6 hours for the same payment
  const since = new Date(Date.now() - 6 * 3600e3).toISOString()
  const { docs } = await payload.find({
    collection: 'payments', limit: 1, depth: 0, overrideAccess: true, sort: '-createdAt',
    where: { and: [{ booking: { equals: booking.id } }, { kind: { equals: kind } }, { status: { equals: 'pending' } }, { currency: { equals: booking.currency } }, { createdAt: { greater_than: since } }] },
  })
  if (docs[0]?.payUrl) return { url: docs[0].payUrl }
  const payment = await createPaymentLink(req, { bookingId: booking.id, kind })
  return { url: payment.payUrl! }
}

// ---------------------------------------------------------------- daily job

export type DailyResult = { quotesExpired: number; balanceReminders: number; etaReminders: number; travelling: number; completed: number; reviews: { sent: number; reminded: number } }

export async function runDaily(payload: Payload, now = new Date()): Promise<DailyResult> {
  const req = await localReq(payload)
  const out: DailyResult = { quotesExpired: 0, balanceReminders: 0, etaReminders: 0, travelling: 0, completed: 0, reviews: { sent: 0, reminded: 0 } }

  const open = await payload.find({ collection: 'quotes', where: { status: { in: ['sent', 'viewed'] } }, limit: 500, depth: 0, overrideAccess: true })
  for (const q of open.docs) {
    if (quoteState(q, now) === 'expired') {
      await payload.update({ collection: 'quotes', id: q.id, data: { status: 'expired' }, req, overrideAccess: true })
      out.quotesExpired++
    }
  }

  const active = await payload.find({ collection: 'bookings', where: { status: { in: ['deposit_paid', 'paid', 'travelling'] } }, limit: 1000, depth: 1, overrideAccess: true })
  for (const b of active.docs) {
    const due = dueActions(b as any, now)
    try {
      if (due.balanceReminder) {
        await sendBalanceReminder(req, b)
        out.balanceReminders++
      }
      if (due.etaReminder) {
        await sendEtaReminder(req, b)
        out.etaReminders++
      }
      if (due.nextStatus) {
        await payload.update({ collection: 'bookings', id: b.id, data: { status: due.nextStatus }, req, overrideAccess: true })
        out[due.nextStatus]++
      }
    } catch (e) {
      payload.logger.warn(`daily job: booking ${b.reference}: ${(e as Error).message}`)
    }
  }

  out.reviews = await processReviewRequests(req)
  return out
}

/** Record an email as sent on the in-memory booking too, so later updates in the same run keep it. */
function markSent(b: any, key: 'balanceReminderSentAt' | 'etaReminderSentAt') {
  b.emails = { ...(b.emails ?? {}), [key]: new Date().toISOString() }
  return b.emails
}

async function sendBalanceReminder(req: PayloadRequest, b: any) {
  const contact = b.contact as any
  const token = b.portalToken
  if (!token || !contact?.email) return
  const currency = b.currency as Currency
  const res = await sendEmail({
    to: contact.email,
    subject: `Balance due for ${b.title} (${b.reference})`,
    tag: 'balance-reminder',
    content: {
      heading: `Jambo ${contact.firstName},`,
      paragraphs: [
        `A friendly reminder: the balance of ${formatMoney(b.balanceDue, currency)} for ${b.title} is due by ${longDate(b.balanceDueDate)}.`,
        'You can pay it securely from your trip page. If you have already paid by bank transfer, thank you: please ignore this email.',
      ],
      button: { label: 'Pay the balance', href: `${tripUrl(token)}#pay` },
      signature: signatureOf(null),
    },
  })
  if (res.status === 'failed') throw new Error(res.error)
  await req.payload.update({ collection: 'bookings', id: b.id, req, overrideAccess: true, data: { emails: markSent(b, 'balanceReminderSentAt') } })
}

async function sendEtaReminder(req: PayloadRequest, b: any) {
  const contact = b.contact as any
  const token = b.portalToken
  if (!token || !contact?.email) return
  const res = await sendEmail({
    to: contact.email,
    subject: `Before you fly: your Kenya eTA (${b.reference})`,
    tag: 'eta-reminder',
    content: {
      heading: `Three weeks to go, ${contact.firstName}!`,
      paragraphs: [
        `${b.title} starts on ${longDate(b.startDate)}. If you have not done so yet, now is a good time to apply for your Kenya Electronic Travel Authorisation (eTA).`,
        'Apply only on the official website, etakenya.go.ke, or the official app. Every traveller needs their own, including children, unless their nationality is exempt. Processing usually takes about 3 working days.',
        'Our eTA guide and your trip checklist are on your trip page.',
      ],
      button: { label: 'Open my trip page', href: tripUrl(token) },
      signature: signatureOf(null),
      footerNote: 'eTA rules can change. Always check the official portal before you travel.',
    },
  })
  if (res.status === 'failed') throw new Error(res.error)
  await req.payload.update({ collection: 'bookings', id: b.id, req, overrideAccess: true, data: { emails: markSent(b, 'etaReminderSentAt') } })
}
