import { describe, expect, it } from 'vitest'
import { lexical, lexicalToText } from '@/content/lexical'
import { samplePosts } from '@/content/sample'
import { headingAnchors, readingMinutes, relatedPosts, slugify } from '@/lib/blog'
import type { PostVM } from '@/lib/content'

describe('blog helpers', () => {
  it('slugifies headings', () => {
    expect(slugify('Tsavo East & Amboseli: which?')).toBe('tsavo-east-and-amboseli-which')
    expect(slugify('Café   crème')).toBe('cafe-creme')
    expect(slugify('!!!')).toBe('section')
  })

  it('gives every h2/h3 a unique anchor', () => {
    const doc = lexical(['intro', { h2: 'When to go' }, 'x', { h3: 'Details' }, { h2: 'When to go' }])
    const { toc, ids } = headingAnchors(doc)
    expect(toc.map((t) => t.id)).toEqual(['when-to-go', 'details', 'when-to-go-2'])
    expect(toc.map((t) => t.level)).toEqual([2, 3, 2])
    const headings = (doc.root.children as object[]).filter((n: any) => n.type === 'heading')
    expect(headings.map((h) => ids.get(h))).toEqual(['when-to-go', 'details', 'when-to-go-2'])
  })

  it('estimates reading time with a one-minute minimum', () => {
    expect(readingMinutes(lexical(['short']))).toBe(1)
    expect(readingMinutes(lexical([Array(1100).fill('word').join(' ')]))).toBe(5)
  })

  it('ranks related posts by shared topics, never the post itself', () => {
    const p = (slug: string, topics: string[], publishedAt: string) => ({ slug, topics, publishedAt }) as PostVM
    const all = [p('a', ['safari', 'planning'], '2026-01-01'), p('b', ['coast'], '2026-05-01'), p('c', ['safari'], '2026-02-01'), p('d', ['safari', 'planning'], '2026-03-01')]
    expect(relatedPosts(all[0]!, all, 2).map((x) => x.slug)).toEqual(['d', 'c'])
  })

  it('builds links in sample rich text', () => {
    const doc = lexical(['See our [eTA guide](/kenya-eta) first.'])
    const para = (doc.root.children as any[])[0]
    expect(para.children[1]).toMatchObject({ type: 'link', fields: { url: '/kenya-eta', linkType: 'custom' } })
    expect(lexicalToText(doc)).toBe('See our eTA guide first.')
  })

  it('sample posts are unique, have photos and at least two sections', () => {
    expect(new Set(samplePosts.map((p) => p.slug)).size).toBe(samplePosts.length)
    expect(samplePosts.length).toBeGreaterThanOrEqual(7)
    for (const p of samplePosts) {
      expect(p.photo).toBeTruthy()
      expect(headingAnchors(p.content).toc.length).toBeGreaterThanOrEqual(2)
    }
  })
})
