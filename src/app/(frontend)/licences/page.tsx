import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'
import { CtaBand } from '@/components/page/CtaBand'
import { PageHero } from '@/components/page/PageHero'
import { getSettings } from '@/lib/content'
import { env } from '@/lib/env'
import { JsonLd } from '@/lib/seo/jsonld'
import { pageMeta } from '@/lib/seo/meta'
import { KIND_LABEL, visibleTrust } from '@/lib/trust'

export const revalidate = 3600
export const metadata: Metadata = pageMeta({
  title: 'Licences & memberships',
  description: 'Ngina Trails & Safaris is a licensed Kenyan tour operator based in Diani Beach. Our licences, memberships and certifications, with links to verify them.',
  path: '/licences',
})

export default async function LicencesPage() {
  const s = await getSettings()
  const items = visibleTrust(s)
  const org = new URL('/#organization', env.SITE_URL).toString()
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org', '@id': org, '@type': ['TravelAgency', 'LocalBusiness'], name: s.businessName,
          hasCredential: items.filter((t) => !t.sample && t.kind !== 'membership').map((t) => ({ '@type': 'EducationalOccupationalCredential', name: t.name, credentialCategory: t.kind, recognizedBy: t.issuer ? { '@type': 'Organization', name: t.issuer } : undefined, identifier: t.number || undefined, validUntil: t.validUntil || undefined })),
          memberOf: items.filter((t) => !t.sample && t.kind === 'membership').map((t) => ({ '@type': 'Organization', name: t.issuer || t.name, url: t.url || undefined })),
        }}
      />
      <PageHero eyebrow="Licensed & accountable" title="Travel with a registered Kenyan operator." emphasis="registered" intro="These are the licences, memberships and certifications we hold. Where the issuing body publishes a register, you can check it yourself." tone="cream" compact crumbs={[{ name: 'Licences & memberships', path: '/licences' }]} />
      <section data-tone="cream" className="pb-24">
        <div className="gutter mx-auto max-w-5xl">
          {items.length === 0 ? (
            <p className="text-lg">Details coming soon. Ask us for copies of our licences at any time.</p>
          ) : (
            <ul className="border-t border-deep">
              {items.map((t) => (
                <li key={`${t.issuer}-${t.name}`} className="grid gap-4 border-b border-line py-8 sm:grid-cols-[3rem_1fr_auto] sm:items-start">
                  <Icon name={t.kind === 'membership' ? 'users' : t.kind === 'certification' ? 'star' : 'shield'} size={32} className="text-green" />
                  <div>
                    <p className="eyebrow text-teal-ink">{KIND_LABEL[t.kind ?? 'licence']}{t.issuer ? ` · ${t.issuer}` : ''}</p>
                    <h2 className="mt-2 font-display text-3xl font-medium">{t.name}</h2>
                    <p className="mt-2 font-mono text-sm">
                      {t.number ? <>No. {t.number}</> : <span className="text-ochre-ink">Number to be added</span>}
                      {t.validUntil && <> · valid until {new Date(t.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</>}
                    </p>
                    {t.description && <p className="mt-3 max-w-2xl text-lg leading-relaxed">{t.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    {t.sample && <span className="rounded-full border border-ochre-ink px-2 py-0.5 font-mono text-[11px] uppercase text-ochre-ink">Sample</span>}
                    {t.certificate?.url && (
                      <a href={t.certificate.url} target="_blank" rel="noopener" className="btn btn-ghost !min-h-11 !py-2 text-sm">
                        <span>View certificate</span> <Icon name={t.certificate.mimeType === 'application/pdf' ? 'download' : 'image'} size={16} />
                      </a>
                    )}
                    {t.url && (
                      <a href={t.url} rel="noopener" className="btn btn-ghost !min-h-11 !py-2 text-sm">
                        <span>Verify</span> <Icon name="external-link" size={16} />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-10 max-w-2xl text-deep/85">
            Travelling to Kenya? Most visitors need an Electronic Travel Authorisation before they fly. <Link href="/kenya-eta" className="underline underline-offset-4">Read our Kenya eTA guide</Link>.
          </p>
        </div>
      </section>
      <CtaBand ctaId="licences-cta" />
    </>
  )
}
