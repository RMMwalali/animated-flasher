import { Emphasis } from '@/components/site/Emphasis'
import { EnquiryForm } from '@/components/forms/EnquiryForm'
import type { HomeVM } from '@/lib/content'

export function Closing({ home, n = 7 }: { home: HomeVM; n?: number }) {
  return (
    <section id="enquire" data-tone="safari" className="py-24 sm:py-32" aria-labelledby="closing-title">
      <div className="gutter mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="eyebrow text-ochre" data-reveal>{String(n).padStart(2, '0')} · Enquire</p>
          <h2 id="closing-title" className="statement mt-4 max-w-[12ch]" data-reveal>
            <Emphasis text={home.ctaStatement} emphasis={home.ctaEmphasis} />
          </h2>
          {home.ctaBody && <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/90" data-reveal>{home.ctaBody}</p>}
        </div>
        <div className="rounded-3xl bg-paper p-6 text-deep sm:p-10" data-reveal>
          <EnquiryForm ctaId="home-closing-form" />
        </div>
      </div>
    </section>
  )
}
