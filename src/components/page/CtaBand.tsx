import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'
import { Emphasis } from '@/components/site/Emphasis'

/** Closing call to action used at the end of inner pages. */
export function CtaBand({ title = 'Tell us where your journey begins.', emphasis = 'begins', body, href = '/plan-your-trip', label = 'Plan your trip', ctaId }: { title?: string; emphasis?: string; body?: string; href?: string; label?: string; ctaId: string }) {
  return (
    <section data-tone="safari" className="py-24 sm:py-28">
      <div className="gutter mx-auto flex max-w-7xl flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="statement max-w-[14ch]" data-reveal>
            <Emphasis text={title} emphasis={emphasis} />
          </h2>
          {body && <p className="mt-5 max-w-lg text-lg text-cream/90" data-reveal>{body}</p>}
        </div>
        <Link href={href} className="btn btn-primary" data-cta={ctaId} data-reveal>
          {label} <Icon name="arrow-right" size={18} />
        </Link>
      </div>
    </section>
  )
}
