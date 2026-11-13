'use client'
import { useEffect, useRef, useState } from 'react'
import { brandPaths } from '@/components/brand/paths'
import { LocationLine, MaskedSvg } from './Logo'

const KEY = 'ngina-intro'
const [bx, by, bw, bh] = brandPaths.silhouette.box

/**
 * Home intro: the elephant outline draws on cream, then the hero is revealed
 * through the elephant's silhouette, which scales until it fills the screen.
 * Plays once per session; skipped for reduced motion; a CSS failsafe removes
 * it if JS never runs (see .intro-gate in globals.css).
 */
export function IntroGate() {
  const ref = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const done = () => {
      root.dataset.intro = 'done'
      try { sessionStorage.setItem(KEY, '1') } catch {}
      window.__lenis?.start()
      setGone(true)
    }
    if (root.dataset.intro === 'seen' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return done()
    let killed = false
    let tl: { kill(): void } | null = null
    ;(async () => {
      const { gsap } = await import('gsap')
      if (killed || !ref.current) return
      window.__lenis?.stop()
      const el = ref.current
      const hole = el.querySelector<HTMLElement>('[data-hole]')!
      const solid = el.querySelector<HTMLElement>('[data-solid]')!
      const outline = el.querySelector<SVGPathElement>('[data-outline] path')!
      const words = el.querySelector<HTMLElement>('[data-words]')!
      const t = gsap.timeline({ onComplete: done })
      tl = t
      t.set(outline, { strokeDasharray: 1, strokeDashoffset: 1 })
        .to(outline, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
        .from(words, { autoAlpha: 0, y: 12, duration: 0.6, ease: 'power3.out' }, 0.3)
        .to(solid, { autoAlpha: 0, duration: 0.45, ease: 'power1.out' }, '>-0.1')
        .to(words, { autoAlpha: 0, duration: 0.3 }, '<')
        .to(el.querySelector('[data-outline]'), { scale: 26, autoAlpha: 0, duration: 1.3, ease: 'power3.in', transformOrigin: '50% 50%' }, '>0.15')
        .to(hole, { '--s': 26, duration: 1.3, ease: 'power3.in' }, '<')
        .to(el, { autoAlpha: 0, duration: 0.25 }, '>-0.15')
    })()
    return () => {
      killed = true
      tl?.kill()
    }
  }, [])

  if (gone) return null
  const maskUrl = 'url(/brand/elephant-silhouette.svg)'
  return (
    <div ref={ref} className="intro-gate fixed inset-0 z-[90]" aria-hidden="true">
      {/* cream sheet with an elephant-shaped hole; --s scales the hole */}
      <div
        data-hole
        className="absolute inset-0 bg-cream"
        style={{
          ['--s' as string]: 1,
          WebkitMask: `${maskUrl} center / calc(min(62vw, 70vh * ${bw / bh}) * var(--s)) auto no-repeat, linear-gradient(#000 0 0)`,
          WebkitMaskComposite: 'xor',
          mask: `${maskUrl} center / calc(min(62vw, 70vh * ${bw / bh}) * var(--s)) auto no-repeat exclude, linear-gradient(#000 0 0)`,
        }}
      />
      <div data-solid className="absolute inset-0 bg-cream" />
      <svg
        data-outline
        viewBox={`${bx} ${by} ${bw} ${bh}`}
        className="absolute left-1/2 top-1/2 h-auto -translate-x-1/2 -translate-y-1/2 text-deep"
        style={{ width: `min(62vw, calc(70vh * ${bw / bh}))` }}
      >
        <path d={brandPaths.silhouette.d} pathLength={1} fill="none" stroke="currentColor" strokeWidth={6} vectorEffect="non-scaling-stroke" />
      </svg>
      <div data-words className="absolute inset-x-0 bottom-[10vh] grid justify-items-center gap-3 text-deep">
        <MaskedSvg src="/brand/wordmark-ngina.svg" ratio={1633 / 310} className="h-6" />
        <LocationLine className="h-2.5" />
      </div>
    </div>
  )
}

/** Inline, pre-paint: skip the intro for repeat visits in this session. */
export const introScript = `try{if(sessionStorage.getItem('${KEY}'))document.documentElement.dataset.intro='seen'}catch(e){}`
