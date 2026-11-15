'use client'
import { Checkbox, Description, Field, Label } from '@headlessui/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/icons/Icon'

const KEY = 'ngina-consent'
/** analytics: visit statistics (Google Analytics, Clarity). marketing: ad pixels (Meta, TikTok). */
export type Consent = { analytics: boolean; marketing?: boolean; at: string }

export const readConsent = (): Consent | null => {
  try {
    const v = localStorage.getItem(KEY)
    return v ? (JSON.parse(v) as Consent) : null
  } catch {
    return null
  }
}

function Choice({ checked, onChange, title, text }: { checked: boolean; onChange: (v: boolean) => void; title: string; text: string }) {
  return (
    <Field className="flex items-start gap-3">
      <Checkbox checked={checked} onChange={onChange} className="group mt-0.5 grid size-6 shrink-0 cursor-pointer place-items-center rounded-md border-2 border-deep/50 data-checked:border-deep data-checked:bg-deep data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-orange">
        <Icon name="check" size={14} className="text-cream opacity-0 group-data-checked:opacity-100" />
      </Checkbox>
      <span className="text-sm leading-snug">
        <Label className="cursor-pointer font-semibold">{title}</Label>
        <Description>{text}</Description>
      </span>
    </Field>
  )
}

/**
 * Privacy-first consent: nothing optional loads until the visitor says yes.
 * Essential storage only (consent choice, chat session, attribution in
 * sessionStorage) is used otherwise.
 */
export function ConsentBanner() {
  const [show, setShow] = useState(false)
  const [custom, setCustom] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShow(!readConsent()))
    const open = () => {
      const c = readConsent()
      setAnalytics(Boolean(c?.analytics))
      setMarketing(Boolean(c?.marketing))
      setCustom(true)
      setShow(true)
    }
    window.addEventListener('ngina:cookie-settings', open)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('ngina:cookie-settings', open)
    }
  }, [])
  const save = (a: boolean, m: boolean) => {
    const c: Consent = { analytics: a, marketing: m, at: new Date().toISOString() }
    try { localStorage.setItem(KEY, JSON.stringify(c)) } catch {}
    window.dispatchEvent(new CustomEvent('ngina:consent', { detail: c }))
    setShow(false)
  }
  if (!show) return null
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="consent-title" className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-xl rounded-2xl bg-paper p-5 text-deep shadow-[0_20px_60px_-20px_rgb(14_43_39/0.45)] sm:bottom-5">
      <p id="consent-title" className="font-display text-xl font-medium">Your privacy</p>
      <p className="mt-2 text-sm leading-relaxed">
        We only use essential storage to run this site. With your permission we would also measure visits to improve it, and measure our adverts. <Link className="underline" href="/cookies">Cookie policy</Link>
      </p>
      {custom && (
        <div className="mt-4 grid gap-3">
          <Choice checked={analytics} onChange={setAnalytics} title="Visit statistics" text="Which pages are useful (Google Analytics, Microsoft Clarity)." />
          <Choice checked={marketing} onChange={setMarketing} title="Advertising" text="Measure our adverts on Facebook, Instagram and TikTok." />
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        {custom ? (
          <button type="button" className="btn btn-primary !min-h-11 !py-2" onClick={() => save(analytics, marketing)}>Save choices</button>
        ) : (
          <button type="button" className="btn btn-primary !min-h-11 !py-2" onClick={() => save(true, true)}>Accept all</button>
        )}
        <button type="button" className="btn btn-ghost !min-h-11 !py-2" onClick={() => save(false, false)}><span>Essential only</span></button>
        {!custom && <button type="button" className="text-sm underline underline-offset-4" onClick={() => setCustom(true)}>Choose</button>}
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
