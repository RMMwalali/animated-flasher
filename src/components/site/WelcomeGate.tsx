'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { brandPaths } from '@/components/brand/paths'
import { BrandLogo } from './Logo'

const KEY = 'ngina-intro'
const [bx, by, bw, bh] = brandPaths.silhouette.box
export const ENTERED_EVENT = 'ngina:entered'

/** Everything the intro covers: header, footer and the page content beside it. */
function behindIntro(intro?: HTMLElement | null): Element[] {
  const main = document.getElementById('main')
  const siblings = main ? [...main.children].filter((c) => !intro || !c.contains(intro)) : []
  return [document.getElementById('site-header'), document.getElementById('site-footer'), ...siblings].filter(Boolean) as Element[]
}

/**
 * Opening: the logo appears on cream, the elephant is drawn in outline, and
 * the website opens up through the elephant as it zooms towards the viewer.
 * No buttons and no sound. About 2.5 s, once per visit; a tap, click or any
 * key skips it, and it never plays for visitors who prefer reduced motion.
 */
export function LogoIntro() {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  const finish = useCallback(() => {
    document.documentElement.dataset.intro = 'done'
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {}
    for (const el of behindIntro()) el.removeAttribute('inert')
    document.body.style.removeProperty('overflow')
    window.__lenis?.start()
    window.dispatchEvent(new Event(ENTERED_EVENT))
    setGone(true)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    if (html.dataset.intro === 'seen' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const raf = requestAnimationFrame(finish)
      return () => cancelAnimationFrame(raf)
    }
    const el = root.current
    if (!el) return
    for (const b of behindIntro(el)) b.setAttribute('inert', '')
    document.body.style.overflow = 'hidden'
    window.__lenis?.stop()

    let tl: { kill(): void; progress(v: number): void } | null = null
    let done = false
    const end = () => {
      if (done) return
      done = true
      finish()
    }
    const skip = () => {
      if (tl) tl.progress(1)
      else end()
    }
    const ready = Promise.resolve()
    let alive = true
    ready.then(async () => {
      if (!alive) return
      const { gsap } = await import('gsap')
      if (!alive) return
      const logo = el.querySelector<HTMLElement>('[data-logo]')!
      const hole = el.querySelector<HTMLElement>('[data-hole]')!
      const solid = el.querySelector<HTMLElement>('[data-solid]')!
      const outlineSvg = el.querySelector<SVGSVGElement>('[data-outline]')!
      const outline = outlineSvg.querySelector('path')!
      tl = gsap
        .timeline({ onComplete: end })
        // the logo is already on screen from the first paint (CSS); hold it ~1.2 s in total
        .to(logo, { autoAlpha: 0, scale: 1.06, duration: 0.45, ease: 'power2.in' }, Math.max(0, 1200 - performance.now()) / 1000)
        .set(outlineSvg, { autoAlpha: 1 })
        .fromTo(outline, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.75, ease: 'power2.inOut' }, '>-0.1')
        .set(hole, { autoAlpha: 1 })
        .set(solid, { autoAlpha: 0 })
        .to(outlineSvg, { scale: 26, autoAlpha: 0, duration: 1.1, ease: 'power3.in', transformOrigin: '50% 50%' }, '>0.05')
        .to(hole, { '--s': 26, duration: 1.1, ease: 'power3.in' }, '<')
        .to(el, { autoAlpha: 0, duration: 0.2 }, '>-0.15')
    })
    const onKey = () => skip()
    window.addEventListener('keydown', onKey)
    el.addEventListener('pointerdown', skip)
    return () => {
      alive = false
      window.removeEventListener('keydown', onKey)
      el.removeEventListener('pointerdown', skip)
      tl?.kill()
    }
  }, [finish])

  if (gone) return null
  const maskUrl = 'url(/brand/elephant-silhouette.svg)'
  const size = `min(62vw, calc(70vh * ${bw / bh}))`
  return (
    <div ref={root} className="intro-gate fixed inset-0 z-[90] cursor-pointer" aria-hidden="true" data-intro-overlay>
      {/* solid cream until the elephant opens */}
      <div data-solid className="absolute inset-0 bg-cream" />
      {/* cream sheet with an elephant-shaped hole; --s scales the hole */}
      <div
        data-hole
        className="invisible absolute inset-0 bg-cream"
        style={{
          ['--s' as string]: 1,
          WebkitMask: `${maskUrl} center / calc(${size} * var(--s)) auto no-repeat, linear-gradient(#000 0 0)`,
          WebkitMaskComposite: 'xor',
          mask: `${maskUrl} center / calc(${size} * var(--s)) auto no-repeat exclude, linear-gradient(#000 0 0)`,
        }}
      />
      <svg data-outline viewBox={`${bx} ${by} ${bw} ${bh}`} className="invisible absolute left-1/2 top-1/2 h-auto -translate-x-1/2 -translate-y-1/2 text-deep" style={{ width: size }}>
        <path d={brandPaths.silhouette.d} pathLength={1} fill="none" stroke="currentColor" strokeWidth={6} strokeDasharray={1} />
      </svg>
      <div data-logo className="intro-logo absolute inset-0 grid place-items-center text-deep">
        <BrandLogo priority sizes="(min-width: 640px) 360px, 260px" className="h-[min(42vh,300px)] max-w-[80vw]" />
      </div>
    </div>
  )
}

/** Inline, pre-paint: skip the intro for repeat visits in this session. */
export const welcomeScript = `document.documentElement.classList.add('js');try{if(sessionStorage.getItem('${KEY}'))document.documentElement.dataset.intro='seen'}catch(e){}`
