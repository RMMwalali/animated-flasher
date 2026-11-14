import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostCard } from '@/components/blog/PostCard'
import { ReadingProgress } from '@/components/blog/ReadingProgress'
import { Share } from '@/components/blog/Share'
import { Toc } from '@/components/blog/Toc'
import { CtaBand } from '@/components/page/CtaBand'
import { Faq } from '@/components/page/Faq'
import { PageHero } from '@/components/page/PageHero'
import { Prose } from '@/components/page/Prose'
import { Media } from '@/components/site/Media'
import { TOPIC_LABELS, formatDate, headingAnchors, readingMinutes, relatedPosts } from '@/lib/blog'
import { getPost, getPosts } from '@/lib/content'
import { env } from '@/lib/env'
import { JsonLd, article, faqPage } from '@/lib/seo/jsonld'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600
type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug)
  if (!p) return {}
  return pageMeta({ title: p.title, description: p.excerpt, path: `/blog/${p.slug}`, seo: p.seo, type: 'article', ogTitle: p.title })
}

export default async function PostPage({ params }: Props) {
  const p = await getPost((await params).slug)
  if (!p) notFound()
  const minutes = readingMinutes(p.content)
  const { toc, ids } = headingAnchors(p.content)
  const related = relatedPosts(p, await getPosts())
  const url = new URL(`/blog/${p.slug}`, env.SITE_URL).toString()
  const updated = !p.sample && p.updatedAt && p.updatedAt.slice(0, 10) !== p.publishedAt.slice(0, 10) ? p.updatedAt : null
  const topic = p.topics[0] ? TOPIC_LABELS[p.topics[0]] : null

  return (
    <>
      <JsonLd data={[article(p), faqPage(p.faqs)]} />
      <ReadingProgress target="#article-body" />
      <PageHero
        eyebrow={`Blog${topic ? ` · ${topic}` : ''} · ${minutes} min read`}
        title={p.title}
        intro={p.excerpt}
        image={p.heroImage}
        tone={p.heroImage ? 'night' : 'cream'}
        compact
        crumbs={[{ name: 'Blog', path: '/blog' }, { name: p.title, path: `/blog/${p.slug}` }]}
      />
      <article id="article-body" data-tone="cream" className="py-14 sm:py-20">
        <div className="gutter mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span>By <Link href={`/blog/author/${p.author.slug}`} className="font-semibold underline underline-offset-4">{p.author.name}</Link></span>
                <span aria-hidden="true">·</span>
                <time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time>
                {updated && <><span aria-hidden="true">·</span><span>Updated <time dateTime={updated}>{formatDate(updated)}</time></span></>}
              </p>
            </div>
            {toc.length > 1 && <div className="mt-8 lg:hidden"><Toc items={toc} variant="inline" /></div>}
            <Prose data={p.content} anchors={ids} className="mt-10" />
            {p.faqs.length > 0 && <div className="mt-16"><Faq items={p.faqs} /></div>}
            <div className="mt-14 border-t border-line pt-8"><Share title={p.title} url={url} /></div>
            <aside className="mt-12 grid grid-cols-[auto_1fr] items-start gap-5 rounded-3xl bg-paper p-7" aria-label="About the author">
              <div className="relative size-16 overflow-hidden rounded-full bg-cream">
                {p.author.photo ? <Media media={p.author.photo} sizes="64px" /> : <span className="grid size-full place-items-center font-display text-2xl" aria-hidden="true">{p.author.name.charAt(0)}</span>}
              </div>
              <div>
                <p className="eyebrow text-teal-ink">About the author</p>
                <p className="mt-1 font-display text-2xl">{p.author.name}</p>
                {p.author.role && <p className="text-sm text-deep/85">{p.author.role}</p>}
                <p className="mt-3">{p.author.bio}</p>
                <Link href={`/blog/author/${p.author.slug}`} className="mt-3 inline-block text-sm underline underline-offset-4">More from {p.author.name}</Link>
              </div>
            </aside>
          </div>
          {toc.length > 1 && <div className="hidden lg:block"><Toc items={toc} variant="aside" /></div>}
        </div>
      </article>
      {related.length > 0 && (
        <section data-tone="cream" aria-labelledby="related-title" className="border-t border-line py-20">
          <div className="gutter mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="related-title" className="font-display text-4xl font-medium">Keep reading</h2>
              <Link href="/blog" className="eyebrow link-u">All articles</Link>
            </div>
            <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <PostCard headingLevel="h3" post={{ slug: r.slug, title: r.title, excerpt: r.excerpt, publishedAt: r.publishedAt, topics: r.topics, minutes: readingMinutes(r.content), authorName: r.author.name, heroImage: r.heroImage }} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <CtaBand ctaId={`post-${p.slug}-cta`} />
    </>
  )
}
