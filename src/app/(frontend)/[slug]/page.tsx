import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Blocks } from '@/components/page/Blocks'
import { PageHero } from '@/components/page/PageHero'
import { getPage } from '@/lib/content'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600
export const dynamicParams = true
type Props = { params: Promise<{ slug: string }> }

/** Pages with their own routes; everything else in the Pages collection renders here. */
const RESERVED = new Set(['experiences', 'when-to-go'])

export async function generateStaticParams() {
  return ['our-story', 'kenya-eta', 'privacy', 'terms', 'cookies'].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = RESERVED.has(slug) ? null : await getPage(slug)
  if (!p) return {}
  return pageMeta({ title: p.title, description: p.hero.intro || `${p.title}: Ngina Trails & Safaris, Diani Beach, Kenya.`, path: `/${p.slug}`, seo: p.seo, ogTitle: p.hero.statement || p.title })
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  const p = RESERVED.has(slug) ? null : await getPage(slug)
  if (!p) notFound()
  const tone = (p.hero.tone ?? 'night') as 'night' | 'coast' | 'safari' | 'cream'
  const legal = ['privacy', 'terms', 'cookies'].includes(p.slug)
  return (
    <>
      <PageHero eyebrow={p.hero.eyebrow} title={p.hero.statement || p.title} emphasis={p.hero.emphasis} intro={p.hero.intro} image={p.hero.image} tone={legal ? 'cream' : tone} compact={legal} crumbs={[{ name: p.title, path: `/${p.slug}` }]} />
      <Blocks blocks={p.layout} />
      {legal && p.updatedAt && (
        <p data-tone="cream" className="gutter pb-16 font-mono text-xs uppercase tracking-[0.12em] text-deep/75">
          Last updated {new Date(p.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}
    </>
  )
}
