'use client'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Icon } from '@/components/icons/Icon'
import { Emphasis } from '@/components/site/Emphasis'
import { Media } from '@/components/site/Media'
import type { TripVM } from '@/lib/content'
import { tripHref } from '@/lib/routes'

/**
 * Featured journeys: a row of photos where one journey at a time is large,
 * with its name and a short line; the others are smaller photos without
 * text. Move with the arrows, by tapping a photo, by swiping or with the
 * arrow keys; the selected journey opens on click. One step at a time, so
 * nothing is skipped, and page scrolling stays normal.
 */
type Copy = { eyebrow?: string | null; statement?: string | null; emphasis?: string | null; intro?: string | null }

const usd = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
const kind = (t: TripVM) => (t.type === 'coastal' ? 'Coast' : t.type === 'walking' ? 'On foot' : 'Safari')

export function Journeys({ trips, copy = {} }: { trips: TripVM[]; copy?: Copy }) {
  const [i, setI] = useState(0)
  const total = trips.length
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const moved = useRef(false)
  const go = useCallback((to: number) => setI(Math.max(0, Math.min(total - 1, to))), [total])

  // the selected journey is announced to screen readers as it changes
  const [announce, setAnnounce] = useState('')
  useEffect(() => {
    const t = trips[i]
    const raf = requestAnimationFrame(() => setAnnounce(t ? `${i + 1} of ${total}: ${t.title}` : ''))
    return () => cancelAnimationFrame(raf)
  }, [i, total, trips])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1) }
  }
  const onDown = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY }
    moved.current = false
  }
  const onUp = (e: PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y)) {
      moved.current = true
      go(i + (dx < 0 ? 1 : -1))
    }
  }

  const eyebrow = copy.eyebrow || 'Featured journeys'
  const statement = copy.statement || 'Our favourite journeys from Diani.'
  const emphasis = copy.statement ? copy.emphasis : 'favourite'

  return (
    <section id="journeys" data-tone="night" aria-labelledby="journeys-title" className="overflow-hidden py-24 sm:py-32">
      <div className="gutter grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow text-ochre">04 · {eyebrow}</p>
          <h2 id="journeys-title" className="statement mt-4 max-w-[14ch]">
            <Emphasis text={statement} emphasis={emphasis} />
          </h2>
        </div>
        {copy.intro && <p className="max-w-[40ch] text-cream/80 lg:justify-self-end lg:pb-3">{copy.intro}</p>}
      </div>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured journeys"
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (swipe.current = null)}
        className="journey-rail relative mt-14 touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-orange/70 sm:mt-20"
        style={{ ['--i' as string]: i }}
      >
        <ul className="journey-track flex items-end">
          {trips.map((t, k) => {
            const active = k === i
            return (
              <li key={t.slug} className={`journey-item shrink-0 ${active ? 'is-active' : ''}`} aria-current={active ? 'true' : undefined}>
                <Link
                  href={tripHref(t)}
                  data-cta={`home-journeys-${t.slug}`}
                  aria-label={active ? `${t.title}: view journey` : `Show ${t.title}`}
                  tabIndex={active ? 0 : -1}
                  draggable={false}
                  onClick={(e) => {
                    // a swipe never opens a journey; a tap on a smaller photo selects it
                    if (moved.current || !active) {
                      e.preventDefault()
                      if (!moved.current) go(k)
                    }
                  }}
                  className="journey-photo relative block h-full w-full overflow-hidden bg-night"
                >
                  <div className="journey-img absolute inset-0">
                    <Media media={t.heroImage} fallback={t.type === 'coastal' ? 'coast' : t.type === 'walking' ? 'dawn' : 'safari'} sizes="(min-width:1024px) 30vw, 75vw" />
                  </div>
                  <div className="journey-shade absolute inset-0" aria-hidden="true" />
                  <div className="journey-text absolute inset-x-0 bottom-0 p-5 text-cream sm:p-7" aria-hidden={!active}>
                    <h3 className="font-display text-[2.1rem] font-medium leading-[0.98] tracking-[-0.01em] sm:text-5xl">{t.title}</h3>
                    <p className="mt-2 text-sm text-cream/85">
                      {kind(t)} · {t.days} {t.days === 1 ? 'day' : 'days'}{t.priceFrom ? ` · from ${usd(t.priceFrom)}` : ''}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        {i > 0 && (
          <button type="button" onClick={() => go(i - 1)} className="journey-arrow journey-arrow--prev" aria-label="Previous journey">
            <Icon name="arrow-left" size={44} strokeWidth={1.25} />
          </button>
        )}
        {i < total - 1 && (
          <button type="button" onClick={() => go(i + 1)} className="journey-arrow journey-arrow--next" aria-label="Next journey">
            <Icon name="arrow-right" size={44} strokeWidth={1.25} />
          </button>
        )}
        <p className="sr-only" aria-live="polite">{announce}</p>
      </div>

      <div className="gutter mt-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <p className="font-semibold tabular-nums text-sm tracking-[0.06em]">
            <span className="text-ochre">{String(i + 1).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
          </p>
          {/* on phones the arrows sit here; on larger screens they sit on the photos */}
          <div className="flex gap-2 sm:hidden">
            <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="grid size-11 place-items-center rounded-full border border-cream/40 disabled:opacity-30" aria-label="Previous journey">
              <Icon name="arrow-left" size={18} />
            </button>
            <button type="button" onClick={() => go(i + 1)} disabled={i >= total - 1} className="grid size-11 place-items-center rounded-full border border-cream/40 disabled:opacity-30" aria-label="Next journey">
              <Icon name="arrow-right" size={18} />
            </button>
          </div>
        </div>
        <Link href="/safaris" className="inline-flex items-center gap-2 text-sm font-semibold" data-cta="home-journeys-all">
          All journeys <Icon name="arrow-right" size={16} />
        </Link>
      </div>
    </section>
  )
}
