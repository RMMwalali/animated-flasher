'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { brandPaths } from '@/components/brand/paths'
import { Icon } from '@/components/icons/Icon'
import { Brush } from '@/components/site/Brush'
import { BrushCircle } from '@/components/site/BrushCircle'
import { Scene } from '@/components/site/Scene'
import { SoundToggle } from '@/components/site/SoundToggle'
import { ENTERED_EVENT } from '@/components/site/WelcomeGate'
import type { MediaVM, StageSlide } from '@/lib/content'

type Props = { slides: StageSlide[]; seconds: number; film?: MediaVM | null; title: string; children?: React.ReactNode }

/**
 * The home stage: one full-screen scene at a time (photo, muted clip or
 * illustration) with a single statement. Scenes cross-fade on a timer; the
 * statement's words rise in and its key word is underlined with a brush
 * stroke. Pauses on hover/focus, when the tab is hidden, and via a button.
 */
export function Stage({ slides, seconds, film, title, children }: Props) {
  const [i, setI] = useState(0)
  const [entered, setEntered] = useState(false)
  const [paused, setPaused] = useState(false)
  const [hover, setHover] = useState(false)
  const [filmOpen, setFilmOpen] = useState(false)
  const root = useRef<HTMLElement>(null)
  const n = slides.length

  // Start once the welcome has finished (or immediately for repeat visits).
  useEffect(() => {
    const go = () => setEntered(true)
    if (document.documentElement.dataset.intro === 'done' || document.documentElement.dataset.intro === 'seen') {
      const raf = requestAnimationFrame(go)
      return () => cancelAnimationFrame(raf)
    }
    window.addEventListener(ENTERED_EVENT, go, { once: true })
    return () => window.removeEventListener(ENTERED_EVENT, go)
  }, [])

  // Respect reduced motion: no auto-advance.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const raf = requestAnimationFrame(() => setPaused(true))
      return () => cancelAnimationFrame(raf)
    }
  }, [])

  const running = entered && !paused && !hover && !filmOpen && n > 1
  useEffect(() => {
    if (!running) return
    let hidden = document.hidden
    const onVis = () => (hidden = document.hidden)
    document.addEventListener('visibilitychange', onVis)
    const t = setInterval(() => {
      if (!hidden) setI((x) => (x + 1) % n)
    }, Math.max(3, seconds) * 1000)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [running, n, seconds])

  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n])

  return (
    <section
      ref={root}
      data-tone="night"
      className="stage relative isolate h-[100svh] min-h-[560px] overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Ngina at a glance"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <h1 className="sr-only">{title}</h1>

      {/* scenes */}
      {slides.map((s, k) => (
        <div
          key={k}
          className={`stage-scene absolute inset-0 -z-10 ${k === i ? 'is-active' : ''}`}
          aria-hidden={k !== i}
          role="group"
          aria-roledescription="slide"
          aria-label={`${k + 1} of ${n}`}
        >
          <div className="stage-media absolute inset-0">
            {s.image?.url ? (
              <Image
                src={s.image.url}
                alt={k === i ? s.image.alt : ''}
                fill
                sizes="100vw"
                priority={k === 0}
                className="object-cover"
                style={{ objectPosition: s.image.focalX != null ? `${s.image.focalX}% ${s.image.focalY}%` : undefined }}
              />
            ) : (
              <Scene kind={s.scene} parallax={false} />
            )}
            {s.video?.url && entered && (k === i || k === (i + 1) % n) && (
              <video className="absolute inset-0 h-full w-full object-cover" src={s.video.url} poster={s.image?.url} muted loop playsInline autoPlay={k === i} preload="metadata" aria-hidden="true" />
            )}
          </div>
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgb(10_29_25/0.15)_0%,rgb(10_29_25/0.55)_70%),linear-gradient(180deg,rgb(10_29_25/0.55)_0%,transparent_30%,transparent_65%,rgb(10_29_25/0.7)_100%)]" />

      {/* statements */}
      <div className="gutter absolute inset-0 grid place-items-center text-center text-cream" aria-live={running ? 'off' : 'polite'}>
        {slides.map((s, k) => (
          <p key={k} className={`stage-line statement col-start-1 row-start-1 max-w-[15ch] ${k === i && entered ? 'is-active' : ''}`} aria-hidden={k !== i}>
            <Words text={s.statement} emphasis={s.emphasis} />
          </p>
        ))}
      </div>

      {/* bottom bar */}
      <div className="gutter absolute inset-x-0 bottom-0 grid grid-cols-[1fr_auto_1fr] items-end pb-5 text-cream sm:pb-8">
        <div className="flex items-center gap-3">
          {film?.url && (
            <button type="button" onClick={() => setFilmOpen(true)} className="group flex min-h-11 items-center gap-3" aria-haspopup="dialog">
              <span className="relative grid size-11 place-items-center">
                <BrushCircle className="absolute inset-0 size-full text-orange" />
                <Icon name="play" size={16} />
              </span>
              <span className="eyebrow hidden sm:inline">Watch the film</span>
            </button>
          )}
          {n > 1 && (
            <div className="hidden items-center gap-2 sm:flex">
              <button type="button" onClick={() => go(-1)} className="grid size-11 place-items-center rounded-full hover:bg-cream/10" aria-label="Previous scene">
                <Icon name="chevron-left" size={18} />
              </button>
              <span className="font-semibold tabular-nums text-xs tracking-[0.06em]" aria-live="off">
                <span className="text-ochre">{String(i + 1).padStart(2, '0')}</span> / {String(n).padStart(2, '0')}
              </span>
              <button type="button" onClick={() => go(1)} className="grid size-11 place-items-center rounded-full hover:bg-cream/10" aria-label="Next scene">
                <Icon name="chevron-right" size={18} />
              </button>
            </div>
          )}
        </div>

        <Link href="/destinations" className="explore-cta group relative flex flex-col items-center gap-2 px-6 pb-1 pt-10" data-cta="home-stage-explore" aria-label="Explore Ngina: destinations">
          <svg viewBox={brandPaths.horizon.box.join(' ')} preserveAspectRatio="none" className="absolute bottom-0 left-1/2 h-3 w-[min(70vw,420px)] -translate-x-1/2 text-cream/80" aria-hidden="true">
            <path d={brandPaths.horizon.d} fill="currentColor" />
          </svg>
          <svg viewBox={brandPaths.acacia.box.join(' ')} className="w-16 text-ochre transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1 sm:w-20" aria-hidden="true">
            <path d={brandPaths.acacia.d} fill="currentColor" fillRule="evenodd" />
          </svg>
          <span className="relative mb-4 font-semibold tabular-nums text-xs uppercase tracking-[0.06em] sm:text-sm">
            Explore Ngina
            <Brush seed="Explore Ngina" draw={false} className="emphasis-brush absolute -bottom-2 left-0 h-2 w-full" />
          </span>
        </Link>

        <div className="flex items-center justify-end gap-2">
          {n > 1 && (
            <button type="button" onClick={() => setPaused((p) => !p)} className="grid size-11 place-items-center rounded-full hover:bg-cream/10" aria-label={paused ? 'Play scenes' : 'Pause scenes'} aria-pressed={paused}>
              <Icon name={paused ? 'play' : 'pause'} size={16} />
            </button>
          )}
          <SoundToggle className="hidden lg:grid" />
        </div>
      </div>

      {children}

      {film?.url && (
        <Dialog open={filmOpen} onClose={() => setFilmOpen(false)} className="relative z-[80]">
          <div className="fixed inset-0 bg-night/95" aria-hidden="true" />
          <div className="fixed inset-0 grid place-items-center p-4">
            <DialogPanel className="relative w-full max-w-6xl">
              <DialogTitle className="sr-only">Film</DialogTitle>
              <video src={film.url} controls autoPlay playsInline className="aspect-video w-full rounded-xl bg-night" />
              <button type="button" onClick={() => setFilmOpen(false)} className="absolute -top-14 right-0 flex min-h-11 items-center gap-2 text-cream">
                <Icon name="close" /> <span className="eyebrow">Close</span>
              </button>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </section>
  )
}

/** Splits a statement into words that rise in one after another; the emphasis gets a brush underline. */
function Words({ text, emphasis }: { text: string; emphasis?: string | null }) {
  const words = text.split(/\s+/)
  const em = emphasis?.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, '')
  return (
    <>
      {words.map((w, k) => {
        const bare = w.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, '')
        const isEm = Boolean(em) && bare === em
        const punct = isEm ? (/[.,;:!?…]+$/.exec(w)?.[0] ?? '') : ''
        const core = punct ? w.slice(0, -punct.length) : w
        return (
          <Fragment key={k}>
            <span className="stage-word" style={{ ['--w' as string]: k }}>
              {isEm ? (
                <span className="stage-em relative inline-block">
                  {core}
                  <Brush seed={core} draw={false} className="stage-brush emphasis-brush absolute -bottom-[0.1em] left-[-3%] h-[0.28em] w-[106%]" />
                </span>
              ) : (
                w
              )}
              {punct}
            </span>
            {k < words.length - 1 && ' '}
          </Fragment>
        )
      })}
    </>
  )
}
