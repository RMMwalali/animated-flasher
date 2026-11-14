import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/page/PageHero'
import { env } from '@/lib/env'
import { getPosts } from '@/lib/content'
import { JsonLd } from '@/lib/seo/jsonld'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600
type Props = { params: Promise<{ slug: string }> }

async function authorData(slug: string) {
  const posts = (await getPosts()).filter((p) => p.author.slug === slug)
  return posts.length ? { author: posts[0]!.author, posts } : null
}

export async function generateStaticParams() {
  return [...new Set((await getPosts()).map((p) => p.author.slug))].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await authorData((await params).slug)
  if (!a) return {}
  return pageMeta({ title: `${a.author.name}: guides and articles`, description: a.author.bio, path: `/blog/author/${a.author.slug}` })
}

export default async function AuthorPage({ params }: Props) {
  const a = await authorData((await params).slug)
  if (!a) notFound()
  const { author, posts } = a
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Person', name: author.name, jobTitle: author.role ?? undefined, description: author.bio, knowsAbout: author.expertise, url: new URL(`/blog/author/${author.slug}`, env.SITE_URL).toString(), worksFor: { '@id': new URL('/#organization', env.SITE_URL).toString() } }} />
      <PageHero eyebrow="Author" title={author.name} intro={author.role} tone="cream" compact crumbs={[{ name: 'Blog', path: '/blog' }, { name: author.name, path: `/blog/author/${author.slug}` }]} />
      <section data-tone="cream" className="pb-24">
        <div className="gutter mx-auto grid max-w-5xl gap-12 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-lg leading-relaxed">{author.bio}</p>
            {author.expertise.length > 0 && <p className="mt-4 text-sm"><span className="eyebrow mr-2 text-teal-ink">Knows about</span>{author.expertise.join(', ')}</p>}
            {author.qualifications.length > 0 && <p className="mt-2 text-sm"><span className="eyebrow mr-2 text-teal-ink">Qualifications</span>{author.qualifications.join(', ')}</p>}
          </div>
          <ul className="border-t border-deep">
            {posts.map((p) => (
              <li key={p.slug} className="border-b border-line py-5">
                <Link href={`/blog/${p.slug}`} className="font-display text-2xl link-u">{p.title}</Link>
                <p className="mt-1 opacity-85">{p.excerpt}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
