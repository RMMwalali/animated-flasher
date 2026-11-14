import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'
import { Emphasis } from '@/components/site/Emphasis'
import type { HomeVM } from '@/lib/content'

export function Story({ home }: { home: HomeVM }) {
  return (
    <section id="story" data-tone="cream" className="relative py-28 sm:py-40" aria-labelledby="story-title">
      <div className="gutter mx-auto grid max-w-6xl gap-10">
        <p className="eyebrow text-teal-ink" data-reveal>01 · Our home</p>
        <h2 id="story-title" className="statement" data-reveal>
          <Emphasis text={home.storyStatement} emphasis={home.storyEmphasis} />
        </h2>
        <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
          <div className="grid content-start gap-6" data-reveal>
            {home.heroIntro && <p className="text-xl font-medium leading-relaxed">{home.heroIntro}</p>}
            <p className="text-lg leading-relaxed">{home.storyBody}</p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/plan-your-trip" className="btn btn-primary" data-cta="home-story-plan">
                Plan your trip <Icon name="arrow-right" size={18} />
              </Link>
              <Link href="#journeys" className="btn btn-ghost" data-cta="home-story-journeys">
                <span>See journeys</span> <Icon name="arrow-down" size={18} />
              </Link>
            </div>
          </div>
          <ol className="grid content-start gap-0 border-t border-deep/80" data-reveal style={{ ['--d' as string]: '0.15s' }}>
            {[
              ['Coast by day', 'Diani, Kisite, Mombasa, Lamu'],
              ['Safari beyond', 'Tsavo, Amboseli, the Mara, Samburu'],
              ['On foot', 'Shimba Hills, Kaya forests, Mount Kenya'],
            ].map(([t, d], i) => (
              <li key={t} className="grid grid-cols-[3rem_1fr] items-baseline gap-2 border-b border-line py-4">
                <span className="font-semibold tabular-nums text-sm text-orange-600">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block font-display text-2xl font-medium">{t}</span>
                  <span className="text-deep/80">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
