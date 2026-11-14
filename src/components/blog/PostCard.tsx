import Link from 'next/link'
import { Media } from '@/components/site/Media'
import { TOPIC_LABELS, formatDate } from '@/lib/blog'
import type { MediaVM } from '@/lib/content'

export type PostCardData = { slug: string; title: string; excerpt: string; publishedAt: string; topics: string[]; minutes: number; authorName: string; heroImage?: MediaVM | null }

const fallbackFor = (topics: string[]) => (topics.includes('coast') || topics.includes('marine') ? 'coast' : 'safari')

/** Article teaser. `featured` is the large lead story on the blog page. */
export function PostCard({ post: p, featured = false, headingLevel = 'h2' }: { post: PostCardData; featured?: boolean; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  return (
    <article data-post={p.slug} className="h-full">
      <Link href={`/blog/${p.slug}`} className={`group grid h-full gap-6 ${featured ? 'md:grid-cols-[1.35fr_1fr] md:items-center md:gap-12' : 'content-start'}`}>
        <div className={`relative overflow-hidden rounded-2xl ${featured ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
          <div className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105">
            <Media media={p.heroImage} fallback={fallbackFor(p.topics)} sizes={featured ? '(min-width:768px) 58vw, 100vw' : '(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw'} priority={featured} />
          </div>
          {p.topics[0] && <span className="absolute left-4 top-4 rounded-full bg-cream/92 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-deep">{TOPIC_LABELS[p.topics[0]] ?? p.topics[0]}</span>}
        </div>
        <div>
          {featured && <p className="eyebrow text-orange-600">Latest</p>}
          <H className={`font-display font-medium leading-tight ${featured ? 'mt-3 text-4xl sm:text-5xl' : 'text-2xl sm:text-[1.7rem]'}`}>
            <span className="link-u">{p.title}</span>
          </H>
          <p className={`mt-3 opacity-90 ${featured ? 'text-lg' : ''}`}>{p.excerpt}</p>
          <p className="mt-4 flex flex-wrap gap-x-2 text-sm text-deep/80">
            <time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{p.minutes} min read</span>
            {featured && <><span aria-hidden="true">·</span><span>{p.authorName}</span></>}
          </p>
        </div>
      </Link>
    </article>
  )
}
