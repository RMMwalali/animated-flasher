import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icon } from '@/components/icons/Icon'
import { Media } from '@/components/site/Media'
import type { MediaVM } from '@/lib/content'

type Fallback = 'coast' | 'safari' | 'dawn'

/**
 * The one card used across the site: a photo with the title and one short
 * line. On hover (or keyboard focus) the photo eases in and a short
 * description slides up. On touch screens the card nearest the middle of the
 * screen reveals itself as you scroll (see CardReveal). The whole card is
 * one link, so it works the same on every device.
 */
export function PhotoCard({
  href, image, fallback, title, meta, summary, cta = 'View', aspect = 'aspect-[4/5]', sizes = '(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw',
  headingLevel = 'h3', priority = false, ctaId, className = '', large = false,
}: {
  href: string
  image?: MediaVM | null
  fallback: Fallback
  title: string
  meta?: ReactNode
  summary?: string | null
  cta?: string
  aspect?: string
  sizes?: string
  headingLevel?: 'h2' | 'h3'
  priority?: boolean
  ctaId?: string
  className?: string
  /** The wide lead card (e.g. the latest article): a bigger title. */
  large?: boolean
}) {
  const H = headingLevel
  return (
    <article className={`photo-card h-full ${className}`}>
      <Link href={href} data-cta={ctaId} className={`group relative block h-full overflow-hidden rounded-2xl bg-night ${aspect} outline-none`}>
        <div className="photo-card__img absolute inset-0">
          <Media media={image} fallback={fallback} sizes={sizes} priority={priority} />
        </div>
        <div className="photo-card__shade absolute inset-0" aria-hidden="true" />
        <div className={`absolute inset-x-0 bottom-0 text-cream ${large ? 'p-5 sm:p-10' : 'p-5 sm:p-6'}`}>
          <div className="photo-card__lift">
            {meta && <p className="text-sm text-cream/80">{meta}</p>}
            <H className={`mt-1 font-display font-medium leading-[1.05] ${large ? 'max-w-[22ch] text-[1.9rem] sm:text-5xl' : 'text-[1.7rem] sm:text-3xl'}`}>{title}</H>
          </div>
          {(summary || cta) && (
            <div className="photo-card__more">
              <div className="min-h-0">
                {summary && <p className="line-clamp-2 pt-3 text-[0.95rem] leading-relaxed text-cream/90">{summary}</p>}
                <p className="inline-flex items-center gap-2 pt-3 text-sm font-semibold">
                  {cta} <Icon name="arrow-right" size={16} />
                </p>
              </div>
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}
