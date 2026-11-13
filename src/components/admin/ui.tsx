/** Admin UI kit: text and line icons only (no imagery). Styles in app/(payload)/custom.scss. */
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/components/icons/Icon'

export function Page({ eyebrow, title, intro, actions, children }: { eyebrow?: string; title: string; intro?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="ng-page">
      <header className="ng-page__head">
        <div>
          {eyebrow && <p className="ng-eyebrow">{eyebrow}</p>}
          <h1 className="ng-title">{title}</h1>
          {intro && <p className="ng-intro">{intro}</p>}
        </div>
        {actions && <div className="ng-page__actions">{actions}</div>}
      </header>
      {children}
    </div>
  )
}

export function Section({ n, title, aside, children, id }: { n: number; title: string; aside?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section className="ng-section" id={id} aria-labelledby={`ng-s-${n}`}>
      <div className="ng-section__head">
        <span className="ng-num" aria-hidden="true">{String(n).padStart(2, '0')}</span>
        <h2 className="ng-h2" id={`ng-s-${n}`}>{title}</h2>
        {aside && <div className="ng-section__aside">{aside}</div>}
      </div>
      <div className="ng-section__body">{children}</div>
    </section>
  )
}

export function ArrowList({ items, empty }: { items: { href?: string; label: ReactNode; meta?: ReactNode; status?: Status }[]; empty?: string }) {
  if (!items.length) return <p className="ng-empty">{empty ?? 'Nothing here.'}</p>
  return (
    <ul className="ng-arrows">
      {items.map((it, i) => {
        const inner = (
          <>
            <Icon name="arrow-right" size={18} className="ng-arrows__icon" />
            <span className="ng-arrows__label">{it.label}</span>
            {it.status && <Pill status={it.status} />}
            {it.meta && <span className="ng-arrows__meta">{it.meta}</span>}
          </>
        )
        return <li key={i}>{it.href ? <Link href={it.href}>{inner}</Link> : <div>{inner}</div>}</li>
      })}
    </ul>
  )
}

export type Status = { label: string; tone?: 'teal' | 'ochre' | 'neutral' | 'alert' }
export function Pill({ status }: { status: Status }) {
  return <span className={`ng-pill ng-pill--${status.tone ?? 'neutral'}`}>{status.label}</span>
}

export function Stat({ label, value, note, icon }: { label: string; value: ReactNode; note?: ReactNode; icon?: IconName }) {
  return (
    <div className="ng-stat">
      <p className="ng-label">{icon && <Icon name={icon} size={16} />} {label}</p>
      <p className="ng-stat__value">{value}</p>
      {note && <p className="ng-stat__note">{note}</p>}
    </div>
  )
}

export function Notice({ tone = 'ochre', title, children }: { tone?: 'ochre' | 'teal'; title: string; children?: ReactNode }) {
  return (
    <div className={`ng-notice ng-notice--${tone}`} role="status">
      <Icon name={tone === 'ochre' ? 'alert' : 'info'} size={20} />
      <div>
        <p className="ng-notice__title">{title}</p>
        {children && <div className="ng-notice__body">{children}</div>}
      </div>
    </div>
  )
}

export function ButtonLink({ href, children, icon = 'arrow-right', variant = 'primary' }: { href: string; children: ReactNode; icon?: IconName; variant?: 'primary' | 'ghost' }) {
  return (
    <Link href={href} className={`ng-btn ng-btn--${variant}`}>
      <span>{children}</span>
      <Icon name={icon} size={18} />
    </Link>
  )
}
