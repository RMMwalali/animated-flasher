/**
 * The PDF documents a guest receives: quote, invoice and receipt. Each
 * builder takes plain data (no database access) so they can be tested and
 * reused by the emails, the guest pages and the admin.
 */
import { calcQuote, formatMoney, lineTotal, type Currency, type QuoteItem } from '@/lib/pricing'
import { CONTENT_W, Doc, type Business } from './layout'

export type BusinessInfo = Business & { paymentLines?: string[] }

const longDate = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi' }) : '-'
const people = (adults?: number | null, children?: number | null) =>
  `${adults ?? 0} adult${adults === 1 ? '' : 's'}${children ? `, ${children} child${children === 1 ? '' : 'ren'}` : ''}`
const unitLabel = (u?: string | null) => ({ per_person: 'per adult', per_child: 'per child', per_group: 'per group', fixed: 'fixed' })[u ?? ''] ?? ''
const methodLabel = (m?: string | null, provider?: string | null) =>
  ({ mobile_money: 'M-Pesa', card: 'Card', bank: 'Bank transfer', cash: 'Cash' })[m ?? ''] ?? (provider === 'paystack' ? 'Paystack' : provider === 'manual' ? 'Bank transfer / cash' : 'Payment')

const footer = (b: BusinessInfo) => [b.name, b.phone, b.email].filter(Boolean).join(' · ')

function priceTable(d: Doc, items: QuoteItem[], currency: Currency) {
  d.table(
    ['Description', 'Qty', 'Unit price', 'Amount'],
    items.map((i) => [
      `${i.description}${unitLabel(i.unit) ? ` (${unitLabel(i.unit)})` : ''}`,
      String(i.quantity ?? 1),
      formatMoney(i.unitPrice, currency),
      formatMoney(lineTotal(i, currency), currency),
    ]),
    [CONTENT_W - 250, 50, 100, 100],
  )
}

function bulletList(d: Doc, text?: string | null) {
  if (!text?.trim()) return
  for (const line of text.split(/\r?\n/).map((l) => l.replace(/^[\s\-*•]+/, '').trim()).filter(Boolean)) d.paragraph(`•  ${line}`, { size: 9.5, gap: 1 })
  d.y -= 4
}

// ---------------------------------------------------------------- quote

export type QuoteData = {
  number?: string | null
  title: string
  status?: string | null
  guestName: string
  startDate?: string | null
  adults?: number | null
  children?: number | null
  validUntil?: string | null
  currency: Currency
  items?: QuoteItem[] | null
  discount?: number | null
  depositPercent?: number | null
  days?: { title: string; description?: string | null; overnight?: string | null }[] | null
  inclusions?: string | null
  exclusions?: string | null
  notes?: string | null
  acceptUrl?: string
}

export async function quotePdf(q: QuoteData, business: BusinessInfo): Promise<Uint8Array> {
  const items = q.items ?? []
  const t = calcQuote(items, { discount: q.discount, depositPercent: q.depositPercent, currency: q.currency })
  const d = await Doc.create({ title: `Quote ${q.number ?? ''} · ${q.title}`, business, footer: footer(business) })
  d.title(`Quote ${q.number ?? ''}`, q.title)
  d.facts([
    ['Prepared for', q.guestName],
    ['Date', longDate(new Date())],
    ['Starting', longDate(q.startDate)],
    ['Travellers', people(q.adults, q.children)],
    ['Valid until', longDate(q.validUntil)],
    ['Deposit to confirm', `${formatMoney(t.deposit, q.currency)} (${q.depositPercent ?? 30}%)`],
  ])
  if (q.notes?.trim()) {
    d.heading('A note from us')
    d.paragraph(q.notes, { size: 10 })
  }
  if (q.days?.length) {
    d.heading('Day by day')
    q.days.forEach((day, i) => {
      d.need(40)
      d.paragraph(`Day ${i + 1}: ${day.title}`, { size: 10.5, bold: true, gap: 0 })
      if (day.description) d.paragraph(day.description, { size: 9.5, gap: 0 })
      if (day.overnight) d.paragraph(`Overnight: ${day.overnight}`, { size: 9, gap: 0 })
      d.y -= 6
    })
  }
  d.heading('Price')
  priceTable(d, items, q.currency)
  d.totals([
    ...(t.discount ? [{ label: 'Subtotal', value: formatMoney(t.subtotal, q.currency) }, { label: 'Discount', value: `-${formatMoney(t.discount, q.currency)}` }] : []),
    { label: 'Total', value: formatMoney(t.total, q.currency), strong: true },
    { label: 'Deposit to confirm', value: formatMoney(t.deposit, q.currency) },
    { label: 'Balance', value: formatMoney(t.balance, q.currency) },
  ])
  if (q.inclusions?.trim()) {
    d.heading('Included')
    bulletList(d, q.inclusions)
  }
  if (q.exclusions?.trim()) {
    d.heading('Not included')
    bulletList(d, q.exclusions)
  }
  if (q.status === 'accepted') d.callout('Accepted', ['Thank you. This quote has been accepted and your booking is confirmed on your trip page.'])
  else
    d.callout('How to book', [
      q.acceptUrl ? `Accept online: ${q.acceptUrl}` : 'Accept online using the link in your email.',
      `Then pay the deposit of ${formatMoney(t.deposit, q.currency)} to confirm your dates. Prices are held until ${longDate(q.validUntil)}.`,
      'Want to change something? Reply to our email or message us on WhatsApp.',
    ])
  return d.save()
}

// ---------------------------------------------------------------- invoice

export type PaymentLine = { reference?: string | null; receiptNumber?: string | null; kind?: string | null; amount: number; currency: Currency; credited?: number | null; method?: string | null; provider?: string | null; paidAt?: string | null; status?: string | null }

export type InvoiceData = {
  reference: string
  title: string
  guestName: string
  guestEmail?: string | null
  startDate?: string | null
  endDate?: string | null
  pax?: number | null
  currency: Currency
  total: number
  depositDue?: number | null
  amountPaid?: number | null
  balanceDueDate?: string | null
  items?: QuoteItem[] | null
  discount?: number | null
  payments?: PaymentLine[]
  tripUrl?: string
}

export async function invoicePdf(b: InvoiceData, business: BusinessInfo): Promise<Uint8Array> {
  const paid = b.amountPaid ?? 0
  const balance = Math.max(0, b.total - paid)
  const depositLeft = Math.max(0, (b.depositDue ?? 0) - paid)
  const d = await Doc.create({ title: `Invoice ${b.reference} · ${b.title}`, business, footer: footer(business) })
  d.title(`Invoice ${b.reference}`, b.title)
  d.facts([
    ['Billed to', [b.guestName, b.guestEmail].filter(Boolean).join('\n')],
    ['Invoice date', longDate(new Date())],
    ['Dates', `${longDate(b.startDate)}${b.endDate ? ` to ${longDate(b.endDate)}` : ''}`],
    ['Travellers', String(b.pax ?? '-')],
  ])
  d.heading('Charges')
  const items = b.items?.length ? b.items : [{ description: b.title, unit: 'fixed' as const, quantity: 1, unitPrice: b.total }]
  priceTable(d, items, b.currency)
  const success = (b.payments ?? []).filter((p) => p.status === 'success')
  d.totals([
    ...(b.discount ? [{ label: 'Discount', value: `-${formatMoney(b.discount, b.currency)}` }] : []),
    { label: 'Total', value: formatMoney(b.total, b.currency) },
    { label: 'Paid', value: formatMoney(paid, b.currency) },
    { label: balance > 0 ? 'Balance due' : 'Balance', value: formatMoney(balance, b.currency), strong: true },
  ])
  if (success.length) {
    d.heading('Payments received')
    d.table(
      ['Payment', 'Date', 'Method', 'Amount'],
      success.map((p) => [
        `${p.kind === 'deposit' ? 'Deposit' : p.kind === 'balance' ? 'Balance' : 'Payment'}${p.receiptNumber ? ` · ${p.receiptNumber}` : ''}`,
        longDate(p.paidAt),
        methodLabel(p.method, p.provider),
        formatMoney(p.amount, p.currency),
      ]),
      [CONTENT_W - 330, 120, 110, 100],
    )
  }
  if (balance <= 0) d.callout('Paid in full', ['Thank you. Nothing more is due for this booking.'])
  else
    d.callout(depositLeft > 0 ? `Deposit due: ${formatMoney(depositLeft, b.currency)}` : `Balance due${b.balanceDueDate ? ` by ${longDate(b.balanceDueDate)}` : ''}: ${formatMoney(balance, b.currency)}`, [
      b.tripUrl ? `Pay securely by M-Pesa or card on your trip page: ${b.tripUrl}` : 'Pay securely by M-Pesa or card on your trip page.',
      ...(business.paymentLines ?? []),
      `Please quote ${b.reference} with any payment.`,
    ])
  return d.save()
}

// ---------------------------------------------------------------- receipt

export type ReceiptData = {
  receiptNumber: string
  bookingReference: string
  bookingTitle: string
  guestName: string
  payment: PaymentLine
  bookingCurrency: Currency
  balanceAfter: number
}

export async function receiptPdf(r: ReceiptData, business: BusinessInfo): Promise<Uint8Array> {
  const p = r.payment
  const d = await Doc.create({ title: `Receipt ${r.receiptNumber}`, business, footer: footer(business) })
  d.title(`Receipt ${r.receiptNumber}`, `Payment received: ${formatMoney(p.amount, p.currency)}`)
  d.facts([
    ['Received from', r.guestName],
    ['Date', longDate(p.paidAt)],
    ['Booking', `${r.bookingReference} · ${r.bookingTitle}`],
    ['For', p.kind === 'deposit' ? 'Deposit' : p.kind === 'balance' ? 'Balance' : 'Payment'],
    ['Method', methodLabel(p.method, p.provider)],
    ['Payment reference', p.reference ?? '-'],
  ])
  d.totals([
    { label: 'Amount paid', value: formatMoney(p.amount, p.currency), strong: true },
    ...(p.currency !== r.bookingCurrency && p.credited != null ? [{ label: 'Credited to booking', value: formatMoney(p.credited, r.bookingCurrency) }] : []),
    { label: 'Balance remaining', value: formatMoney(r.balanceAfter, r.bookingCurrency) },
  ])
  d.callout('Asante sana', [r.balanceAfter > 0 ? 'Thank you for your payment. Your trip page always shows the latest balance.' : 'Thank you. Your booking is paid in full.'])
  return d.save()
}
