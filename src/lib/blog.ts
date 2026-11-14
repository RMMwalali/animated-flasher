/** Helpers for blog articles: heading anchors, reading time, related posts. */
import { lexicalToText } from '@/content/lexical'
import type { PostVM } from '@/lib/content'

export type TocItem = { id: string; text: string; level: 2 | 3 }

export const TOPIC_LABELS: Record<string, string> = {
  safari: 'Safari',
  coast: 'Coast',
  wildlife: 'Wildlife',
  planning: 'Planning',
  culture: 'Culture',
  marine: 'Marine',
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'section'
  )
}

const textOf = (n: any): string => (n?.type === 'text' ? String(n.text ?? '') : Array.isArray(n?.children) ? n.children.map(textOf).join('') : '')

/**
 * Walks the document's top-level h2/h3 headings and gives each a unique id.
 * `ids` is keyed by the node object so the renderer can attach the same id.
 */
export function headingAnchors(doc: unknown): { toc: TocItem[]; ids: WeakMap<object, string> } {
  const ids = new WeakMap<object, string>()
  const toc: TocItem[] = []
  const used = new Map<string, number>()
  const children: any[] = (doc as any)?.root?.children ?? []
  for (const n of children) {
    if (n?.type !== 'heading' || (n.tag !== 'h2' && n.tag !== 'h3')) continue
    const text = textOf(n).trim()
    if (!text) continue
    const base = slugify(text)
    const count = used.get(base) ?? 0
    used.set(base, count + 1)
    const id = count ? `${base}-${count + 1}` : base
    ids.set(n, id)
    toc.push({ id, text, level: n.tag === 'h2' ? 2 : 3 })
  }
  return { toc, ids }
}

export function readingMinutes(doc: unknown): number {
  const words = lexicalToText(doc).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

/** Posts sharing the most topics first, then the newest. Never the post itself. */
export function relatedPosts(post: Pick<PostVM, 'slug' | 'topics'>, all: PostVM[], limit = 3): PostVM[] {
  const mine = new Set(post.topics)
  return all
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, score: p.topics.filter((t) => mine.has(t)).length }))
    .sort((a, b) => b.score - a.score || b.p.publishedAt.localeCompare(a.p.publishedAt))
    .slice(0, limit)
    .map((x) => x.p)
}

export const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi' })
