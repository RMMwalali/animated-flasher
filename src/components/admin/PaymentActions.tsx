'use client'
import { ToolBar, copy, useAction, useDocId, useFieldValue } from './BookingTools'

/** Payment: check status with Paystack now; copy the payment link; the receipt PDF. */
export function PaymentActions() {
  const id = useDocId()
  const provider = useFieldValue<string>('provider')
  const status = useFieldValue<string>('status')
  const payUrl = useFieldValue<string>('payUrl')
  const { busy, message, run, setMessage } = useAction()
  if (!id || (provider !== 'paystack' && status !== 'success')) return null
  return (
    <ToolBar message={message}>
      {provider === 'paystack' && (
        <button type="button" className="ng-btn ng-btn--primary" disabled={!!busy || status === 'success'} onClick={() => run('verify', { action: 'verify-payment', id }, (r) => `Paystack says: ${r.status}. Reload the page to see the update.`)}>
          {busy === 'verify' ? 'Checking…' : 'Check with Paystack'}
        </button>
      )}
      {payUrl && status === 'pending' && (
        <button type="button" className="ng-btn ng-btn--ghost" onClick={async () => { await copy(payUrl); setMessage({ text: 'Payment link copied.', tone: 'ok' }) }}>Copy payment link</button>
      )}
      {status === 'success' && <a className="ng-btn ng-btn--ghost" href={`/api/documents/receipt?id=${id}`} target="_blank" rel="noopener">Receipt PDF</a>}
    </ToolBar>
  )
}
