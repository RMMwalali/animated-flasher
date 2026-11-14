import type { Metadata } from 'next'
import { BlogIndex } from '@/components/blog/BlogIndex'
import type { PostCardData } from '@/components/blog/PostCard'
import { CtaBand } from '@/components/page/CtaBand'
import { PageHero } from '@/components/page/PageHero'
import { readingMinutes } from '@/lib/blog'
import { getPosts } from '@/lib/content'
import { env } from '@/lib/env'
import { JsonLd } from '@/lib/seo/jsonld'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600
export const metadata: Metadata = pageMeta({
  title: 'Blog: Kenya safari and coast guides from Diani',
  description: 'Practical guides from our Diani Beach team: Tsavo and Amboseli, the Great Migration, Kisite-Mpunguti, what to pack, the Kenya eTA and when to go.',
  path: '/blog',
  ogTitle: 'Safari and coast guides from Diani',
})

export default async function BlogPage() {
  const posts = await getPosts()
  const cards: PostCardData[] = posts.map((p) => ({
    slug: p.slug, title: p.title, excerpt: p.excerpt, publishedAt: p.publishedAt, topics: p.topics,
    minutes: readingMinutes(p.content), authorName: p.author.name, heroImage: p.heroImage,
  }))
  const abs = (path: string) => new URL(path, env.SITE_URL).toString()
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'Blog', name: 'Ngina Trails & Safaris blog', url: abs('/blog'),
          publisher: { '@id': abs('/#organization') },
          blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: abs(`/blog/${p.slug}`), datePublished: p.publishedAt, author: { '@type': 'Person', name: p.author.name } })),
        }}
      />
      <PageHero eyebrow="Blog" title="Guides from the coast and the bush." emphasis="coast" intro="Plain, practical advice from the people who plan our trips: where to go, when, what to pack and what to expect." tone="cream" compact crumbs={[{ name: 'Blog', path: '/blog' }]} />
      <section data-tone="cream" className="pb-24">
        <BlogIndex posts={cards} />
      </section>
      <CtaBand ctaId="blog-index-cta" />
    </>
  )
}
