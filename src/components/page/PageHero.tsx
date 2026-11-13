import { Emphasis } from '@/components/site/Emphasis'
import { Media } from '@/components/site/Media'
import type { MediaVM } from '@/lib/content'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'

type Tone = 'night' | 'coast' | 'safari' | 'cream'
const SCENE: Record<Tone, 'night' | 'coast' | 'safari' | 'dawn'> = { night: 'night', coast: 'coast', safari: 'safari', cream: 'dawn' }

/**
 * Cinematic opening for inner pages: full-bleed photo (or illustrated
 * scene), one statement with an emphasised word, short intro, breadcrumbs.
 */
export function PageHero({
  eyebrow, title, emphasis, intro, image, tone = 'night', crumbs, compact = false, children,
}: {
  eyebrow?: string | null; title: string; emphasis?: string | null; intro?: string | null; image?: MediaVM | null
  tone?: Tone; crumbs?: Crumb[]; compact?: boolean; children?: React.ReactNode
}) {
  const light = tone === 'cream' && !image
  return (
    <section
      data-tone={light ? 'cream' : 'night'}
      className={`relative isolate flex items-end overflow-hidden ${compact ? 'min-h-[62svh]' : 'min-h-[86svh]'} ${light ? 'pt-36' : ''}`}
    >
      {!light && (
        <div className="absolute inset-0 -z-10">
          <Media media={image} fallback={SCENE[tone]} priority sizes="100vw" zoom />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_29_25/0.55)_0%,rgb(10_29_25/0.15)_35%,rgb(10_29_25/0.8)_100%)]" />
        </div>
      )}
      <div className="gutter relative w-full pb-14 pt-36 sm:pb-20">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && (
          <p className={`eyebrow mt-6 ${light ? 'text-teal-ink' : 'inline-block rounded-full bg-night/75 px-3 py-1.5 text-ochre backdrop-blur-sm'}`} data-reveal>
            {eyebrow}
          </p>
        )}
        <h1 className="statement mt-4 max-w-[18ch]" data-reveal style={{ ['--d' as string]: '0.08s' }}>
          <Emphasis text={title} emphasis={emphasis} />
        </h1>
        {intro && (
          <p className={`mt-6 max-w-2xl text-lg leading-relaxed ${light ? 'text-deep/85' : 'text-cream/90'}`} data-reveal style={{ ['--d' as string]: '0.2s' }}>
            {intro}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}
