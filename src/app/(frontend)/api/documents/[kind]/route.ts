import { NextResponse, type NextRequest } from 'next/server'
import { isSales } from '@/access'
import { findBookingByToken, findQuoteByToken } from '@/lib/booking/flows'
import { getPayloadSafe } from '@/lib/content'
import { invoiceDocument, quoteDocument, receiptDocument, type PdfFile } from '@/lib/pdf'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'

export const dynamic = 'force-dynamic'

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number))
const text = (msg: string, status: number) => new NextResponse(msg, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })

/**
 * PDF quote, invoice or receipt.
 * Guests: ?token= (the private link from their email; receipts also need &payment=).
 * Sales team, signed in to the admin: ?id= (quote, booking or payment id).
 * Add &download=1 to save the file instead of opening it.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ kind: string }> }) {
  const { kind } = await ctx.params
  if (!['quote', 'invoice', 'receipt'].includes(kind)) return text('Not found.', 404)
  const payload = await getPayloadSafe()
  if (!payload) return text('Documents are not available right now.', 503)
  const q = req.nextUrl.searchParams
  const token = q.get('token') ?? ''
  const id = q.get('id')
  let file: PdfFile | null = null

  if (id) {
    const { user } = await payload.auth({ headers: req.headers })
    if (!user || !isSales(user as never)) return text('Sign in to the admin to download this.', 403)
    if (kind === 'quote') file = await quoteDocument(payload, id).catch(() => null)
    if (kind === 'invoice') file = await invoiceDocument(payload, id).catch(() => null)
    if (kind === 'receipt') file = await receiptDocument(payload, id).catch(() => null)
  } else {
    const rl = await rateLimit(payload, `documents:${clientIp(req.headers)}`, 60, 10 * 60_000)
    if (!rl.ok) return text('Too many downloads. Please wait a few minutes.', 429)
    if (kind === 'quote') {
      const quote = await findQuoteByToken(payload, token, 1)
      if (quote) file = await quoteDocument(payload, quote)
    } else {
      const booking = await findBookingByToken(payload, token, 0)
      if (booking && kind === 'invoice') file = await invoiceDocument(payload, booking.id)
      if (booking && kind === 'receipt') {
        const paymentId = Number(q.get('payment'))
        const payment = paymentId ? await payload.findByID({ collection: 'payments', id: paymentId, depth: 0, overrideAccess: true }).catch(() => null) : null
        // only this booking's own payments
        if (payment && idOf(payment.booking) === booking.id) file = await receiptDocument(payload, payment.id)
      }
    }
  }
  if (!file) return text('We could not find this document. Please use the link in your email.', 404)
  const disposition = q.get('download') ? 'attachment' : 'inline'
  return new NextResponse(Buffer.from(file.bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${disposition}; filename="${file.filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
