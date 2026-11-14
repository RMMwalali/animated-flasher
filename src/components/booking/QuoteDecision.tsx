'use client'
import { Checkbox, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import Link from 'next/link'
import { useState } from 'react'
import { Icon } from '@/components/icons/Icon'

/** Accept (type your name + agree to terms) or decline a quote. */
export function QuoteDecision({ token, depositText, guestName }: { token: string; depositText: string; guestName: string }) {
  const [name, setName] = useState(guestName)
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [declineOpen, setDeclineOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [declined, setDeclined] = useState(false)

  const post = async (path: string, body: object) => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, ...body }) })
      const json = (await res.json()) as { ok: boolean; error?: string; tripUrl?: string }
      if (!json.ok) throw new Error(json.error || 'Something went wrong.')
      return json
    } catch (e) {
      setError((e as Error).message)
      return null
    } finally {
      setBusy(false)
    }
  }

  const accept = async (e: React.FormEvent) => {
    e.preventDefault()
    const r = await post('/api/quote/accept', { name, agree })
    if (r?.tripUrl) window.location.assign(new URL(r.tripUrl).pathname)
  }

  if (declined)
    return (
      <div role="status" className="rounded-3xl bg-paper p-7">
        <p className="font-display text-2xl">Thank you for letting us know.</p>
        <p className="mt-2">We have told the team. If you would like a different plan, just reply to our email.</p>
      </div>
    )

  return (
    <form onSubmit={accept} className="grid gap-5 rounded-3xl bg-paper p-6 sm:p-8" data-no-print aria-labelledby="accept-title">
      <h2 id="accept-title" className="font-display text-3xl font-medium">Happy with this plan?</h2>
      <p>Accept online to book. We hold your dates, and you can pay the deposit of <strong>{depositText}</strong> straight away from your trip page.</p>
      <label className="grid gap-2">
        <span className="text-sm font-semibold">Your full name</span>
        <input required minLength={2} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="min-h-12 rounded-xl border border-deep/30 bg-cream px-4 text-base focus:border-deep focus:outline-none" />
      </label>
      <div className="flex items-start gap-3">
        <Checkbox checked={agree} onChange={setAgree} aria-labelledby="agree-label" className="group mt-0.5 grid size-6 shrink-0 cursor-pointer place-items-center rounded-md border-2 border-deep/50 data-checked:border-deep data-checked:bg-deep data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-orange">
          <Icon name="check" size={14} className="text-cream opacity-0 group-data-checked:opacity-100" />
        </Checkbox>
        <span id="agree-label" className="text-sm leading-relaxed" onClick={() => setAgree(!agree)}>
          I accept this plan and price and agree to the <Link href="/terms" target="_blank" className="underline underline-offset-4" onClick={(e) => e.stopPropagation()}>booking terms</Link>.
        </span>
      </div>
      {error && <p role="alert" className="rounded-xl bg-orange/15 px-4 py-3 text-sm font-semibold">{error}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy || !agree || name.trim().length < 2} className="btn btn-primary disabled:opacity-50" data-cta="quote-accept">
          {busy ? 'Booking…' : 'Accept and book'}
        </button>
        <button type="button" onClick={() => setDeclineOpen(true)} className="text-sm underline underline-offset-4" data-cta="quote-decline">No thanks</button>
      </div>

      <Dialog open={declineOpen} onClose={() => setDeclineOpen(false)} className="relative z-[70]">
        <div className="fixed inset-0 bg-night/60" aria-hidden="true" />
        <div className="fixed inset-0 grid place-items-center p-4">
          <DialogPanel className="w-full max-w-md rounded-3xl bg-cream p-7 text-deep">
            <DialogTitle className="font-display text-2xl">Decline this plan?</DialogTitle>
            <p className="mt-2 text-sm">Optional: tell us why, so we can do better or suggest something else.</p>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} rows={4} className="mt-4 w-full rounded-xl border border-deep/30 bg-paper p-3" aria-label="Reason (optional)" />
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                className="btn btn-primary"
                onClick={async () => {
                  const r = await post('/api/quote/decline', { reason })
                  if (r) {
                    setDeclineOpen(false)
                    setDeclined(true)
                  }
                }}
              >
                Decline
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setDeclineOpen(false)}>Keep the plan</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </form>
  )
}
