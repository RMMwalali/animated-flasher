'use client'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/icons/Icon'
import type { TocItem } from '@/lib/blog'

/** The section being read: the last heading above 30% of the screen height. */
function useActive(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    let raf = 0
    const update = () => {
      const line = window.innerHeight * 0.3
      let current: string | null = null
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id
      setActive(current)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [ids])
  return active
}

function List({ items, active, onPick }: { items: TocItem[]; active: string | null; onPick?: () => void }) {
  return (
    <ol className="grid gap-1 text-[0.95rem]">
      {items.map((t) => (
        <li key={t.id} className={t.level === 3 ? 'pl-4' : ''}>
          <a
            href={`#${t.id}`}
            onClick={onPick}
            aria-current={active === t.id ? 'location' : undefined}
            className="block border-l-2 border-transparent py-1.5 pl-3 leading-snug opacity-80 transition hover:opacity-100 aria-[current]:border-orange aria-[current]:font-semibold aria-[current]:opacity-100"
          >
            {t.text}
          </a>
        </li>
      ))}
    </ol>
  )
}

/** "In this article": sticky list on wide screens, a fold-out on phones. */
export function Toc({ items, variant }: { items: TocItem[]; variant: 'aside' | 'inline' }) {
  const [ids] = useState(() => items.map((i) => i.id))
  const active = useActive(ids)
  if (items.length < 2) return null
  if (variant === 'aside')
    return (
      <nav aria-label="In this article" className="sticky top-28">
        <p className="eyebrow text-teal-ink">In this article</p>
        <div className="mt-4"><List items={items} active={active} /></div>
      </nav>
    )
  return (
    <Disclosure as="nav" aria-label="In this article" className="rounded-2xl border border-line bg-paper">
      {({ close }) => (
        <>
          <DisclosureButton className="group flex min-h-12 w-full items-center justify-between px-5 py-3 text-left font-semibold">
            In this article
            <Icon name="chevron-down" size={18} className="transition-transform group-data-open:rotate-180" />
          </DisclosureButton>
          <DisclosurePanel className="px-3 pb-4">
            <List items={items} active={active} onPick={() => close()} />
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  )
}
