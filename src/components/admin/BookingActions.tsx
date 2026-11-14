'use client'
import { useState } from 'react'
import { ToolBar, copy, emailNote, useAction, useDocId, useFieldValue } from './BookingTools'

/** Booking: confirmation email, payment requests (incl. M-Pesa in KES), guest page link. */
export function BookingActions() {
  const id = useDocId()
  const currency = useFieldValue<string>('currency') ?? 'USD'
  const amountPaid = useFieldValue<number>('amountPaid') ?? 0
  const depositDue = useFieldValue<number>('depositDue') ?? 0
  const { busy, message, run, setMessage } = useAction()
  const [kesOpen, setKesOpen] = useState(false)
  const [rate, setRate] = useState('')
  if (!id) return null
  const kind = amountPaid < depositDue ? 'deposit' : 'balance'
  return (
    <ToolBar message={message}>
      <button type="button" className="ng-btn ng-btn--primary" disabled={!!busy} onClick={() => window.confirm(`Email the guest a request to pay the ${kind}?`) && run('pay', { action: 'request-payment', id, kind }, (r) => `Payment request sent${emailNote(r)}.`)}>
        {busy === 'pay' ? 'Sending…' : `Request ${kind}`}
      </button>
      {currency === 'USD' && (
        kesOpen ? (
          <span className="ng-tools__inline">
            <label>KES per US$ <input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. 129" className="ng-input" style={{ width: 90 }} /></label>
            <button type="button" className="ng-btn ng-btn--primary" disabled={!!busy || !(Number(rate) > 0)} onClick={() => run('kes', { action: 'request-payment', id, kind, currency: 'KES', exchangeRate: Number(rate) }, (r) => `M-Pesa / card link in KES sent${emailNote(r)}.`).then((r) => r.ok && setKesOpen(false))}>
              {busy === 'kes' ? 'Sending…' : 'Send KES link'}
            </button>
            <button type="button" className="ng-btn ng-btn--ghost" onClick={() => setKesOpen(false)}>Cancel</button>
          </span>
        ) : (
          <button type="button" className="ng-btn ng-btn--ghost" disabled={!!busy} onClick={() => setKesOpen(true)} title="For M-Pesa: charge in Kenyan shillings at your exchange rate">Request in KES (M-Pesa)</button>
        )
      )}
      <button type="button" className="ng-btn ng-btn--ghost" disabled={!!busy} onClick={() => window.confirm('Email the guest their booking confirmation and trip page link?') && run('confirm', { action: 'send-confirmation', id }, (r) => `Confirmation sent${emailNote(r)}.`)}>
        {busy === 'confirm' ? 'Sending…' : 'Send confirmation'}
      </button>
      <button
        type="button" className="ng-btn ng-btn--ghost" disabled={!!busy}
        onClick={async () => {
          const r = await run('link', { action: 'trip-link', id }, () => '')
          if (r.ok && r.url) {
            await copy(r.url)
            setMessage({ text: 'Guest trip page link copied. It is private to this guest.', tone: 'ok' })
          } else if (r.ok) setMessage({ text: 'Save the booking once to create its guest link.', tone: 'error' })
        }}
      >
        Copy trip page link
      </button>
    </ToolBar>
  )
}
