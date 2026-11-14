import Link from 'next/link'
import { brandPaths } from '@/components/brand/paths'
import { Icon } from '@/components/icons/Icon'
import type { SettingsVM } from '@/lib/content'
import { formatHours } from './hours'
import { LocationLine, MaskedSvg } from './Logo'
import { LEGAL, MENU } from './nav'
import { CookieSettingsLink } from './Consent'

export function Footer({ settings }: { settings: SettingsVM }) {
  const year = new Date().getFullYear()
  const a = settings.address
  return (
    <footer id="site-footer" className="relative bg-night text-cream" data-tone="night">
      <svg viewBox={brandPaths.horizon.box.join(' ')} preserveAspectRatio="none" className="absolute -top-px left-0 h-5 w-full -translate-y-full text-night" aria-hidden="true">
        <path d={brandPaths.horizon.d} fill="currentColor" />
      </svg>
      <div className="gutter grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:py-24">
        <div className="grid content-start gap-6">
          <MaskedSvg src="/brand/logo-stacked-cream.svg" ratio={1934 / 1633} className="w-44 text-cream" label="Ngina Trails and Safaris, Diani Beach, Kenya" />
          <p className="max-w-xs text-cream/80">{settings.tagline}</p>
        </div>
        <nav aria-label="Journeys">
          <p className="eyebrow text-ochre">Explore</p>
          <ul className="mt-4 grid gap-2">
            {MENU.slice(0, 6).map((m) => <li key={m.href}><Link className="link-u" href={m.href}>{m.label}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="About">
          <p className="eyebrow text-ochre">Plan</p>
          <ul className="mt-4 grid gap-2">
            {MENU.slice(6).map((m) => <li key={m.href}><Link className="link-u" href={m.href}>{m.label}</Link></li>)}
            <li><Link className="link-u" href="/plan-your-trip">Plan your trip</Link></li>
            <li><Link className="link-u" href="/contact">Contact</Link></li>
          </ul>
        </nav>
        <div>
          <p className="eyebrow text-ochre">Find us</p>
          <address className="mt-4 grid gap-2 not-italic text-cream/90">
            <span>{[a.street, a.locality, a.region].filter(Boolean).join(', ')}, Kenya</span>
            {settings.email && <a className="link-u inline-flex w-fit items-center gap-2" href={`mailto:${settings.email}`}><Icon name="mail" size={18} />{settings.email}</a>}
            {settings.phone && <a className="link-u inline-flex w-fit items-center gap-2" href={`tel:${settings.phone.replace(/\s+/g, '')}`}><Icon name="phone" size={18} />{settings.phone}</a>}
            <span className="text-sm text-cream/75">{settings.hours.length > 0 ? `${formatHours(settings.hours).join(' · ')} (EAT)` : `Enquire any time · we reply within ${settings.responseTime || '24 hours'}`}</span>
          </address>
          {settings.social.length > 0 && (
            <ul className="mt-5 flex gap-3">
              {settings.social.map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="noopener me" className="grid size-11 place-items-center rounded-full border border-cream/30 hover:border-ochre" aria-label={s.platform}>
                    <Icon name={(['instagram', 'facebook'].includes(s.platform) ? s.platform : 'globe') as 'instagram'} size={20} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="gutter flex flex-col gap-4 border-t border-cream/15 py-6 text-sm text-cream/75 md:flex-row md:items-center md:justify-between">
        <LocationLine className="h-3 w-56 text-ochre" />
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {LEGAL.map((l) => <li key={l.href}><Link className="link-u" href={l.href}>{l.label}</Link></li>)}
          <li><CookieSettingsLink /></li>
        </ul>
        <p>© {year} {settings.businessName}</p>
      </div>
    </footer>
  )
}
