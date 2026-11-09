'use client'
import { useEffect, useState } from 'react'

const KEY = 'ngina-consent'
export type Consent = { analytics: boolean; at: string }

export const readConsent = (): Consent | null => {
  try {
    const v = localStorage.getItem(KEY)
    return v ? (JSON.parse(v) as Consent) : null
  } catch {
    return null
  }
}

/**
 * Privacy-first consent: nothing optional loads until the visitor says yes.
 * Essential storage only (consent choice, chat session, attribution in
 * sessionStorage) is used otherwise.
 */
export function ConsentBanner() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    setShow(!readConsent())
    const open = () => setShow(true)
    window.addEventListener('ngina:cookie-settings', open)
    return () => window.removeEventListener('ngina:cookie-settings', open)
  }, [])
  const save = (analytics: boolean) => {
    const c: Consent = { analytics, at: new Date().toISOString() }
    try { localStorage.setItem(KEY, JSON.stringify(c)) } catch {}
    window.dispatchEvent(new CustomEvent('ngina:consent', { detail: c }))
    setShow(false)
  }
  if (!show) return null
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="consent-title" className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-xl rounded-2xl bg-paper p-5 text-deep shadow-[0_20px_60px_-20px_rgb(14_43_39/0.45)] sm:bottom-5">
      <p id="consent-title" className="font-display text-xl font-semibold">Your privacy</p>
      <p className="mt-2 text-sm leading-relaxed">
        We only use essential storage to run this site. With your permission we would also measure visits anonymously to improve it. <a className="underline" href="/cookies">Cookie policy</a>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary !min-h-11 !py-2" onClick={() => save(true)}>Allow analytics</button>
        <button type="button" className="btn btn-ghost !min-h-11 !py-2" onClick={() => save(false)}><span>Essential only</span></button>
      </div>
    </div>
  )
}

export function CookieSettingsLink() {
  return (
    <button type="button" className="link-u" onClick={() => window.dispatchEvent(new Event('ngina:cookie-settings'))}>
      Cookie settings
    </button>
  )
}
