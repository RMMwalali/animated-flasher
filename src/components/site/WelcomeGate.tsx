'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { brandPaths } from '@/components/brand/paths'
import { Icon } from '@/components/icons/Icon'
import { ambient } from '@/lib/ambient'
import { Brush } from './Brush'
import { BrushCircle } from './BrushCircle'
import { HeaderLogo, LocationLine } from './Logo'

const KEY = 'ngina-intro'
const [bx, by, bw, bh] = brandPaths.silhouette.box
export const ENTERED_EVENT = 'ngina:entered'

/** Everything the gate covers: header, footer and the page content beside the gate. */
function behindGate(gate?: HTMLElement | null): Element[] {
  const main = document.getElementById('main')
  const siblings = main ? [...main.children].filter((c) => !gate || !c.contains(gate)) : []
  return [document.getElementById('site-header'), document.getElementById('site-footer'), ...siblings].filter(Boolean) as Element[]
}

type Props = { soundNote: string; enterLabel: string; quietLabel: string; audioUrl?: string | null }

/**
 * Welcome: on a hazy cream ground the visitor sees the logo, a note about
 * sound and a hand-drawn ring that fills as the page loads, then becomes
 * the "Karibu" button. Entering (with or without sound) plays the elephant
 * reveal: the site appears through the elephant's silhouette, which grows
 * to fill the screen. Once per session.
 */
export function WelcomeGate({ soundNote, enterLabel, quietLabel, audioUrl }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const enterBtn = useRef<HTMLButtonElement>(null)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'leaving' | 'gone'>('loading')
  const [progress, setProgress] = useState(0.04)

  const finish = useCallback(() => {
    const html = document.documentElement
    html.dataset.intro = 'done'
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {}
    for (const el of behindGate()) el.removeAttribute('inert')
    document.body.style.removeProperty('overflow')
    window.__lenis?.start()
    window.dispatchEvent(new Event(ENTERED_EVENT))
    setPhase('gone')
  }, [])

  // Setup: skip for repeat visits, otherwise lock the page behind the gate.
  useEffect(() => {
    ambient.setSource(audioUrl)
    const html = document.documentElement
    if (html.dataset.intro === 'seen' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const raf = requestAnimationFrame(finish)
      return () => cancelAnimationFrame(raf)
    }
    for (const el of behindGate(root.current)) el.setAttribute('inert', '')
    document.body.style.overflow = 'hidden'
    window.__lenis?.stop()

    // Loading ring: eases towards 90% while assets load, completes when ready.
    let raf = 0
    let target = 0.88
    const t0 = performance.now()
    const tick = () => {
      setProgress((p) => p + (target - p) * 0.05)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const loaded = new Promise<void>((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', () => r(), { once: true })))
    const minTime = new Promise<void>((r) => setTimeout(r, 1500))
    let alive = true
    Promise.all([loaded, document.fonts?.ready ?? Promise.resolve(), minTime]).then(() => {
      if (!alive) return
      target = 1
      setTimeout(() => {
        if (!alive) return
        cancelAnimationFrame(raf)
        setProgress(1)
        setPhase('ready')
      }, Math.max(350, 900 - (performance.now() - t0) / 10))
    })
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [audioUrl, finish])

  useEffect(() => {
    if (phase === 'ready') enterBtn.current?.focus({ preventScroll: true })
  }, [phase])

  const enter = useCallback(
    async (withSound: boolean) => {
      if (phase !== 'ready') return
      if (withSound) void ambient.start()
      setPhase('leaving')
      const el = root.current
      if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return finish()
      const { gsap } = await import('gsap')
      const hole = el.querySelector<HTMLElement>('[data-hole]')!
      const solid = el.querySelector<HTMLElement>('[data-solid]')!
      const content = el.querySelector<HTMLElement>('[data-content]')!
      const outlineSvg = el.querySelector<SVGSVGElement>('[data-outline]')!
      const outline = outlineSvg.querySelector('path')!
      gsap
        .timeline({ onComplete: finish })
        .to(content, { autoAlpha: 0, y: -16, duration: 0.45, ease: 'power2.in' })
        .set(outlineSvg, { autoAlpha: 1 })
        .fromTo(outline, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '>-0.05')
        .to(solid, { autoAlpha: 0, duration: 0.5, ease: 'power1.out' }, '>-0.1')
        .to(outlineSvg, { scale: 26, autoAlpha: 0, duration: 1.25, ease: 'power3.in', transformOrigin: '50% 50%' }, '>0.2')
        .to(hole, { '--s': 26, duration: 1.25, ease: 'power3.in' }, '<')
        .to(el, { autoAlpha: 0, duration: 0.25 }, '>-0.15')
    },
    [finish, phase],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void enter(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enter])

  if (phase === 'gone') return null
  const maskUrl = 'url(/brand/elephant-silhouette.svg)'
  const ready = phase !== 'loading'
  return (
    <div
      ref={root}
      className="intro-gate fixed inset-0 z-[90]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-note"
      aria-busy={!ready}
    >
      {/* cream sheet with an elephant-shaped hole; --s scales the hole */}
      <div
        data-hole
        aria-hidden="true"
        className="absolute inset-0 bg-cream"
        style={{
          ['--s' as string]: 1,
          WebkitMask: `${maskUrl} center / calc(min(62vw, 70vh * ${bw / bh}) * var(--s)) auto no-repeat, linear-gradient(#000 0 0)`,
          WebkitMaskComposite: 'xor',
          mask: `${maskUrl} center / calc(min(62vw, 70vh * ${bw / bh}) * var(--s)) auto no-repeat exclude, linear-gradient(#000 0 0)`,
        }}
      />

      {/* the welcome itself */}
      <div data-solid className="welcome-haze absolute inset-0 overflow-hidden bg-cream" aria-hidden="true">
        <span className="haze haze-a" />
        <span className="haze haze-b" />
        <span className="haze haze-c" />
        <svg viewBox={brandPaths.horizon.box.join(' ')} preserveAspectRatio="none" className="absolute bottom-[14vh] left-[-5%] h-3 w-[110%] text-deep/15">
          <path d={brandPaths.horizon.d} fill="currentColor" />
        </svg>
      </div>

      <svg
        data-outline
        aria-hidden="true"
        viewBox={`${bx} ${by} ${bw} ${bh}`}
        className="invisible absolute left-1/2 top-1/2 h-auto -translate-x-1/2 -translate-y-1/2 text-deep"
        style={{ width: `min(62vw, calc(70vh * ${bw / bh}))` }}
      >
        <path d={brandPaths.silhouette.d} pathLength={1} fill="none" stroke="currentColor" strokeWidth={6} strokeDasharray={1} />
      </svg>

      <div data-content className="relative flex h-full flex-col items-center justify-between px-4 py-8 text-deep sm:py-10">
        <HeaderLogo className="[&>span:first-child]:h-10 [&>span:last-child]:h-4 sm:[&>span:first-child]:h-12 sm:[&>span:last-child]:h-5" />

        <div className="grid justify-items-center gap-7 text-center">
          <Icon name="sound-on" size={28} />
          <p id="welcome-note" className="max-w-[18ch] font-display text-2xl font-medium leading-snug sm:text-3xl">
            {soundNote}
          </p>
          <button
            ref={enterBtn}
            type="button"
            onClick={() => void enter(true)}
            disabled={!ready}
            className="group relative grid size-40 place-items-center rounded-full outline-offset-8 sm:size-44"
            aria-label={ready ? `${enterLabel}: enter with sound` : 'Loading'}
          >
            <BrushCircle progress={progress} className="absolute inset-0 size-full text-orange transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-12 group-hover:scale-105" strokeWidth={2.6} />
            <span className="font-mono text-sm uppercase tracking-[0.28em]" aria-hidden="true">
              {ready ? enterLabel : 'Loading'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => void enter(false)}
            disabled={!ready}
            className={`relative px-1 pb-2 text-base font-medium transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
          >
            {quietLabel}
            <Brush seed={quietLabel} draw={false} className="emphasis-brush absolute -bottom-1 left-0 h-2.5 w-full" />
          </button>
        </div>

        <LocationLine className="h-2.5 w-48 text-teal-ink sm:h-3 sm:w-56" />
      </div>
    </div>
  )
}

/** Inline, pre-paint: skip the welcome for repeat visits in this session. */
export const welcomeScript = `document.documentElement.classList.add('js');try{if(sessionStorage.getItem('${KEY}'))document.documentElement.dataset.intro='seen'}catch(e){}`
