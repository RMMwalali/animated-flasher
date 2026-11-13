'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { Icon } from '@/components/icons/Icon'
import { BrushCircle } from './BrushCircle'
import { HeaderLogo } from './Logo'
import { Menu } from './Menu'
import { SoundToggle } from './SoundToggle'
import type { ContactInfo } from './types'

const LEFT = [
  { href: '/safaris', label: 'Safaris' },
  { href: '/coastal-tours', label: 'Coastal tours' },
  { href: '/destinations', label: 'Destinations' },
]
const RIGHT = [
  { href: '/our-story', label: 'Our story' },
  { href: '/journal', label: 'Journal' },
]

/**
 * Desktop: menu + key links left, centred logo, links + "Plan your trip"
 * right. Phone: sound and menu in hand-drawn rings either side of the logo.
 * Transparent over dark heroes, cream once scrolled; hides on scroll down.
 */
export function Header({ contact, overHero = true, banner }: { contact: ContactInfo; overHero?: boolean; banner?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [creamTop, setCreamTop] = useState(false)
  const path = usePathname()
  const darkStart = overHero && !creamTop

  // Pages that open on a light (cream) section need dark header text from the start.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const first = document.querySelector<HTMLElement>('#main [data-tone]')
      setCreamTop(first?.dataset.tone === 'cream')
    })
    return () => cancelAnimationFrame(raf)
  }, [path])

  useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        setSolid(y > window.innerHeight * 0.6)
        setHidden(y > 320 && y > last + 4)
        if (y < last - 4) setHidden(false)
        last = y
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [path])

  const light = solid || !darkStart
  const link = 'eyebrow link-u whitespace-nowrap py-2'
  return (
    <>
      <header
        id="site-header"
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color] duration-500 ease-[var(--ease-out-expo)] ${hidden && !open ? '-translate-y-full' : ''} ${
          light ? 'bg-cream/92 text-deep shadow-[0_1px_0_var(--color-line)] backdrop-blur-md' : 'bg-transparent text-cream'
        }`}
      >
        {banner}
        <div className="gutter grid h-[76px] grid-cols-[1fr_auto_1fr] items-center sm:h-[88px]">
          <div className="flex items-center gap-6">
            <SoundToggle className="lg:hidden" />
            <button type="button" onClick={() => setOpen(true)} className="relative hidden size-12 place-items-center rounded-full lg:grid" aria-haspopup="dialog" aria-expanded={open} aria-label="Open menu">
              <BrushCircle className="absolute inset-0 size-full text-orange" />
              <Icon name="menu" size={20} />
            </button>
            <nav aria-label="Journeys" className="hidden items-center gap-6 lg:flex">
              {LEFT.map((l) => (
                <Link key={l.href} href={l.href} className={link} aria-current={path.startsWith(l.href) ? 'page' : undefined}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" className="flex min-h-11 items-center justify-center px-2" aria-label="Ngina Trails & Safaris, home">
            <HeaderLogo />
          </Link>

          <div className="flex items-center justify-end gap-6">
            <nav aria-label="About" className="hidden items-center gap-6 lg:flex">
              {RIGHT.map((l) => (
                <Link key={l.href} href={l.href} className={link} aria-current={path.startsWith(l.href) ? 'page' : undefined}>
                  {l.label}
                </Link>
              ))}
            </nav>
            <Link href="/plan-your-trip" data-cta="header-plan" className="btn btn-primary hidden !min-h-11 !px-5 !py-2.5 text-sm lg:inline-flex">
              Plan your trip
            </Link>
            <button type="button" onClick={() => setOpen(true)} className="relative grid size-12 place-items-center rounded-full lg:hidden" aria-haspopup="dialog" aria-expanded={open} aria-label="Open menu">
              <BrushCircle className="absolute inset-0 size-full text-orange" />
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>
      </header>
      <Menu open={open} onClose={() => setOpen(false)} contact={contact} />
    </>
  )
}
