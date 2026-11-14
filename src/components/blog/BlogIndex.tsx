'use client'
import { Radio, RadioGroup } from '@headlessui/react'
import { useEffect, useMemo, useState } from 'react'
import { TOPIC_LABELS } from '@/lib/blog'
import { PostCard, type PostCardData } from './PostCard'

/**
 * Blog listing: the newest article large, then a grid with topic filters.
 * The chosen topic is kept in the address (#topic=coast) so it can be shared.
 */
export function BlogIndex({ posts }: { posts: PostCardData[] }) {
  const [topic, setTopic] = useState('all')
  const topics = useMemo(() => Object.keys(TOPIC_LABELS).filter((t) => posts.some((p) => p.topics.includes(t))), [posts])

  useEffect(() => {
    const read = () => {
      const t = /topic=([a-z]+)/.exec(window.location.hash)?.[1]
      setTopic(t && TOPIC_LABELS[t] ? t : 'all')
    }
    const raf = requestAnimationFrame(read)
    window.addEventListener('hashchange', read)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('hashchange', read)
    }
  }, [])

  const pick = (t: string) => {
    setTopic(t)
    history.replaceState(null, '', t === 'all' ? window.location.pathname : `#topic=${t}`)
  }

  const [lead, ...rest] = posts
  const filtered = topic === 'all' ? rest : posts.filter((p) => p.topics.includes(topic))

  return (
    <>
      {topic === 'all' && lead && (
        <div className="gutter">
          <PostCard post={lead} featured />
        </div>
      )}
      <div className={`gutter ${topic === 'all' ? 'mt-20 border-t border-line pt-12' : ''}`}>
        {topics.length > 1 && (
          <RadioGroup value={topic} onChange={pick} aria-label="Filter articles by topic" className="flex flex-wrap gap-2">
            {['all', ...topics].map((t) => (
              <Radio
                key={t}
                value={t}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-deep/25 px-4 text-sm font-semibold transition-colors hover:border-deep data-checked:border-deep data-checked:bg-deep data-checked:text-cream data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-orange"
              >
                {t === 'all' ? 'All articles' : TOPIC_LABELS[t]}
              </Radio>
            ))}
          </RadioGroup>
        )}
        <p className="sr-only" aria-live="polite">{topic === 'all' ? `${posts.length} articles` : `${filtered.length} articles about ${TOPIC_LABELS[topic]}`}</p>
        <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.slug}><PostCard post={p} /></li>
          ))}
        </ul>
        {filtered.length === 0 && <p className="mt-10 text-lg">No articles on this topic yet.</p>}
      </div>
    </>
  )
}
