'use client'
import { useState } from 'react'

/** Two-step button that loads the sample content (admin only). */
export function LoadSampleButton({ hasContent }: { hasContent: boolean }) {
  const [step, setStep] = useState<'idle' | 'confirm' | 'busy' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const run = async () => {
    setStep('busy')
    setMsg('Loading photos and pages. This can take a minute…')
    try {
      const res = await fetch('/api/admin/load-sample', { method: 'POST', credentials: 'include' })
      const json = (await res.json()) as { ok: boolean; created?: number; skipped?: number; photos?: number; error?: string }
      if (!json.ok) throw new Error(json.error)
      setStep('done')
      setMsg(`Done: ${json.created} items added, ${json.skipped} already there. Refresh the website to see them.`)
    } catch (e) {
      setStep('error')
      setMsg(`Could not load sample content: ${(e as Error).message}`)
    }
  }
  return (
    <div className="ng-sample">
      <p className="ng-intro">
        {hasContent
          ? 'Sample journeys are already loaded. Running this again only fills in anything missing; it never replaces your edits.'
          : 'Your database is empty. Load the sample journeys, destinations, wildlife, pages and photos, then edit or replace them. Your Home page and Business settings are only filled in if they are still empty.'}
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        {step === 'confirm' ? (
          <>
            <button type="button" className="ng-btn ng-btn--primary" onClick={run}>Yes, load sample content</button>
            <button type="button" className="ng-btn ng-btn--ghost" onClick={() => setStep('idle')}>Cancel</button>
          </>
        ) : (
          <button type="button" className="ng-btn ng-btn--primary" disabled={step === 'busy'} onClick={() => setStep('confirm')}>
            {step === 'busy' ? 'Loading…' : 'Load sample content'}
          </button>
        )}
      </div>
      {msg && <p role="status" className={step === 'error' ? 'ng-notice ng-notice--ochre' : 'ng-empty'}>{msg}</p>}
    </div>
  )
}
