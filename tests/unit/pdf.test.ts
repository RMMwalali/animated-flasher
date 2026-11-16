import { writeFileSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { invoicePdf, quotePdf, receiptPdf } from '@/lib/pdf/documents'

const biz = { name: 'Ngina Trails and Safaris', address: 'Diani Beach, Kwale County, Kenya', phone: '+254 720 972 512', email: 'hello@example.com', site: 'example.com', paymentLines: ['Other ways to pay:', 'M-Pesa Paybill 123456, account NG-ABC123.'] }
const out = process.env.PDF_OUT // set to a folder to keep the files for a visual check
const keep = (name: string, bytes: Uint8Array) => out && writeFileSync(`${out}/${name}`, bytes)

const quote = {
  number: 'Q-2026-0042', title: 'Tsavo East & Diani: 5 days', guestName: 'Zoë Müller-Łukasz', startDate: '2026-12-10', adults: 2, children: 1,
  validUntil: '2026-11-30', currency: 'USD' as const, depositPercent: 30, discount: 50,
  items: [
    { description: 'Tsavo East & Diani (5 days): adult', unit: 'per_person' as const, quantity: 2, unitPrice: 1250 },
    { description: 'Tsavo East & Diani: child', unit: 'per_child' as const, quantity: 1, unitPrice: 625 },
    { description: 'Private 4x4 with pop-up roof and a very long description that has to wrap onto a second line in the table', unit: 'per_group' as const, quantity: 1, unitPrice: 300 },
  ],
  days: Array.from({ length: 14 }, (_, i) => ({ title: `Day title ${i + 1}`, description: 'Game drive in the morning and the afternoon, with a picnic lunch by the Galana River. '.repeat(3), overnight: 'Ashnil Aruba Lodge' })),
  inclusions: '- Park fees\n- All meals on safari\n- Bottled water 💧', exclusions: '- International flights\n- Tips', notes: 'Jambo! Here is your plan 🦁 with 中文 characters.',
  acceptUrl: 'https://example.com/quote/abcdefghijklmnopqrstuvwxyz0123456789',
}

describe('PDF documents', () => {
  it('builds a multi-page quote and survives characters the font lacks', async () => {
    const bytes = await quotePdf(quote, biz)
    keep('quote.pdf', bytes)
    const doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBeGreaterThan(1)
    expect(doc.getTitle()).toContain('Q-2026-0042')
  })
  it('builds an invoice with payments and how to pay', async () => {
    const bytes = await invoicePdf({
      reference: 'NG-ABC123', title: quote.title, guestName: 'Zoë Müller', guestEmail: 'zoe@example.com', startDate: '2026-12-10', endDate: '2026-12-14', pax: 3,
      currency: 'USD', total: 3375, depositDue: 1012.5, amountPaid: 1012.5, balanceDueDate: '2026-11-10', items: quote.items, discount: 50,
      payments: [{ kind: 'deposit', amount: 1012.5, currency: 'USD', status: 'success', method: 'card', paidAt: '2026-11-01', receiptNumber: 'R-PAY-1' }],
      tripUrl: 'https://example.com/trip/abc',
    }, biz)
    keep('invoice.pdf', bytes)
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1)
  })
  it('builds a receipt, including a KES payment on a US$ booking', async () => {
    const bytes = await receiptPdf({
      receiptNumber: 'R-PAY-2', bookingReference: 'NG-ABC123', bookingTitle: quote.title, guestName: 'Zoë Müller', bookingCurrency: 'USD', balanceAfter: 0,
      payment: { reference: 'PAY-2', kind: 'balance', amount: 304000, currency: 'KES', credited: 2362.5, method: 'mobile_money', paidAt: '2026-11-09', status: 'success' },
    }, biz)
    keep('receipt.pdf', bytes)
    expect((await PDFDocument.load(bytes)).getTitle()).toBe('Receipt R-PAY-2')
  })
})
