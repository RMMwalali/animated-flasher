import Link from 'next/link'
import { brandPaths } from '@/components/brand/paths'
import { Icon } from '@/components/icons/Icon'

export default function NotFound() {
  const [x, y, w, h] = brandPaths.lion.box
  return (
    <section data-tone="cream" className="gutter grid min-h-[80svh] place-items-center pt-32 text-center">
      <div className="grid justify-items-center gap-6">
        <svg viewBox={`${x} ${y} ${w} ${h}`} className="w-40 text-deep" aria-hidden="true">
          <path d={brandPaths.lion.d} fill="currentColor" fillRule="evenodd" />
        </svg>
        <p className="eyebrow text-teal-ink">404</p>
        <h1 className="statement max-w-[16ch]">
          This trail has gone <em className="italic">cold</em>.
        </h1>
        <p className="max-w-md text-lg">The page you were looking for has moved or never existed.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            Back to the start <Icon name="arrow-right" size={18} />
          </Link>
          <Link href="/destinations" className="btn btn-ghost">
            <span>Explore destinations</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
