'use client'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/icons/Icon'
import { Emphasis } from '@/components/site/Emphasis'
import type { TripVM } from '@/lib/content'
import { JourneyCard } from './JourneyCard'

/**
 * Featured journeys: a horizontal rail. On desktop vertical scroll drives it
 * (pinned, see Motion.tsx); on touch it is a native swipe carousel. The
 * counter reads "01 / 06" with back/forward buttons.
 */
/** Distance from one card to the next (card width + gap). */
function cardStep(track: HTMLElement): number {
  const cards = track.querySelectorAll<HTMLElement>('[data-card]')
  if (cards.length > 1) return cards[1]!.offsetLeft - cards[0]!.offsetLeft
  return cards[0]?.offsetWidth ?? 0
}

/** Desktop: the pinned-scroll progress (0..1) at which each card reaches the left edge. */
function cardProgress(rail: HTMLElement, track: HTMLElement): number[] {
  const dist = Math.max(1, track.scrollWidth - rail.clientWidth)
  const cards = [...track.querySelectorAll<HTMLElement>('[data-card]')]
  const first = cards[0]?.offsetLeft ?? 0
  return cards.map((c) => Math.min(1, (c.offsetLeft - first) / dist))
}

type Copy = { eyebrow?: string | null; statement?: string | null; emphasis?: string | null; intro?: string | null }

export function Journeys({ trips, copy = {} }: { trips: TripVM[]; copy?: Copy }) {
  const rail = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  const total = trips.length

  useEffect(() => {
    const r = rail.current
    const t = track.current
    if (!r || !t) return
    // desktop: which card is at the left edge for this point of the pinned scroll
    const onH = (e: Event) => {
      const p = (e as CustomEvent<number>).detail
      const pts = cardProgress(r, t)
      let k = 0
      pts.forEach((v, j) => { if (p >= v - 0.02) k = j })
      setI(Math.min(total - 1, k))
    }
    const onScroll = () => {
      const step = cardStep(t)
      if (step) setI(Math.min(total - 1, Math.round(t.scrollLeft / step)))
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
    const step = t ? cardStep(t) : 0
    if (!t || !step) return
    const desktop = window.matchMedia('(min-width: 1024px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (desktop && window.__lenis && rail.current) {
      // the pinned scroll is 1.6 × the row's travel (see Motion.tsx)
      const dist = Math.max(0, t.scrollWidth - rail.current.clientWidth)
      const next = Math.min(total - 1, Math.max(0, i + dir))
      const top = rail.current.getBoundingClientRect().top + window.scrollY
      window.__lenis.scrollTo(top + dist * 1.6 * (cardProgress(rail.current, t)[next] ?? 1))
    } else {
      t.scrollBy({ left: dir * step, behavior: 'smooth' })
    }
  }

  const eyebrow = copy.eyebrow || 'Featured journeys'
  const statement = copy.statement || 'Our favourite journeys from Diani.'
  const emphasis = copy.statement ? copy.emphasis : 'favourite'

  // Desktop: the section is pinned to one screen while the row slides
  // sideways, so the title rides along as the first panel of the row and the
  // cards are sized from the screen height (never cut off under the header).
  return (
    <section id="journeys" data-tone="night" aria-labelledby="journeys-title">
      <div ref={rail} data-hscroll className="relative overflow-hidden py-24 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center-safe lg:pb-6 lg:pt-32">
        <div className="gutter flex flex-wrap items-end justify-between gap-6 lg:items-center">
          <div>
            <p className="eyebrow text-ochre">04 · {eyebrow}</p>
            <h2 id="journeys-title" className="statement mt-4 max-w-[16ch] lg:sr-only">
              <Emphasis text={statement} emphasis={emphasis} />
            </h2>
            {copy.intro && <p className="mt-4 max-w-[46ch] text-cream/80 lg:hidden">{copy.intro}</p>}
          </div>
          <div className="flex items-center gap-4">
            <p className="font-semibold tabular-nums text-sm tracking-[0.06em]" aria-live="polite">
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
          className="gutter mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] sm:gap-8 lg:mt-6 lg:w-max lg:snap-none lg:gap-14 lg:overflow-visible lg:pb-0"
        >
          <div aria-hidden="true" className="hidden w-[min(34vw,560px)] shrink-0 flex-col justify-center pr-8 lg:flex">
            <p className="font-display text-[clamp(2.6rem,4.4vw,4.75rem)] leading-[1.02] tracking-[-0.02em] [text-wrap:balance]">
              <Emphasis text={statement} emphasis={emphasis} />
            </p>
            {copy.intro && <p className="mt-6 max-w-[36ch] text-lg text-cream/80">{copy.intro}</p>}
            <p className="eyebrow mt-8 flex items-center gap-3 text-ochre">Scroll to explore <Icon name="arrow-right" size={16} /></p>
          </div>
          {trips.map((t) => (
            <div key={t.slug} data-card className="w-[78vw] max-w-[400px] shrink-0 snap-center sm:w-[44vw] sm:snap-start lg:w-[clamp(220px,calc((100svh-24rem)*0.8),26vw)]">
              <JourneyCard trip={t} ctaPrefix="home-journeys" quiet />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
