/**
 * Builds a guest document from the database: the quote, the booking's
 * invoice or a payment's receipt. Used by the emails (as attachments), the
 * guest pages and the admin (download links).
 */
import type { Payload, PayloadRequest } from 'payload'
import { env } from '@/lib/env'
import { getSettings } from '@/lib/crm/settings'
import { otherWaysToPayLines } from '@/components/booking/OtherWaysToPay'
import type { Currency, QuoteItem } from '@/lib/pricing'
import { invoicePdf, quotePdf, receiptPdf, type BusinessInfo, type PaymentLine } from './documents'

export type PdfFile = { filename: string; bytes: Uint8Array }

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number))
const fullName = (c: any) => [c?.firstName, c?.lastName].filter(Boolean).join(' ') || c?.email || 'Guest'
const fileSafe = (s: string) => s.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

async function business(payload: Payload, reference?: string): Promise<BusinessInfo> {
  const s: any = await getSettings({ payload }).catch(() => ({}))
  const a = s.address ?? {}
  return {
    name: s.businessName || 'Ngina Trails and Safaris',
    address: [a.street, a.locality || 'Diani Beach', a.region, 'Kenya'].filter(Boolean).join(', '),
    phone: s.phone || undefined,
    email: s.email || undefined,
    site: env.SITE_URL.replace(/^https?:\/\//, ''),
    paymentLines: reference ? otherWaysToPayLines(s, reference) : [],
  }
}

export async function quoteDocument(payload: Payload, quoteOrId: any, req?: PayloadRequest): Promise<PdfFile> {
  const q = typeof quoteOrId === 'object' && quoteOrId.contact !== undefined ? quoteOrId : await payload.findByID({ collection: 'quotes', id: idOf(quoteOrId), depth: 1, overrideAccess: true, req })
  const contact = typeof q.contact === 'object' ? q.contact : await payload.findByID({ collection: 'contacts', id: q.contact, depth: 0, overrideAccess: true, req })
  const bytes = await quotePdf(
    {
      number: q.number, title: q.title, status: q.status, guestName: fullName(contact),
      startDate: q.startDate, adults: q.adults, children: q.children, validUntil: q.validUntil,
      currency: q.currency as Currency, items: (q.items ?? []) as QuoteItem[], discount: q.discount, depositPercent: q.depositPercent,
      days: q.days, inclusions: q.inclusions, exclusions: q.exclusions, notes: q.notes,
      acceptUrl: q.acceptToken ? `${env.SITE_URL}/quote/${q.acceptToken}` : undefined,
    },
    await business(payload),
  )
  return { filename: `Quote-${fileSafe(String(q.number ?? q.id))}.pdf`, bytes }
}

async function bookingPayments(payload: Payload, bookingId: number, req?: PayloadRequest) {
  const { docs } = await payload.find({ collection: 'payments', where: { booking: { equals: bookingId } }, sort: 'paidAt', limit: 200, depth: 0, overrideAccess: true, req })
  return docs as any[]
}

export async function invoiceDocument(payload: Payload, bookingOrId: any, req?: PayloadRequest): Promise<PdfFile> {
  const b = await payload.findByID({ collection: 'bookings', id: idOf(bookingOrId), depth: 1, overrideAccess: true, req })
  const contact = b.contact as any
  const quote = b.quote && typeof b.quote === 'object' ? (b.quote as any) : b.quote ? await payload.findByID({ collection: 'quotes', id: idOf(b.quote), depth: 0, overrideAccess: true, req }).catch(() => null) : null
  // the quote's price lines, when they still add up to the booking total
  const items = quote && quote.currency === b.currency && Math.abs((quote.total ?? 0) - b.total) < 0.01 ? (quote.items as QuoteItem[]) : null
  const bytes = await invoicePdf(
    {
      reference: String(b.reference), title: b.title, guestName: fullName(contact), guestEmail: contact?.email,
      startDate: b.startDate, endDate: b.endDate, pax: b.pax, currency: b.currency as Currency, total: b.total,
      depositDue: b.depositDue, amountPaid: b.amountPaid, balanceDueDate: b.balanceDueDate,
      items, discount: items ? quote.discount : null,
      payments: (await bookingPayments(payload, b.id, req)) as PaymentLine[],
      tripUrl: b.portalToken ? `${env.SITE_URL}/trip/${b.portalToken}` : undefined,
    },
    await business(payload, String(b.reference)),
  )
  return { filename: `Invoice-${fileSafe(String(b.reference))}.pdf`, bytes }
}

/** Balance on the booking right after this payment (so an old receipt stays correct). */
function balanceAfter(booking: any, payments: any[], payment: any): number {
  const at = new Date(payment.paidAt ?? payment.createdAt).getTime()
  const credit = (p: any) => (p.currency === booking.currency ? p.amount : (p.credited ?? 0))
  const paid = payments
    .filter((p) => p.status === 'success' && (p.id === payment.id || new Date(p.paidAt ?? p.createdAt).getTime() <= at))
    .reduce((a, p) => a + credit(p), 0)
  return Math.max(0, booking.total - paid)
}

export async function receiptDocument(payload: Payload, paymentOrId: any, req?: PayloadRequest): Promise<PdfFile | null> {
  const p = await payload.findByID({ collection: 'payments', id: idOf(paymentOrId), depth: 0, overrideAccess: true, req })
  if (p.status !== 'success') return null
  const b = await payload.findByID({ collection: 'bookings', id: idOf(p.booking), depth: 1, overrideAccess: true, req })
  const receiptNumber = p.receiptNumber ?? `R-${p.reference}`
  const bytes = await receiptPdf(
    {
      receiptNumber, bookingReference: String(b.reference), bookingTitle: b.title, guestName: fullName(b.contact),
      payment: p as PaymentLine, bookingCurrency: b.currency as Currency, balanceAfter: balanceAfter(b, await bookingPayments(payload, b.id, req), p),
    },
    await business(payload),
  )
  return { filename: `Receipt-${fileSafe(receiptNumber)}.pdf`, bytes }
}

/** For email attachments. */
export const asAttachment = (f: PdfFile) => ({ name: f.filename, content: Buffer.from(f.bytes).toString('base64'), contentType: 'application/pdf' })
