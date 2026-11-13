import type { Metadata } from 'next'
import Link from 'next/link'
import { WhenToGo } from '@/components/home/WhenToGo'
import { Blocks } from '@/components/page/Blocks'
import { CtaBand } from '@/components/page/CtaBand'
import { PageHero } from '@/components/page/PageHero'
import { SectionHead } from '@/components/page/SectionHead'
import { getDestinations, getHome, getPage } from '@/lib/content'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600

const MONTHS = [['jan', 'January'], ['feb', 'February'], ['mar', 'March'], ['apr', 'April'], ['may', 'May'], ['jun', 'June'], ['jul', 'July'], ['aug', 'August'], ['sep', 'September'], ['oct', 'October'], ['nov', 'November'], ['dec', 'December']] as const

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPage('when-to-go')
  return pageMeta({ title: 'When to go to Kenya: safari and coast, month by month', description: 'Kenya\'s dry seasons, long and short rains, the Great Migration and humpback whale season, with the best places to visit each month from Diani Beach.', path: '/when-to-go', seo: p?.seo })
}

export default async function WhenPage() {
  const [page, home, destinations] = await Promise.all([getPage('when-to-go'), getHome(), getDestinations()])
  const hero = page?.hero
  return (
    <>
      <PageHero eyebrow={hero?.eyebrow || 'Seasons'} title={hero?.statement || 'There is no wrong month, only different ones.'} emphasis={hero?.emphasis || 'different'} intro={hero?.intro || 'Kenya sits on the equator, so temperatures change little. The rains shape the seasons.'} image={hero?.image ?? destinations.find((d) => d.slug === 'maasai-mara')?.heroImage} tone="coast" crumbs={[{ name: 'When to go', path: '/when-to-go' }]} />
      <WhenToGo home={home} n={1} />
      <section data-tone="cream" className="py-20 sm:py-24">
        <div className="gutter mx-auto max-w-7xl">
          <SectionHead n={2} eyebrow="Month by month" title="Where is best, and when." emphasis="when" intro="Places at their best in each month, based on the seasons above. Many are good all year." />
          <ol className="mt-12 grid gap-0 border-t border-deep sm:grid-cols-2 lg:grid-cols-3">
            {MONTHS.map(([m, name]) => {
              const best = destinations.filter((d) => d.bestMonths.includes(m))
              return (
                <li key={m} id={m} className="border-b border-line py-6 sm:pr-8">
                  <h3 className="font-display text-2xl font-medium">{name}</h3>
                  <p className="mt-2 text-sm leading-relaxed">
                    {best.length ? best.map((d, i) => <span key={d.slug}>{i > 0 && ', '}<Link className="underline underline-offset-4" href={`/destinations/${d.slug}`}>{d.name}</Link></span>) : 'Green season: quieter parks and lower prices.'}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>
      {page?.layout?.length ? <Blocks blocks={page.layout} /> : null}
      <CtaBand title="Tell us your month. We will do the rest." emphasis="month" ctaId="when-cta" />
    </>
  )
}
