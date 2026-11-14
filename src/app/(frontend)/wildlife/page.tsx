import type { Metadata } from 'next'
import Link from 'next/link'
import { MonthBar } from '@/components/home/JourneyCard'
import { CtaBand } from '@/components/page/CtaBand'
import { PageHero } from '@/components/page/PageHero'
import { SectionHead } from '@/components/page/SectionHead'
import { Media } from '@/components/site/Media'
import { getWildlife } from '@/lib/content'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600
export const metadata: Metadata = pageMeta({
  title: 'Kenya wildlife guide: what to see and where',
  description: 'Elephants, lions, leopards, Grevy\'s zebra, sable antelope, colobus monkeys, humpback whales and dolphins: where to see Kenya\'s wildlife on a trip from Diani.',
  path: '/wildlife',
  ogTitle: 'Who you might meet',
})

const GROUPS = [
  { key: 'predators', title: 'Big cats & predators', tone: 'night' },
  { key: 'grazers', title: 'Giants & grazers', tone: 'cream' },
  { key: 'primates', title: 'Primates', tone: 'safari' },
  { key: 'birds', title: 'Birds', tone: 'cream' },
  { key: 'marine', title: 'Marine life', tone: 'coast' },
] as const

export default async function WildlifePage() {
  const all = await getWildlife()
  const hero = all.find((w) => w.slug === 'lion')?.image ?? all.find((w) => w.image)?.image
  return (
    <>
      <PageHero eyebrow="Wildlife guide" title="Who you might meet." emphasis="meet" intro="From the elephants of Tsavo to the dolphins of Kisite: what lives where, and the best time to see it. Wild animals keep their own schedules, so sightings are never guaranteed." image={hero} tone="safari" crumbs={[{ name: 'Wildlife', path: '/wildlife' }]} />
      <nav aria-label="Wildlife groups" data-tone="cream" className="sticky top-0 z-30 border-b border-line bg-cream/95 backdrop-blur">
        <ul className="gutter flex gap-6 overflow-x-auto py-3 font-semibold tabular-nums text-xs uppercase tracking-[0.06em]">
          {GROUPS.filter((g) => all.some((w) => w.group === g.key)).map((g) => (
            <li key={g.key}><a href={`#${g.key}`} className="link-u whitespace-nowrap">{g.title}</a></li>
          ))}
        </ul>
      </nav>
      {GROUPS.map((g, gi) => {
        const list = all.filter((w) => w.group === g.key)
        if (!list.length) return null
        return (
          <section key={g.key} id={g.key} data-tone={g.tone} className="scroll-mt-16 py-20 sm:py-24">
            <div className="gutter mx-auto max-w-7xl">
              <SectionHead n={gi + 1} eyebrow="Wildlife" title={g.title} />
              <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((w) => (
                  <article key={w.slug} id={w.slug} className="scroll-mt-24">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      <Media media={w.image} fallback={g.key === 'marine' ? 'coast' : 'safari'} sizes="(min-width:1024px) 30vw, 90vw" />
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-medium">{w.name}</h3>
                    <p className="mt-1 font-semibold tabular-nums text-xs uppercase tracking-[0.06em] opacity-80">
                      {[w.swahiliName && `Swahili: ${w.swahiliName}`, w.scientificName].filter(Boolean).join(' · ')}
                    </p>
                    <p className="mt-3 opacity-90">{w.description}</p>
                    {w.tip && <p className="mt-3 text-sm italic opacity-85">Guide&apos;s tip: {w.tip}</p>}
                    {w.whereToSee.length > 0 && (
                      <p className="mt-4 text-sm">
                        <span className="eyebrow tone-accent mr-2">Where</span>
                        {w.whereToSee.map((d, i) => (
                          <span key={d.slug}>{i > 0 && ', '}<Link href={`/destinations/${d.slug}`} className="underline underline-offset-4">{d.name}</Link></span>
                        ))}
                      </p>
                    )}
                    {w.bestMonths.length > 0 && <div className="mt-4 max-w-56"><span className="eyebrow tone-accent">Best months</span><MonthBar months={w.bestMonths} className="mt-2" /></div>}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )
      })}
      <CtaBand title="Tell us who you hope to see." emphasis="see" ctaId="wildlife-cta" />
    </>
  )
}
