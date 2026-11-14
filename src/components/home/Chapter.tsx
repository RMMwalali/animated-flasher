import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'
import { Emphasis } from '@/components/site/Emphasis'
import { LazyVideo } from '@/components/site/LazyVideo'
import { Media } from '@/components/site/Media'
import type { HomeVM } from '@/lib/content'

type Ch = HomeVM['coast']

/**
 * Full-screen chapter: the media is pinned on desktop while the statement,
 * body and numbered points scroll past (coast = light blue, safari = green).
 */
export function Chapter({ chapter, tone, n, flip = false }: { chapter: Ch; tone: 'coast' | 'safari'; n: number; flip?: boolean }) {
  const id = `chapter-${tone}`
  return (
    <section data-tone={tone} className="relative" aria-labelledby={id}>
      <div className={`lg:grid lg:grid-cols-2 ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div className="relative h-[72svh] overflow-hidden lg:h-[100svh]" data-pin>
          <Media media={chapter.image} fallback={tone === 'coast' ? 'coast' : 'safari'} sizes="(min-width:1024px) 50vw, 100vw" zoom />
          {chapter.video?.url && <LazyVideo src={chapter.video.url} poster={chapter.image?.url} label={chapter.video.alt || chapter.statement} />}
          <span className="eyebrow absolute left-4 top-24 rounded-full bg-night/70 px-3 py-1.5 text-cream backdrop-blur-sm sm:left-8">{String(n).padStart(2, '0')} · {chapter.eyebrow}</span>
        </div>
        <div className="gutter grid content-center gap-10 py-20 lg:min-h-[140svh] lg:py-40">
          <h2 id={id} className="statement max-w-[14ch]" data-reveal>
            <Emphasis text={chapter.statement} emphasis={chapter.emphasis} />
          </h2>
          {chapter.body && <p className="max-w-lg text-lg leading-relaxed" data-reveal>{chapter.body}</p>}
          <ol className="grid max-w-lg border-t border-current/40">
            {chapter.points.map((p, i) => (
              <li key={p.title} className="grid grid-cols-[2.5rem_1fr] gap-2 border-b border-current/25 py-5" data-reveal style={{ ['--d' as string]: `${i * 0.08}s` }}>
                <span className="tone-accent font-semibold tabular-nums text-sm">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block font-display text-2xl font-medium leading-tight">{p.title}</span>
                  {p.text && <span className="mt-1 block opacity-85">{p.text}</span>}
                </span>
              </li>
            ))}
          </ol>
          {chapter.linkHref && (
            <Link href={chapter.linkHref} className="btn btn-ghost w-fit" data-cta={`home-${tone}-link`} data-reveal>
              <span>{chapter.linkLabel}</span> <Icon name="arrow-right" size={18} />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
