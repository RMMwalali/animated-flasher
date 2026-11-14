'use client'
import Link from 'next/link'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useEffect } from 'react'
import { Icon } from '@/components/icons/Icon'
import { Brush } from './Brush'
import { BrushCircle } from './BrushCircle'
import { SoundToggle } from './SoundToggle'
import { ExploreButton } from './Explore'
import { HeaderLogo, LocationLine } from './Logo'
import { MENU } from './nav'
import type { ContactInfo } from './types'
import { formatHours } from './hours'
import { socialOf } from './social'

/** Full-screen overlay menu: numbered large links + contact panel. */
export function Menu({ open, onClose, contact }: { open: boolean; onClose: () => void; contact: ContactInfo }) {
  useEffect(() => {
    if (open) window.__lenis?.stop()
    else window.__lenis?.start()
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[60]">
      <DialogPanel
        transition
        className="fixed inset-0 overflow-y-auto bg-deep text-cream transition-[clip-path,opacity] duration-700 ease-[var(--ease-in-out-quart)] [clip-path:inset(0_0_0_0)] data-closed:opacity-0 data-closed:[clip-path:inset(0_0_100%_0)]"
      >
        <DialogTitle className="sr-only">Menu</DialogTitle>
        <div className="gutter grid h-[76px] grid-cols-[1fr_auto_1fr] items-center sm:h-[88px]">
          <div className="flex items-center">
            <SoundToggle className="lg:hidden" />
            <button type="button" onClick={onClose} className="relative hidden size-12 place-items-center rounded-full lg:grid" aria-label="Close menu">
              <BrushCircle className="absolute inset-0 size-full text-orange-300" />
              <Icon name="close" size={20} />
            </button>
          </div>
          <Link href="/" onClick={onClose} className="flex min-h-11 items-center px-2" aria-label="Home">
            <HeaderLogo />
          </Link>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="relative grid size-12 place-items-center rounded-full lg:hidden" aria-label="Close menu" autoFocus>
              <BrushCircle className="absolute inset-0 size-full text-orange-300" />
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        <div className="gutter grid gap-12 pb-16 pt-6 lg:grid-cols-[1.6fr_1fr] lg:pt-10">
          <nav aria-label="Main">
            <ol className="grid justify-items-center gap-1 text-center sm:gap-2 lg:justify-items-start lg:text-left">
              {MENU.map((m, i) => (
                <li key={m.href} className="menu-item" style={{ ['--i' as string]: i }}>
                  <Link href={m.href} onClick={onClose} className="menu-link group flex items-baseline gap-4 py-1.5 sm:gap-6">
                    <span className="hidden font-semibold tabular-nums text-xs text-ochre sm:text-sm lg:inline">{String(i + 1).padStart(2, '0')}</span>
                    <span className="relative font-display text-[2rem] font-medium leading-none sm:text-5xl lg:text-6xl">
                      {m.label}
                      <Brush seed={m.label} draw={false} className="menu-brush absolute -bottom-2 left-0 h-3 w-full text-orange-300" />
                    </span>
                    <span className="hidden text-sm text-cream/75 md:inline">{m.note}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <aside className="grid content-start gap-8 border-t border-cream/20 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-2" aria-label="Contact">
            <div>
              <p className="eyebrow text-teal-300">Talk to us</p>
              <ul className="mt-4 grid gap-3 text-lg">
                {contact.email && (
                  <li><a className="link-u inline-flex items-center gap-3" href={`mailto:${contact.email}`}><Icon name="mail" size={20} />{contact.email}</a></li>
                )}
                {contact.phone && (
                  <li><a className="link-u inline-flex items-center gap-3" href={`tel:${contact.phone.replace(/\s+/g, '')}`}><Icon name="phone" size={20} />{contact.phone}</a></li>
                )}
                {contact.whatsapp && (
                  <li><a className="link-u inline-flex items-center gap-3" href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} rel="noopener"><Icon name="whatsapp" size={20} />WhatsApp</a></li>
                )}
                <li><Link className="link-u inline-flex items-center gap-3" href="/contact" onClick={onClose}><Icon name="chat" size={20} />Send us a message</Link></li>
              </ul>
            </div>
            {contact.social.length > 0 && (
              <ul className="flex flex-wrap gap-3" aria-label="Follow us">
                {contact.social.map((x) => (
                  <li key={x.url}>
                    <a href={x.url} target="_blank" rel="noopener me" className="grid size-11 place-items-center rounded-full border border-cream/30 hover:border-ochre" aria-label={`${socialOf(x.platform).label} (opens in a new tab)`} title={socialOf(x.platform).label}>
                      <Icon name={socialOf(x.platform).icon} size={20} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {contact.hours.length > 0 ? (
              <div>
                <p className="eyebrow text-teal-300">Office hours (EAT)</p>
                <ul className="mt-3 grid gap-1 text-cream/85">
                  {formatHours(contact.hours).map((h) => <li key={h}>{h}</li>)}
                </ul>
              </div>
            ) : (
              <p className="text-cream/85">Enquire any time: we reply within 24 hours.</p>
            )}
            <div className="flex items-center gap-6">
              <ExploreButton />
              <Link href="/plan-your-trip" onClick={onClose} className="btn btn-primary" data-cta="menu-plan">
                Plan your trip <Icon name="arrow-right" size={18} />
              </Link>
            </div>
            <LocationLine className="h-3 text-ochre" />
          </aside>
        </div>
      </DialogPanel>
    </Dialog>
  )
}
