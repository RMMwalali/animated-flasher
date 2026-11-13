import type { Metadata } from 'next'
import { Blocks } from '@/components/page/Blocks'
import { ExperienceCard } from '@/components/page/Cards'
import { CtaBand } from '@/components/page/CtaBand'
import { PageHero } from '@/components/page/PageHero'
import { SectionHead } from '@/components/page/SectionHead'
import { getExperiences, getPage } from '@/lib/content'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPage('experiences')
  return pageMeta({ title: 'Experiences on the Kenya coast and on safari', description: 'Dhow sails, snorkelling at Kisite, kitesurfing, colobus walks, hot-air balloons over the Mara, Shimoni caves and Gede Ruins: add any of these to your trip.', path: '/experiences', seo: p?.seo })
}

const CATS = [
  { key: 'water', title: 'On the water', tone: 'coast' },
  { key: 'wild', title: 'In the wild', tone: 'cream' },
  { key: 'culture', title: 'Culture & history', tone: 'night' },
  { key: 'foot', title: 'On foot', tone: 'cream' },
] as const

export default async function ExperiencesPage() {
  const [page, all] = await Promise.all([getPage('experiences'), getExperiences()])
  const hero = page?.hero
  return (
    <>
      <PageHero eyebrow={hero?.eyebrow || 'Experiences'} title={hero?.statement || 'Small moments that make a journey.'} emphasis={hero?.emphasis || 'moments'} intro={hero?.intro || 'Add any of these to a safari or a stay on the coast.'} image={hero?.image} tone="coast" crumbs={[{ name: 'Experiences', path: '/experiences' }]} />
      {CATS.map((c, i) => {
        const list = all.filter((e) => e.category === c.key)
        if (!list.length) return null
        return (
          <section key={c.key} data-tone={c.tone} className="py-20 sm:py-24">
            <div className="gutter mx-auto max-w-7xl">
              <SectionHead n={i + 1} eyebrow="Experiences" title={c.title} />
              <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((e) => <ExperienceCard key={e.slug} e={e} />)}
              </div>
            </div>
          </section>
        )
      })}
      {page?.layout?.length ? <Blocks blocks={page.layout} /> : null}
      <CtaBand title="Build these into your trip." emphasis="your" ctaId="experiences-cta" />
    </>
  )
}
