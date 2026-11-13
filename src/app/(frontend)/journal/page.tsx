import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/page/PageHero'
import { Media } from '@/components/site/Media'
import { getPosts } from '@/lib/content'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600
export const metadata: Metadata = pageMeta({ title: 'Journal: Kenya safari and coast guides from Diani', description: 'Practical guides and field notes from our Diani Beach team: Tsavo, Kisite-Mpunguti, the seasons and planning a Kenya trip.', path: '/journal', ogTitle: 'Field notes from Diani' })

const date = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function JournalPage() {
  const posts = await getPosts()
  return (
    <>
      <PageHero eyebrow="Journal" title="Field notes from Diani." emphasis="notes" intro="Plain, practical guides written by the people who plan our trips." tone="cream" compact crumbs={[{ name: 'Journal', path: '/journal' }]} />
      <section data-tone="cream" className="pb-24">
        <div className="gutter mx-auto grid max-w-7xl gap-x-10 gap-y-16 md:grid-cols-2">
          {posts.map((p, i) => (
            <article key={p.slug} className={i === 0 ? 'md:col-span-2' : ''}>
              <Link href={`/journal/${p.slug}`} className="group grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
                <div className={`relative overflow-hidden rounded-2xl ${i === 0 ? 'aspect-[16/10]' : 'aspect-[4/3] md:col-span-2'}`}>
                  <div className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105">
                    <Media media={p.heroImage} fallback={p.topics.includes('coast') || p.topics.includes('marine') ? 'coast' : 'safari'} sizes="(min-width:768px) 60vw, 100vw" />
                  </div>
                </div>
                <div className={i === 0 ? '' : 'md:col-span-2'}>
                  <p className="eyebrow text-teal-ink">{date(p.publishedAt)} · {p.author.name}</p>
                  <h2 className={`mt-3 font-display font-medium leading-tight ${i === 0 ? 'text-4xl sm:text-5xl' : 'text-3xl'}`}><span className="link-u">{p.title}</span></h2>
                  <p className="mt-3 text-lg opacity-90">{p.excerpt}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
