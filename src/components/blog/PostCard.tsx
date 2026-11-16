import { PhotoCard } from '@/components/page/PhotoCard'
import { TOPIC_LABELS, formatDate } from '@/lib/blog'
import type { MediaVM } from '@/lib/content'

export type PostCardData = { slug: string; title: string; excerpt: string; publishedAt: string; topics: string[]; minutes: number; authorName: string; heroImage?: MediaVM | null }

const fallbackFor = (topics: string[]) => (topics.includes('coast') || topics.includes('marine') ? 'coast' : 'safari')

/** Article teaser: photo and title; the excerpt appears on hover. `featured` is the wide lead story. */
export function PostCard({ post: p, featured = false, headingLevel = 'h2' }: { post: PostCardData; featured?: boolean; headingLevel?: 'h2' | 'h3' }) {
  const topic = p.topics[0] ? (TOPIC_LABELS[p.topics[0]] ?? p.topics[0]) : null
  return (
    <div data-post={p.slug} className="h-full">
      <PhotoCard
        href={`/blog/${p.slug}`}
        image={p.heroImage}
        fallback={fallbackFor(p.topics)}
        title={p.title}
        headingLevel={headingLevel}
        meta={<>{featured ? 'Latest · ' : ''}{topic ? `${topic} · ` : ''}<time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time> · {p.minutes} min read</>}
        summary={p.excerpt}
        cta="Read"
        aspect={featured ? 'aspect-[4/5] sm:aspect-[21/9]' : 'aspect-[4/5] sm:aspect-[4/3]'}
        large={featured}
        sizes={featured ? '100vw' : undefined}
        priority={featured}
      />
    </div>
  )
}
