'use client'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/icons/Icon'
import type { TripVM } from '@/lib/content'
import { JourneyCard } from './JourneyCard'

/**
 * Featured journeys: a horizontal rail. On desktop vertical scroll drives it
 * (pinned, see Motion.tsx); on touch it is a native swipe carousel. The
 * counter reads "01 / 06" with back/forward buttons.
 */
export function Journeys({ trips }: { trips: TripVM[] }) {
  const rail = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  const total = trips.length

  useEffect(() => {
    const r = rail.current
    const t = track.current
    if (!r || !t) return
    const onH = (e: Event) => setI(Math.round((e as CustomEvent<number>).detail * (total - 1)))
    const onScroll = () => {
      const card = t.firstElementChild as HTMLElement | null
      if (card) setI(Math.min(total - 1, Math.round(t.scrollLeft / (card.offsetWidth + 24))))
    }
    r.addEventListener('hprogress', onH)
    t.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      r.removeEventListener('hprogress', onH)
      t.removeEventListener('scroll', onScroll)
    }
  }, [total])

  const go = (dir: 1 | -1) => {
    const t = track.current
    const card = t?.firstElementChild as HTMLElement | null
    if (!t || !card) return
    const desktop = window.matchMedia('(min-width: 1024px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (desktop && window.__lenis && rail.current) {
      const dist = Math.max(0, t.scrollWidth - rail.current.clientWidth)
      const next = Math.min(total - 1, Math.max(0, i + dir))
      const top = rail.current.getBoundingClientRect().top + window.scrollY
      window.__lenis.scrollTo(top + (dist * next) / Math.max(1, total - 1))
    } else {
      t.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: 'smooth' })
    }
  }

  return (
    <section id="journeys" data-tone="night" aria-labelledby="journeys-title">
      <div ref={rail} data-hscroll className="relative overflow-hidden py-24 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:py-0">
        <div className="gutter flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-ochre">04 · Featured journeys</p>
            <h2 id="journeys-title" className="statement mt-4 max-w-[14ch]">Start from the beach.</h2>
          </div>
          <div className="flex items-center gap-4">
            <p className="font-mono text-sm tracking-widest" aria-live="polite">
              <span className="text-ochre">{String(i + 1).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
            </p>
            <button type="button" onClick={() => go(-1)} disabled={i === 0} className="grid size-12 place-items-center rounded-full border border-cream/50 disabled:opacity-35" aria-label="Previous journey">
              <Icon name="arrow-left" />
            </button>
            <button type="button" onClick={() => go(1)} disabled={i >= total - 1} className="grid size-12 place-items-center rounded-full border border-cream/50 disabled:opacity-35" aria-label="Next journey">
              <Icon name="arrow-right" />
            </button>
          </div>
        </div>
        <div
          ref={track}
          data-hscroll-track
          className="gutter mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] lg:mt-14 lg:w-max lg:snap-none lg:overflow-visible"
        >
          {trips.map((t) => (
            <div key={t.slug} className="w-[80vw] max-w-[400px] shrink-0 snap-start sm:w-[44vw] lg:w-[27vw]">
              <JourneyCard trip={t} ctaPrefix="home-journeys" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
