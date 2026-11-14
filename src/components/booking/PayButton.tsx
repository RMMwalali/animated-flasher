'use client'
import { useState } from 'react'

/** Starts a Paystack checkout for the deposit or balance. */
export function PayButton({ token, kind, label, primary = true }: { token: string; kind: 'deposit' | 'balance'; label: string; primary?: boolean }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pay = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/trip/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, kind }) })
      const json = (await res.json()) as { ok: boolean; url?: string; error?: string }
      if (!json.ok || !json.url) throw new Error(json.error || 'Payment could not be started.')
      window.location.assign(json.url)
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }
  return (
    <div className="grid gap-2">
      <button type="button" onClick={pay} disabled={busy} className={`btn ${primary ? 'btn-primary' : 'btn-ghost'} w-full justify-center disabled:opacity-60`} data-cta={`trip-pay-${kind}`}>
        {busy ? 'Opening secure payment…' : label}
      </button>
      {error && <p role="alert" className="text-sm font-semibold text-orange-700">{error}</p>}
    </div>
  )
}
