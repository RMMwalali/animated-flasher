import Image from 'next/image'
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
/**
 * The owner's logo (icon + "Ngina Trails and Safaris, Diani Beach, Kenya").
 * `colour` for light backgrounds; `light` (dark parts in cream) for dark ones.
 * Files: public/brand/logo-full*.png, made by scripts/brand/logo-assets.py.
 */
export function BrandLogo({ variant = 'colour', className = '', priority = false, sizes = '120px' }: { variant?: 'colour' | 'light'; className?: string; priority?: boolean; sizes?: string }) {
  return (
    <Image
      src={variant === 'light' ? '/brand/logo-full-light.png' : '/brand/logo-full.png'}
      alt="Ngina Trails and Safaris, Diani Beach, Kenya"
      width={1200}
      height={999}
      sizes={sizes}
      priority={priority}
      className={`h-auto w-auto ${className}`}
    />
  )
}

/** Header: swaps between the two versions with the header's background. */
export function HeaderLogo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <span className={`relative block ${className}`}>
      <BrandLogo variant="light" priority className={`h-[60px] transition-opacity duration-500 sm:h-[72px] ${light ? 'opacity-0' : 'opacity-100'}`} />
      <BrandLogo variant="colour" priority className={`absolute inset-0 h-[60px] transition-opacity duration-500 sm:h-[72px] ${light ? 'opacity-100' : 'opacity-0'}`} />
    </span>
  )
}

export function LocationLine({ className = '' }: { className?: string }) {
  return <MaskedSvg src="/brand/location-line.svg" ratio={1254 / 97} className={className} label="Diani Beach, Kenya" />
}
