import { env } from '@/lib/env'
import type { DestinationVM, PostVM, QA, SettingsVM, TripVM } from '@/lib/content'
import { tripHref } from '@/lib/routes'

const abs = (p: string) => new URL(p, env.SITE_URL).toString()
const ORG_ID = () => abs('/#organization')
const DAY: Record<string, string> = { Monday: 'Mo', Tuesday: 'Tu', Wednesday: 'We', Thursday: 'Th', Friday: 'Fr', Saturday: 'Sa', Sunday: 'Su' }

export function travelAgency(s: SettingsVM) {
  const a = s.address
  return {
    '@context': 'https://schema.org',
    '@type': ['TravelAgency', 'LocalBusiness'],
    '@id': ORG_ID(),
    name: s.businessName,
    description: s.tagline,
    url: abs('/'),
    logo: abs('/brand/icon-512.png'),
    image: abs('/brand/og-default.png'),
    email: s.email || undefined,
    telephone: s.phone || undefined,
    address: { '@type': 'PostalAddress', streetAddress: a.street || undefined, addressLocality: a.locality, addressRegion: a.region, postalCode: a.postalCode || undefined, addressCountry: a.country },
    geo: a.lat != null && a.lng != null ? { '@type': 'GeoCoordinates', latitude: a.lat, longitude: a.lng } : undefined,
    // only stated when the owner sets office hours (enquiries are accepted any time)
    openingHoursSpecification: !s.hours.length ? undefined : s.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map((d) => `https://schema.org/${d}`), opens: h.opens, closes: h.closes })),
    openingHours: !s.hours.length ? undefined : s.hours.map((h) => `${h.days.map((d) => DAY[d]).join(',')} ${h.opens}-${h.closes}`),
    areaServed: { '@type': 'Country', name: 'Kenya' },
    sameAs: s.social.map((x) => x.url),
  }
}

export function website(s: SettingsVM) {
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': abs('/#website'), name: s.businessName, url: abs('/'), publisher: { '@id': ORG_ID() }, inLanguage: 'en' }
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  }
}

export function faqPage(faqs: QA[]) {
  if (!faqs.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  }
}

export function touristTrip(t: TripVM) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': abs(`${tripHref(t)}#trip`),
    name: t.title,
    description: t.summary,
    url: abs(tripHref(t)),
    touristType: t.type === 'coastal' ? 'Beach and culture' : t.type === 'walking' ? 'Hiking' : 'Wildlife safari',
    provider: { '@id': ORG_ID() },
    itinerary: t.itinerary.length
      ? { '@type': 'ItemList', numberOfItems: t.itinerary.length, itemListElement: t.itinerary.map((d, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'TouristAttraction', name: d.title, description: d.description ?? undefined } })) }
      : undefined,
    subjectOf: t.destinations.map((d) => ({ '@type': 'TouristDestination', name: d.name, url: abs(`/destinations/${d.slug}`) })),
    offers: t.priceFrom
      ? { '@type': 'Offer', price: t.priceFrom, priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: abs(`/plan-your-trip?trip=${t.slug}`), description: t.priceBasis ?? 'per person sharing', seller: { '@id': ORG_ID() } }
      : undefined,
  }
}

export function touristDestination(d: DestinationVM) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    '@id': abs(`/destinations/${d.slug}#place`),
    name: d.name,
    description: d.summary,
    url: abs(`/destinations/${d.slug}`),
    geo: d.lat != null && d.lng != null ? { '@type': 'GeoCoordinates', latitude: d.lat, longitude: d.lng } : undefined,
    containedInPlace: { '@type': 'Country', name: 'Kenya' },
    touristType: d.region === 'coast' ? ['Beach', 'Marine', 'Culture'] : d.region === 'mountain' ? ['Hiking', 'Mountaineering'] : ['Wildlife safari'],
    additionalProperty: d.keyFacts.map((f) => ({ '@type': 'PropertyValue', name: f.label, value: f.value })),
  }
}

export function article(p: PostVM) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.excerpt,
    datePublished: p.publishedAt,
    dateModified: p.updatedAt ?? p.publishedAt,
    mainEntityOfPage: abs(`/blog/${p.slug}`),
    author: { '@type': 'Person', name: p.author.name, jobTitle: p.author.role ?? undefined, description: p.author.bio, knowsAbout: p.author.expertise, url: abs(`/blog/author/${p.author.slug}`) },
    publisher: { '@id': ORG_ID() },
    image: p.heroImage?.url ? abs(p.heroImage.url) : abs('/brand/og-default.png'),
  }
}

/** Render one or more JSON-LD objects safely. */
export function JsonLd({ data }: { data: unknown }) {
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean)
  const json = JSON.stringify(items.length === 1 ? items[0] : items).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
