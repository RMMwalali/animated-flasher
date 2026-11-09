'use client'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: { render(el: HTMLElement, o: { sitekey: string; callback(t: string): void; theme?: string }): string; remove(id: string): void }
  }
}

/** Optional Cloudflare Turnstile. Renders nothing without a site key. */
export function Turnstile({ onToken }: { onToken: (t: string) => void }) {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!key || !ref.current) return
    let id: string | undefined
    const render = () => {
      if (window.turnstile && ref.current && !id) id = window.turnstile.render(ref.current, { sitekey: key, callback: onToken, theme: 'light' })
    }
    if (window.turnstile) render()
    else {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      s.async = true
      s.onload = render
      document.head.appendChild(s)
    }
    return () => {
      if (id) window.turnstile?.remove(id)
    }
  }, [key, onToken])
  if (!key) return null
  return <div ref={ref} className="min-h-[65px]" />
}
