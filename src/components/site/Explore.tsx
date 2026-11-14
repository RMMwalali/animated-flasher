import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'

/** Circular compass button with a slowly rotating text ring. */
export function ExploreButton({ href = '/destinations', label = 'Explore', className = '' }: { href?: string; label?: string; className?: string }) {
  const ring = `${label} · Diani · Kenya · `
  return (
    <Link href={href} className={`group relative grid size-[72px] place-items-center rounded-full ${className}`} aria-label={`${label}: destinations map`}>
      <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <path id="explore-ring" d="M50 50 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" />
        </defs>
        <text className="fill-current font-semibold tabular-nums text-[10px] uppercase">
          <textPath href="#explore-ring" textLength="238" lengthAdjust="spacingAndGlyphs">{ring}</textPath>
        </text>
      </svg>
      <span className="grid size-10 place-items-center rounded-full border border-current transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-[135deg]">
        <Icon name="compass" size={22} />
      </span>
    </Link>
  )
}
