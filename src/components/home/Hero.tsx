import Link from 'next/link'
import { brandPaths } from '@/components/brand/paths'
import { Icon } from '@/components/icons/Icon'
import { Emphasis } from '@/components/site/Emphasis'
import { LazyVideo } from '@/components/site/LazyVideo'
import { Media } from '@/components/site/Media'
import type { HomeVM } from '@/lib/content'

export function Hero({ home }: { home: HomeVM }) {
  return (
    <section data-tone="night" className="relative isolate flex min-h-[100svh] items-end overflow-hidden" aria-labelledby="hero-title">
      <div className="absolute inset-0 -z-10">
        <Media media={home.heroImage} fallback="dawn" priority sizes="100vw" zoom />
        {home.heroVideo?.url && <LazyVideo src={home.heroVideo.url} poster={home.heroVideo.poster?.url ?? home.heroImage?.url} label={home.heroVideo.alt || 'Background film'} />}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_29_25/0.6)_0%,rgb(10_29_25/0.25)_28%,rgb(10_29_25/0.72)_58%,rgb(10_29_25/0.9)_100%)]" />
      </div>

      <div className="gutter relative w-full pb-16 pt-32 sm:pb-20">
        <p className="eyebrow inline-flex items-center gap-2 rounded-full bg-night/75 px-3 py-1.5 text-ochre backdrop-blur-sm" data-reveal>
          <Icon name="map-pin" size={16} /> {home.heroEyebrow}
        </p>
        <h1 id="hero-title" className="statement mt-5 max-w-[16ch] text-cream" data-reveal style={{ ['--d' as string]: '0.1s' }}>
          <Emphasis text={home.heroStatement} emphasis={home.heroEmphasis} />
        </h1>
        {home.heroIntro && (
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/90" data-reveal style={{ ['--d' as string]: '0.25s' }}>
            {home.heroIntro}
          </p>
        )}
        <div className="mt-9 flex flex-wrap items-center gap-4" data-reveal style={{ ['--d' as string]: '0.4s' }}>
          <Link href="/plan-your-trip" className="btn btn-primary" data-cta="home-hero-plan">
            Plan your trip <Icon name="arrow-right" size={18} />
          </Link>
          <Link href="#journeys" className="btn btn-ghost text-cream" data-cta="home-hero-journeys">
            <span>See journeys</span> <Icon name="arrow-down" size={18} />
          </Link>
        </div>
      </div>

      <ScrollBadge />
    </section>
  )
}

/** Rotating circular badge with the acacia at its centre. */
function ScrollBadge() {
  const [x, y, w, h] = brandPaths.acacia.box
  return (
    <a href="#story" className="absolute bottom-8 right-4 hidden size-32 text-cream sm:right-8 md:grid md:place-items-center" aria-label="Scroll to our story">
      <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0" aria-hidden="true">
        <defs><path id="badge-ring" d="M50 50 m -40 0 a 40 40 0 1 1 80 0 a 40 40 0 1 1 -80 0" /></defs>
        <text className="fill-current font-mono text-[8.5px] uppercase">
          <textPath href="#badge-ring" textLength="250" lengthAdjust="spacingAndGlyphs">Scroll · Coast by day · Safari beyond · </textPath>
        </text>
      </svg>
      <svg viewBox={`${x} ${y} ${w} ${h}`} className="w-14 text-ochre" aria-hidden="true">
        <path d={brandPaths.acacia.d} fill="currentColor" fillRule="evenodd" />
      </svg>
    </a>
  )
}
