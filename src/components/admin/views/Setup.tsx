import type { AdminViewServerProps } from 'payload'
import { features, missingFeatures } from '@/lib/env'
import { LoadSampleButton } from '../LoadSampleButton'
import { ArrowList, Page, Section } from '../ui'
import { Shell } from './Shell'

export async function SetupView(props: AdminViewServerProps) {
  const missing = missingFeatures()
  const settings = await props.initPageResult.req.payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const { totalDocs: samples } = await props.initPageResult.req.payload.count({ collection: 'trips', where: { sample: { equals: true } } })
  const { totalDocs: tripCount } = await props.initPageResult.req.payload.count({ collection: 'trips' })
  const reviewLinks = (settings.reviews?.platforms ?? []).filter((p) => p.enabled && p.url).length
  const ok = { label: 'Connected', tone: 'teal' as const }
  const todo = { label: 'To do', tone: 'ochre' as const }
  return (
    <Shell props={props} roles={['admin']}>
      <Page eyebrow="Admin" title="Go-live setup" intro="What is connected and what still needs doing. The full checklist is in docs/OWNER-GUIDE.md.">
        <Section n={1} title="Services">
          <ArrowList
            items={[
              { label: 'Database (Neon Postgres)', status: features.database ? ok : todo, meta: 'Vercel Storage tab' },
              { label: 'Photo storage (Vercel Blob or Cloudflare R2)', status: features.storage ? { label: features.storageProvider === 'vercel-blob' ? 'Vercel Blob' : 'Cloudflare R2', tone: 'teal' } : todo, meta: 'Vercel Storage tab' },
              { label: 'Email sending (Postmark)', status: features.email ? ok : todo, meta: 'POSTMARK_SERVER_TOKEN' },
              { label: 'Guest email replies (Postmark inbound)', status: features.inboundEmail ? ok : todo, meta: 'POSTMARK_INBOUND_*' },
              { label: 'Live chat real-time (Pusher / Ably)', status: features.realtime !== 'none' ? { label: features.realtime, tone: 'teal' } : todo, meta: 'PUSHER_* or ABLY_API_KEY' },
              { label: 'Payments (Paystack: M-Pesa + card)', status: features.payments ? ok : todo, meta: 'PAYSTACK_*' },
              { label: 'Spam check (Cloudflare Turnstile, optional)', status: features.turnstile ? ok : { label: 'Optional', tone: 'neutral' }, meta: 'TURNSTILE_*' },
              { label: 'Search engine ping (IndexNow)', status: features.indexNow ? ok : { label: 'Optional', tone: 'neutral' }, meta: 'INDEXNOW_KEY' },
              { label: 'Daily automation (reminders, quote expiry, reviews)', status: features.dailyJob ? ok : { label: 'Not running', tone: 'ochre' }, meta: 'CRON_SECRET' },
            ]}
          />
          {missing.length === 0 && <p className="ng-empty">Everything is connected.</p>}
        </Section>
        <Section n={2} title="Your content">
          <ArrowList
            items={[
              { href: '/admin/globals/site-settings', label: 'Business details, opening hours and licences', status: settings.phone && settings.email ? ok : todo },
              { href: '/admin/globals/site-settings', label: 'Review links (Google, TripAdvisor, SafariBookings)', status: reviewLinks ? { label: `${reviewLinks} set`, tone: 'teal' } : todo },
              { href: '/admin/collections/trips?where[sample][equals]=true', label: 'Replace sample journeys with your own', status: samples ? { label: `${samples} sample`, tone: 'ochre' } : ok },
              { href: '/admin/collections/media', label: 'Upload your own photos (and add descriptions)' },
              { href: '/admin/globals/site-settings', label: 'Turn off the "sample content" banner', status: settings.showSampleBanner ? todo : ok },
            ]}
          />
        </Section>
        <Section n={3} title="Sample content">
          <LoadSampleButton hasContent={tripCount > 0} />
        </Section>
      </Page>
    </Shell>
  )
}
