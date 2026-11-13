import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CtaBand } from '@/components/page/CtaBand'
import { Faq } from '@/components/page/Faq'
import { PageHero } from '@/components/page/PageHero'
import { Prose } from '@/components/page/Prose'
import { lexicalToText } from '@/content/lexical'
import { getPost, getPosts } from '@/lib/content'
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
  return pageMeta({ title: p.title, description: p.excerpt, path: `/journal/${p.slug}`, seo: p.seo, type: 'article', ogTitle: p.title })
}

export default async function PostPage({ params }: Props) {
  const p = await getPost((await params).slug)
  if (!p) notFound()
  const words = lexicalToText(p.content).split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 220))
  return (
    <>
      <JsonLd data={[article(p), faqPage(p.faqs)]} />
      <PageHero eyebrow={`Journal · ${minutes} min read`} title={p.title} intro={p.excerpt} image={p.heroImage} tone={p.heroImage ? 'night' : 'cream'} compact crumbs={[{ name: 'Journal', path: '/journal' }, { name: p.title, path: `/journal/${p.slug}` }]} />
      <article data-tone="cream" className="py-14 sm:py-20">
        <div className="gutter mx-auto max-w-3xl">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-line py-4 text-sm">
            <span>By <Link href={`/journal/author/${p.author.slug}`} className="font-semibold underline underline-offset-4">{p.author.name}</Link></span>
            <span aria-hidden="true">·</span>
            <time dateTime={p.publishedAt}>{new Date(p.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
            {p.updatedAt && p.updatedAt.slice(0, 10) !== p.publishedAt.slice(0, 10) && (
              <><span aria-hidden="true">·</span><span>Updated <time dateTime={p.updatedAt}>{new Date(p.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time></span></>
            )}
          </p>
          <Prose data={p.content} className="mt-10" />
          {p.faqs.length > 0 && <div className="mt-16"><Faq items={p.faqs} /></div>}
          <aside className="mt-16 grid gap-2 rounded-3xl bg-paper p-7" aria-label="About the author">
            <p className="eyebrow text-teal-ink">About the author</p>
            <p className="font-display text-2xl">{p.author.name}</p>
            {p.author.role && <p className="text-sm text-deep/85">{p.author.role}</p>}
            <p className="mt-2">{p.author.bio}</p>
            <Link href={`/journal/author/${p.author.slug}`} className="mt-2 text-sm underline underline-offset-4">More from {p.author.name}</Link>
          </aside>
        </div>
      </article>
      <CtaBand ctaId={`post-${p.slug}-cta`} />
    </>
  )
}
