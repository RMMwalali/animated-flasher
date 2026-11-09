'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    __lenis?: { stop(): void; start(): void; scrollTo(t: number | string | HTMLElement, o?: object): void; destroy(): void }
  }
}

/**
 * Site-wide motion: Lenis smooth scroll + GSAP ScrollTrigger for parallax /
 * pinned chapters, and an IntersectionObserver for reveals and brush
 * underlines. Everything is skipped with prefers-reduced-motion, and content
 * is only hidden once `js-motion` is on <html>, so nothing depends on JS.
 */
export function Motion() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add(e.target.classList.contains('brush') ? 'is-drawn' : 'is-in')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )
    const observe = () => document.querySelectorAll('[data-reveal]:not(.is-in), .brush[data-draw]:not(.is-drawn)').forEach((el) => io.observe(el))

    if (reduce) {
      return () => io.disconnect()
    }
    root.classList.add('js-motion')
    observe()
    const mo = new MutationObserver(() => observe())
    mo.observe(document.body, { childList: true, subtree: true })

    let cleanup = () => {}
    let cancelled = false
    ;(async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')])
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)
      const lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.2 })
      window.__lenis = lenis
      lenis.on('scroll', ScrollTrigger.update)
      const tick = (t: number) => lenis.raf(t * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      const ctx = gsap.context(() => {
        // Parallax layers: data-parallax="0.15" moves at 15% of scroll within its section
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const amount = parseFloat(el.dataset.parallax || '0.15')
          gsap.fromTo(el, { yPercent: -amount * 50 }, {
            yPercent: amount * 50, ease: 'none',
            scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        })
        // Media that zooms out as its chapter enters
        gsap.utils.toArray<HTMLElement>('[data-zoom]').forEach((el) => {
          gsap.fromTo(el, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top bottom', end: 'top top', scrub: true } })
        })
        // Pinned chapters: the media stays while the text column scrolls
        ScrollTrigger.matchMedia({
          '(min-width: 1024px)': () => {
            gsap.utils.toArray<HTMLElement>('[data-pin]').forEach((el) => {
              ScrollTrigger.create({ trigger: el.closest('section') ?? el, start: 'top top', end: 'bottom bottom', pin: el, pinSpacing: false })
            })
          },
        })
        // Horizontal journeys rail: vertical scroll drives the rail on desktop
        ScrollTrigger.matchMedia({
          '(min-width: 1024px)': () => {
            gsap.utils.toArray<HTMLElement>('[data-hscroll]').forEach((rail) => {
              const track = rail.querySelector<HTMLElement>('[data-hscroll-track]')
              if (!track) return
              const dist = () => Math.max(0, track.scrollWidth - rail.clientWidth)
              gsap.to(track, {
                x: () => -dist(), ease: 'none',
                scrollTrigger: {
                  trigger: rail, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true,
                  onUpdate: (st) => rail.dispatchEvent(new CustomEvent('hprogress', { detail: st.progress })),
                },
              })
            })
          },
        })
      })
      const onLoad = () => ScrollTrigger.refresh()
      window.addEventListener('load', onLoad)
      cleanup = () => {
        window.removeEventListener('load', onLoad)
        ctx.revert()
        gsap.ticker.remove(tick)
        lenis.destroy()
        window.__lenis = undefined
      }
    })()
    return () => {
      cancelled = true
      mo.disconnect()
      io.disconnect()
      cleanup()
    }
  }, [])
  return null
}
