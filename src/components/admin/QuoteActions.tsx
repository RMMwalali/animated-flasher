'use client'
import { ToolBar, copy, emailNote, useAction, useDocId, useFieldValue } from './BookingTools'

/** Quote: send to the guest, copy or open their private link. */
export function QuoteActions() {
  const id = useDocId()
  const status = useFieldValue<string>('status')
  const { busy, message, run, setMessage } = useAction()
  if (!id) return null
  const link = async (open: boolean) => {
    const r = await run('link', { action: 'quote-link', id }, () => '')
    if (!r.ok || !r.url) return
    if (open) {
      window.open(r.url, '_blank', 'noopener')
      setMessage({ text: 'Opened the guest\'s page in a new tab.', tone: 'ok' })
    } else {
      await copy(r.url)
      setMessage({ text: 'Guest link copied. It is private to this guest.', tone: 'ok' })
    }
  }
  const sent = status && status !== 'draft'
  return (
    <ToolBar message={message}>
      <button
        type="button" className="ng-btn ng-btn--primary" disabled={!!busy || status === 'accepted'}
        onClick={() => {
          if (!window.confirm(sent ? 'Send this quote to the guest again?' : 'Email this quote to the guest now? Save any changes first.')) return
          run('send', { action: 'send-quote', id }, (r) => `Sent to the guest${emailNote(r)}.`)
        }}
      >
        {busy === 'send' ? 'Sending…' : sent ? 'Send again' : 'Send to guest'}
      </button>
      <button type="button" className="ng-btn ng-btn--ghost" disabled={!!busy || !sent} onClick={() => link(false)} title={sent ? undefined : 'Send the quote first'}>Copy guest link</button>
      <button type="button" className="ng-btn ng-btn--ghost" disabled={!!busy || !sent} onClick={() => link(true)}>Open guest page</button>
    </ToolBar>
  )
}
