import type { Metadata } from 'next'
import { EnquiryForm } from '@/components/forms/EnquiryForm'
import { Icon } from '@/components/icons/Icon'
import { PageHero } from '@/components/page/PageHero'
import { LocationLine } from '@/components/site/Logo'
import { formatHours } from '@/components/site/hours'
import { getSettings } from '@/lib/content'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600
export const metadata: Metadata = pageMeta({ title: 'Contact us in Diani Beach, Kenya', description: 'Email, phone or message our team in Diani Beach, Kwale County, Kenya. We reply personally.', path: '/contact' })

export default async function ContactPage() {
  const s = await getSettings()
  const a = s.address
  return (
    <>
      <PageHero eyebrow="Contact" title="Karibu. Let us talk." emphasis="talk" intro={`We are a small team in Diani Beach. We usually reply within ${s.responseTime || 'one working day'}.`} tone="cream" compact crumbs={[{ name: 'Contact', path: '/contact' }]} />
      <section data-tone="cream" className="pb-24">
        <div className="gutter mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="grid content-start gap-8">
            <div>
              <p className="eyebrow text-teal-ink">Find us</p>
              <address className="mt-3 grid gap-2 text-lg not-italic">
                <span>{[a.street, a.locality, a.region].filter(Boolean).join(', ')}, Kenya</span>
                {s.email && <a className="inline-flex items-center gap-3 underline-offset-4 hover:underline" href={`mailto:${s.email}`}><Icon name="mail" size={20} />{s.email}</a>}
                {s.phone && <a className="inline-flex items-center gap-3 underline-offset-4 hover:underline" href={`tel:${s.phone.replace(/\s+/g, '')}`}><Icon name="phone" size={20} />{s.phone}</a>}
                {s.whatsapp && <a className="inline-flex items-center gap-3 underline-offset-4 hover:underline" href={`https://wa.me/${s.whatsapp.replace(/\D/g, '')}`} rel="noopener"><Icon name="whatsapp" size={20} />WhatsApp</a>}
              </address>
            </div>
            {s.hours.length > 0 && (
              <div>
                <p className="eyebrow text-teal-ink">Office hours (East Africa Time)</p>
                <ul className="mt-3 grid gap-1 text-lg">{formatHours(s.hours).map((h) => <li key={h}>{h}</li>)}</ul>
              </div>
            )}
            <LocationLine className="h-3 w-56 text-deep" />
          </div>
          <div className="rounded-3xl bg-paper p-6 sm:p-10">
            <h2 className="font-display text-3xl">Send us a message</h2>
            <div className="mt-6"><EnquiryForm ctaId="contact-form" /></div>
          </div>
        </div>
      </section>
    </>
  )
}
