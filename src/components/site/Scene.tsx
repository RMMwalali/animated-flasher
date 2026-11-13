import { brandPaths } from '@/components/brand/paths'

/**
 * Illustrated placeholder landscapes built from the logo's bands and traced
 * parts (acacia, lion, horizon). Shown wherever the owner has not uploaded a
 * photo yet, so the site looks intentional from day one.
 */
type Kind = 'coast' | 'safari' | 'night' | 'dawn'

const box = (b: readonly number[]) => b.join(' ')

export function Scene({ kind = 'safari', className = '', parallax = true }: { kind?: Kind; className?: string; parallax?: boolean }) {
  const id = `sc-${kind}`
  const sky = {
    coast: ['#cde9ee', '#efece5'],
    safari: ['#0b99af', '#5fb8c8'],
    night: ['#0a1d19', '#0e2b27'],
    dawn: ['#e8935a', '#efece5'],
  }[kind]
  return (
    <svg className={`absolute inset-0 h-full w-full ${className}`} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${id}-sky)`} />
      {kind === 'night' && (
        <g fill="#efece5" opacity="0.7">
          {Array.from({ length: 60 }, (_, i) => (
            <circle key={i} cx={(i * 263) % 1600} cy={(i * 137) % 480} r={(i % 3) * 0.6 + 0.6} />
          ))}
          <circle cx="1230" cy="170" r="46" fill="#efece5" opacity="0.9" />
        </g>
      )}
      {kind !== 'night' && <circle cx={kind === 'coast' ? 1180 : 420} cy={kind === 'dawn' ? 470 : 260} r={kind === 'dawn' ? 120 : 70} fill="#d1974e" opacity={kind === 'safari' ? 0.85 : 0.9} />}

      {kind === 'coast' || kind === 'dawn' ? (
        <g data-parallax={parallax ? '0.08' : undefined}>
          <path d="M0 520 C 300 500, 700 530, 1000 515 S 1450 505, 1600 520 V900 H0Z" fill="#0b99af" />
          <path d="M0 600 C 350 585, 800 615, 1150 598 S 1500 590, 1600 605 V900 H0Z" fill="#086b7c" opacity="0.85" />
          <g stroke="#cde9ee" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7">
            <path d="M120 560 q 30 -10 60 0 t 60 0" />
            <path d="M620 575 q 30 -10 60 0 t 60 0" />
            <path d="M1180 565 q 30 -10 60 0 t 60 0" />
            <path d="M380 660 q 30 -10 60 0 t 60 0" />
            <path d="M980 680 q 30 -10 60 0 t 60 0" />
          </g>
          <path d="M0 760 C 400 720, 1000 735, 1600 760 V900 H0Z" fill="#efece5" />
          {/* dhow */}
          <g transform="translate(980 410)" fill="#0e2b27">
            <path d="M0 110 H190 L165 135 H30Z" />
            <path d="M92 108 V0 L22 98Z M98 6 L176 102 H98Z" opacity="0.92" />
          </g>
        </g>
      ) : (
        <g>
          <path data-parallax={parallax ? '0.05' : undefined} d="M0 560 C 260 470, 520 520, 760 480 S 1240 430, 1600 500 V900 H0Z" fill={kind === 'night' ? '#123631' : '#06764e'} />
          <path d="M0 640 C 320 600, 760 650, 1100 615 S 1450 610, 1600 630 V900 H0Z" fill={kind === 'night' ? '#0e2b27' : '#0f673f'} />
          <svg x="180" y="380" width="560" height="230" viewBox={box(brandPaths.acacia.box)} data-parallax={parallax ? '0.12' : undefined}>
            <path d={brandPaths.acacia.d} fill="#0e2b27" fillRule="evenodd" />
          </svg>
          <path d="M0 760 C 500 735, 1100 735, 1600 760 V900 H0Z" fill={kind === 'night' ? '#0a1d19' : '#d1974e'} />
          <svg x="900" y="560" width="480" height="240" viewBox={box(brandPaths.lion.box)}>
            <path d={brandPaths.lion.d} fill="#0e2b27" fillRule="evenodd" />
          </svg>
        </g>
      )}
      <svg x="-40" y="800" width="1680" height="70" viewBox={box(brandPaths.horizon.box)} preserveAspectRatio="none">
        <path d={brandPaths.horizon.d} fill="#0e2b27" />
      </svg>
    </svg>
  )
}
