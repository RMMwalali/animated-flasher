'use client'
import { Analytics as VercelAnalytics } from '@vercel/analytics/react'
import { useEffect, useState } from 'react'
import { readConsent, type Consent } from './Consent'

export type AnalyticsIds = { vercel: boolean; ga4Id?: string; clarityId?: string; metaPixelId?: string; tiktokPixelId?: string }

declare global {
  interface Window {
    gtag?: (...a: unknown[]) => void
    dataLayer?: unknown[]
    fbq?: ((...a: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; callMethod?: (...a: unknown[]) => void; push?: unknown }
    ttq?: { load(id: string): void; page(): void; track(e: string, d?: object): void } & Record<string, unknown>
    clarity?: (...a: unknown[]) => void
  }
}

const ID = /^[A-Za-z0-9_-]{3,40}$/

function addScript(src: string, id: string) {
  if (document.getElementById(id)) return
  const s = document.createElement('script')
  s.id = id
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

function loadGa4(id: string) {
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { anonymize_ip: true })
  addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`, 'ng-ga4')
}

function loadClarity(id: string) {
  if (window.clarity) return
  const q: unknown[] = []
  window.clarity = (...a: unknown[]) => void q.push(a)
  ;(window.clarity as unknown as { q: unknown[] }).q = q
  addScript(`https://www.clarity.ms/tag/${encodeURIComponent(id)}`, 'ng-clarity')
}

function loadMeta(id: string) {
  if (window.fbq) return
  const queue: unknown[] = []
  const fbq = ((...a: unknown[]) => (fbq.callMethod ? fbq.callMethod(...a) : queue.push(a))) as NonNullable<Window['fbq']>
  fbq.queue = queue
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.push = fbq
  window.fbq = fbq
  addScript('https://connect.facebook.net/en_US/fbevents.js', 'ng-meta')
  fbq('init', id)
  fbq('track', 'PageView')
}

function loadTikTok(id: string) {
  if (window.ttq) return
  // TikTok's official loader, condensed
  const ttq: any = []
  const methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie']
  for (const m of methods) ttq[m] = (...a: unknown[]) => ttq.push([m, ...a])
  ttq.load = (pid: string) => addScript(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(pid)}&lib=ttq`, 'ng-tiktok')
  window.ttq = ttq
  ttq.load(id)
  ttq.page()
}

/**
 * Visitor statistics and ad pixels. Vercel Web Analytics is cookieless and
 * always on (when enabled in Integrations). Everything else loads only after
 * the visitor agrees in the cookie banner, and only if its ID is set.
 */
export function Analytics({ ids }: { ids: AnalyticsIds }) {
  const [consent, setConsent] = useState<Consent | null>(null)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setConsent(readConsent()))
    const on = (e: Event) => setConsent((e as CustomEvent<Consent>).detail)
    window.addEventListener('ngina:consent', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('ngina:consent', on)
    }
  }, [])
  useEffect(() => {
    if (!consent) return
    if (consent.analytics) {
      if (ids.ga4Id && ID.test(ids.ga4Id)) loadGa4(ids.ga4Id)
      if (ids.clarityId && ID.test(ids.clarityId)) loadClarity(ids.clarityId)
    }
    if (consent.marketing) {
      if (ids.metaPixelId && ID.test(ids.metaPixelId)) loadMeta(ids.metaPixelId)
      if (ids.tiktokPixelId && ID.test(ids.tiktokPixelId)) loadTikTok(ids.tiktokPixelId)
    }
  }, [consent, ids])
  return ids.vercel ? <VercelAnalytics /> : null
}

/** Record a conversion-style event in whichever tools are loaded (never personal data). */
export function trackEvent(name: string, data: Record<string, string | number> = {}) {
  try {
    window.gtag?.('event', name, data)
    window.fbq?.('trackCustom', name, data)
    window.ttq?.track?.(name, data)
    import('@vercel/analytics').then((m) => m.track(name, data)).catch(() => {})
  } catch {
    /* analytics must never break the page */
  }
}
