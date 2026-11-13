import { TYPE_META } from '@/components/journeys/TripIndexPage'
import { getDestinations, getPosts, getSettings, getTrips } from '@/lib/content'
import { env } from '@/lib/env'
import { visibleTrust } from '@/lib/trust'

export const revalidate = 3600

/** llms.txt: a plain summary of the business and its pages for AI assistants. */
export async function GET() {
  const [s, trips, destinations, posts] = await Promise.all([getSettings(), getTrips(), getDestinations(), getPosts()])
  const u = (p: string) => new URL(p, env.SITE_URL).toString()
  const price = (v?: number | null) => (v ? `from US$${v.toLocaleString('en-US')} per person` : 'price on request')
  const trust = visibleTrust(s).filter((t) => !t.sample)
  const lines = [
    `# ${s.businessName}`,
    '',
    `> ${s.tagline}. Tour operator based in ${s.address.locality}, ${s.address.region}, Kenya. Safaris (Tsavo, Amboseli, Maasai Mara, Samburu, Lake Nakuru), coastal tours (Kisite-Mpunguti, Wasini, Mombasa, Watamu, Lamu) and walking trips (Shimba Hills, Kaya forests, Mount Kenya). Booking is request-to-book: guests send a request, Ngina confirms availability and price, then a deposit is paid by M-Pesa or card.`,
    '',
    s.email || s.phone ? `Contact: ${[s.email, s.phone].filter(Boolean).join(', ')}` : `Contact: ${u('/contact')}`,
    ...(trust.length ? ['', '## Licences & memberships', ...trust.map((t) => `- ${t.issuer ? `${t.issuer}: ` : ''}${t.name}${t.number ? ` (No. ${t.number})` : ''}`)] : []),
    '',
    '## Journeys',
    ...trips.map((t) => `- [${t.title}](${u(`${TYPE_META[t.type].path}/${t.slug}`)}): ${t.days} days, ${price(t.priceFrom)}. ${t.summary}`),
    '',
    '## Destinations',
    ...destinations.map((d) => `- [${d.name}](${u(`/destinations/${d.slug}`)}): ${d.summary}${d.distanceFromDiani ? ` From Diani: ${d.distanceFromDiani}.` : ''}`),
    '',
    '## Guides',
    `- [Kenya eTA guide](${u('/kenya-eta')}): who needs an Electronic Travel Authorisation and how to apply.`,
    `- [When to go](${u('/when-to-go')}): Kenya seasons month by month.`,
    `- [Wildlife guide](${u('/wildlife')})`,
    ...posts.map((p) => `- [${p.title}](${u(`/journal/${p.slug}`)}): ${p.excerpt}`),
    '',
    '## Optional',
    `- [Plan your trip / request to book](${u('/plan-your-trip')})`,
    `- [Licences & memberships](${u('/licences')})`,
    `- [Sitemap](${u('/sitemap.xml')})`,
  ]
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
}
