'use client'
import { useState } from 'react'

/** "Test connection" under each service on the Integrations page. */
export function TestConnection({ service }: { service: string }) {
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<{ ok: boolean; message: string } | null>(null)
  const run = async () => {
    setBusy(true)
    setRes(null)
    try {
      const r = await fetch('/api/admin/integrations/test', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service }) })
      setRes((await r.json()) as { ok: boolean; message: string })
    } catch (e) {
      setRes({ ok: false, message: String(e) })
    }
    setBusy(false)
  }
  return (
    <div className="ng-tools" style={{ marginTop: 4, marginBottom: 16 }}>
      <div className="ng-tools__row">
        <button type="button" className="ng-btn ng-btn--ghost" disabled={busy} onClick={run}>{busy ? 'Testing…' : 'Test connection'}</button>
        <span className="ng-tools__ok">Save first, then test.</span>
      </div>
      {res && <p role="status" className={res.ok ? 'ng-notice' : 'ng-notice ng-notice--ochre'}>{res.ok ? '✓ ' : '✗ '}{res.message}</p>}
    </div>
  )
}
