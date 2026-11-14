/**
 * Brand marks rendered as CSS masks of the traced SVGs, so one file can take
 * any colour (currentColor) without redrawing the logo.
 */
export function MaskedSvg({ src, ratio, className = '', label }: { src: string; ratio: number; className?: string; label?: string }) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`block bg-current ${className}`}
      style={{ aspectRatio: String(ratio), mask: `url(${src}) center / contain no-repeat`, WebkitMask: `url(${src}) center / contain no-repeat` }}
    />
  )
}

/** Compact stacked lockup for the header: mark over the NGINA wordmark. */
export function HeaderLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex flex-col items-center gap-1 ${className}`}>
      <MaskedSvg src="/brand/mark-mono.svg" ratio={1846 / 871} className="h-7 sm:h-9" />
      <MaskedSvg src="/brand/wordmark-ngina.svg" ratio={1633 / 310} className="h-3 sm:h-3.5" label="Ngina Trails and Safaris" />
    </span>
  )
}

export function LocationLine({ className = '' }: { className?: string }) {
  return <MaskedSvg src="/brand/location-line.svg" ratio={1254 / 97} className={className} label="Diani Beach, Kenya" />
}
