'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { Icon } from '@/components/icons/Icon'
import { ExploreButton } from './Explore'
import { HeaderLogo } from './Logo'
import { Menu } from './Menu'
import type { ContactInfo } from './types'

/**
 * Centred logo with Menu (left) and Explore + Plan (right). Transparent with
 * cream text over dark heroes, cream background after scrolling; hides while
 * scrolling down and returns on scroll up.
 */
export function Header({ contact, overHero = true, banner }: { contact: ContactInfo; overHero?: boolean; banner?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const path = usePathname()
  const darkStart = overHero && !['/privacy', '/terms', '/cookies', '/plan-your-trip', '/contact'].includes(path)

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
  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color] duration-500 ease-[var(--ease-out-expo)] ${hidden && !open ? '-translate-y-full' : ''} ${
          light ? 'bg-cream/92 text-deep shadow-[0_1px_0_var(--color-line)] backdrop-blur-md' : 'bg-transparent text-cream'
        }`}
      >
        {banner}
        <div className="gutter grid h-[68px] grid-cols-[1fr_auto_1fr] items-center sm:h-20">
          <div className="flex items-center">
            <button type="button" onClick={() => setOpen(true)} className="group -ml-2 flex min-h-11 items-center gap-3 rounded-full px-2" aria-haspopup="dialog" aria-expanded={open} aria-label="Open menu">
              <Icon name="menu" size={26} />
              <span className="eyebrow hidden sm:inline" aria-hidden="true">Menu</span>
            </button>
          </div>
          <Link href="/" className="flex min-h-11 items-center justify-center px-2" aria-label="Ngina Trails & Safaris, home">
            <HeaderLogo />
          </Link>
          <div className="flex items-center justify-end gap-3">
            <ExploreButton className="hidden lg:grid" />
            <Link href="/plan-your-trip" data-cta="header-plan" className="btn btn-primary hidden !min-h-11 !px-5 !py-2.5 text-sm sm:inline-flex">
              Plan your trip
            </Link>
            <Link href="/plan-your-trip" data-cta="header-plan-mobile" className="grid size-11 place-items-center rounded-full sm:hidden" aria-label="Plan your trip">
              <Icon name="calendar" size={24} />
            </Link>
          </div>
        </div>
      </header>
      <Menu open={open} onClose={() => setOpen(false)} contact={contact} />
    </>
  )
}
