import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'
import { JourneyCard } from '@/components/home/JourneyCard'
import { Emphasis } from '@/components/site/Emphasis'
import { Media } from '@/components/site/Media'
import { media as toMedia } from '@/lib/content'
import { JsonLd, faqPage } from '@/lib/seo/jsonld'
import { CtaBand } from './CtaBand'
import { Faq } from './Faq'
import { KeyFacts } from './KeyFacts'
import { Prose } from './Prose'

type Block = Record<string, any> & { blockType: string; id?: string }

/** Renders the flexible sections of a CMS page. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        const tone = b.tone ?? 'cream'
        switch (b.blockType) {
          case 'statement':
            return (
              <section key={b.id ?? i} data-tone={tone} className="py-24 sm:py-36">
                <div className="gutter mx-auto max-w-6xl">
                  {b.eyebrow && <p className="eyebrow tone-accent" data-reveal>{b.eyebrow}</p>}
                  <p className="statement mt-5" data-reveal>
                    <Emphasis text={b.text} emphasis={b.emphasis} />
                  </p>
                </div>
              </section>
            )
          case 'textMedia': {
            const img = typeof b.image === 'object' ? toMedia(b.image) : null
            return (
              <section key={b.id ?? i} data-tone={tone} className="py-20 sm:py-28">
                <div className={`gutter mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 ${b.imageSide === 'left' ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                  <div>
                    {b.eyebrow && <p className="eyebrow tone-accent" data-reveal>{b.eyebrow}</p>}
                    <h2 className="mt-4 font-display text-4xl font-medium leading-tight sm:text-5xl" data-reveal>{b.heading}</h2>
                    {b.body && <p className="mt-6 whitespace-pre-line text-lg leading-relaxed opacity-90" data-reveal>{b.body}</p>}
                    {b.link?.href && (
                      <Link href={b.link.href} className="btn btn-ghost mt-8" data-reveal>
                        <span>{b.link.label || 'Read more'}</span> <Icon name="arrow-right" size={18} />
                      </Link>
                    )}
                  </div>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl" data-reveal="mask">
                    <Media media={img} fallback={tone === 'coast' ? 'coast' : tone === 'safari' ? 'safari' : 'dawn'} sizes="(min-width:1024px) 45vw, 100vw" />
                  </div>
                </div>
              </section>
            )
          }
          case 'facts':
            return (
              <section key={b.id ?? i} data-tone={tone} className="py-20">
                <div className="gutter mx-auto max-w-5xl">
                  <KeyFacts facts={b.keyFacts ?? []} heading={b.heading || 'Key facts'} />
                </div>
              </section>
            )
          case 'faq':
            return (
              <section key={b.id ?? i} data-tone="cream" className="py-20">
                <div className="gutter mx-auto max-w-4xl">
                  <Faq items={b.faqs ?? []} heading={b.heading || 'Good to know'} />
                  <JsonLd data={faqPage(b.faqs ?? [])} />
                </div>
              </section>
            )
          case 'cta':
            return <CtaBand key={b.id ?? i} title={b.heading} emphasis={undefined} body={b.body} href={b.href || '/plan-your-trip'} label={b.label || 'Plan your trip'} ctaId={b.ctaId || 'page-cta'} />
          case 'richText':
            return (
              <section key={b.id ?? i} data-tone="cream" className="py-16 sm:py-20">
                <div className="gutter mx-auto max-w-3xl">
                  <Prose data={b.content} />
                </div>
              </section>
            )
          case 'cards':
            return (
              <section key={b.id ?? i} data-tone={tone} className="py-20">
                <div className="gutter mx-auto max-w-7xl">
                  {b.heading && <h2 className="font-display text-4xl font-medium">{b.heading}</h2>}
                  <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {(b.items ?? []).filter((it: any) => it?.relationTo === 'trips' && typeof it.value === 'object').map((it: any) => (
                      <JourneyCard key={it.value.id} trip={{ ...it.value, heroImage: toMedia(it.value.heroImage), bestMonths: it.value.bestMonths ?? [] }} ctaPrefix="page-cards" />
                    ))}
                  </div>
                </div>
              </section>
            )
          default:
            return null
        }
      })}
    </>
  )
}
