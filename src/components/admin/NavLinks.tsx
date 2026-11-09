'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@payloadcms/ui'
import { Icon, type IconName } from '@/components/icons/Icon'

type L = { href: string; label: string; icon: IconName; roles?: string[] }
const LINKS: L[] = [
  { href: '/admin', label: 'Overview', icon: 'overview' },
  { href: '/admin/inbox', label: 'Inbox', icon: 'inbox', roles: ['admin', 'sales'] },
  { href: '/admin/pipeline', label: 'Leads pipeline', icon: 'pipeline', roles: ['admin', 'sales'] },
  { href: '/admin/calendar', label: 'Departures', icon: 'calendar', roles: ['admin', 'sales'] },
  { href: '/admin/setup', label: 'Go-live setup', icon: 'settings', roles: ['admin'] },
]

/** The custom workspace links at the top of the admin navigation. */
export function NavLinks() {
  const path = usePathname()
  const { user } = useAuth<{ roles?: string[] }>()
  const roles = user?.roles ?? []
  return (
    <nav className="ng-nav" aria-label="Workspace">
      <p className="ng-label ng-nav__label">Workspace</p>
      <ul>
        {LINKS.filter((l) => !l.roles || l.roles.some((r) => roles.includes(r))).map((l) => {
          const active = l.href === '/admin' ? path === '/admin' : path.startsWith(l.href)
          return (
            <li key={l.href}>
              <Link href={l.href} className="ng-nav__link" aria-current={active ? 'page' : undefined}>
                <Icon name={l.icon} size={18} />
                <span>{l.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
