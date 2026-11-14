import type { Field, GlobalConfig } from 'payload'
import { admins } from '@/access'
import { invalidateConfig } from '@/lib/config'
import { decryptSecret, encryptSecret, isEncrypted, isMasked, maskSecret } from '@/lib/secrets'

/**
 * A key field that is stored encrypted and never shown again in full: the
 * admin sees "••••••••abcd". Saving the masked value keeps the key; clearing
 * the box removes it. Only server code that asks for it (context
 * `revealSecrets`) gets the real value.
 */
const secret = (name: string, label: string, description?: string, condition?: (data: unknown, sibling: any) => boolean): Field => ({
  name, label, type: 'text',
  admin: { description: description ? `${description} Stored encrypted; only the last 4 characters are shown.` : 'Stored encrypted; only the last 4 characters are shown.', autoComplete: 'off', condition },
  hooks: {
    beforeChange: [
      ({ value, previousValue }) => {
        if (value == null || value === '') return null
        if (isMasked(value)) return previousValue
        const v = String(value).trim()
        return isEncrypted(v) ? v : encryptSecret(v)
      },
    ],
    afterRead: [({ value, context }) => (value ? (context?.revealSecrets ? decryptSecret(value) : maskSecret(decryptSecret(value))) : value)],
  },
})

const test = (service: string): Field => ({
  name: `test_${service}`, type: 'ui',
  admin: { components: { Field: { path: '/components/admin/TestConnection#TestConnection', clientProps: { service } } } },
})

const plain = (name: string, label: string, description?: string): Field => ({ name, label, type: 'text', admin: { description } })

export const Integrations: GlobalConfig = {
  slug: 'integrations',
  label: 'Integrations',
  admin: {
    group: '05 Team',
    description: 'Connect outside services by pasting their keys here. A key set in Vercel (Environment Variables) always takes priority. Save, then press "Test connection".',
  },
  // admins only, also for reading: keys are never exposed to anyone else
  access: { read: admins, update: admins },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Payments',
          fields: [{
            name: 'paystack', type: 'group', label: 'Paystack (M-Pesa + card)',
            admin: { description: 'Paystack dashboard → Settings → API Keys & Webhooks. Use test keys first (sk_test_…), then live keys (sk_live_…). Webhook URL: https://yourdomain/api/webhooks/paystack' },
            fields: [secret('secretKey', 'Secret key'), plain('publicKey', 'Public key'), test('paystack')],
          }],
        },
        {
          label: 'Email',
          fields: [{
            name: 'postmark', type: 'group', label: 'Postmark (sending and guest replies)',
            admin: { description: 'Postmark → your server → API Tokens. The "from" address must be on a domain you verified in Postmark (a Gmail address cannot be used).' },
            fields: [
              secret('serverToken', 'Server API token'),
              { type: 'row', fields: [plain('fromEmail', 'Send from', 'e.g. Ngina Trails and Safaris <hello@nginatrails.com>'), plain('messageStream', 'Message stream', 'Usually "outbound".')] },
              plain('inboundAddress', 'Inbound address', 'Postmark → Inbound stream → the …@inbound.postmarkapp.com address. Guest replies arrive here.'),
              { type: 'row', fields: [plain('inboundUser', 'Inbound webhook username'), secret('inboundPassword', 'Inbound webhook password')] },
              test('postmark'),
            ],
          }],
        },
        {
          label: 'Live chat',
          fields: [{
            name: 'realtime', type: 'group', label: 'Real-time chat (Pusher or Ably)',
            admin: { description: 'Optional. Without it, chat still works but refreshes every few seconds.' },
            fields: [
              { name: 'provider', type: 'select', defaultValue: 'none', options: [{ label: 'None (refresh every few seconds)', value: 'none' }, { label: 'Pusher Channels', value: 'pusher' }, { label: 'Ably', value: 'ably' }] },
              { type: 'row', admin: { condition: (_, s) => s?.provider === 'pusher' }, fields: [plain('pusherAppId', 'App ID'), plain('pusherKey', 'Key'), plain('pusherCluster', 'Cluster', 'e.g. eu')] },
              secret('pusherSecret', 'Pusher secret', undefined, (_, s) => s?.provider === 'pusher'),
              secret('ablyApiKey', 'Ably API key', undefined, (_, s) => s?.provider === 'ably'),
            ],
          }],
        },
        {
          label: 'Analytics & ads',
          description: 'Which visitor statistics and ad tools run on the website. Everything except Vercel Analytics loads only after a visitor accepts cookies.',
          fields: [{
            name: 'analytics', type: 'group', label: false,
            fields: [
              { name: 'vercel', type: 'checkbox', defaultValue: true, label: 'Vercel Web Analytics (no cookies, no banner needed)', admin: { description: 'Also switch it on in Vercel → your project → Analytics.' } },
              { type: 'row', fields: [plain('ga4Id', 'Google Analytics 4 ID', 'Starts with G-'), plain('clarityId', 'Microsoft Clarity project ID', 'Free heatmaps and recordings.')] },
              { type: 'row', fields: [plain('metaPixelId', 'Meta (Facebook/Instagram) Pixel ID', 'For ads.'), plain('tiktokPixelId', 'TikTok Pixel ID', 'For TikTok ads.')] },
            ],
          }],
        },
        {
          label: 'Reviews',
          fields: [{
            name: 'google', type: 'group', label: 'Google reviews on the website',
            admin: { description: 'Shows your real Google rating and latest reviews (with Google\'s attribution). Needs a Google Cloud API key with "Places API (New)" enabled; Google bills usage beyond a free monthly allowance. Your review links (Google, TripAdvisor, SafariBookings) are in Business settings → Reviews.' },
            fields: [secret('placesApiKey', 'Google API key'), plain('placeId', 'Place ID', 'Find it with Google\'s "Place ID finder" (search your business name).'), test('google')],
          }],
        },
        {
          label: 'Security & search',
          fields: [
            {
              name: 'turnstile', type: 'group', label: 'Cloudflare Turnstile (extra spam check, optional)',
              admin: { description: 'Cloudflare → Turnstile → Add site. Without it, forms are still protected by hidden traps, timing and rate limits.' },
              fields: [{ type: 'row', fields: [plain('siteKey', 'Site key')] }, secret('secretKey', 'Secret key'), test('turnstile')],
            },
            {
              name: 'indexNow', type: 'group', label: 'IndexNow (tell Bing about new pages instantly)',
              fields: [plain('key', 'Key', 'Any 32 letters and numbers. The website publishes it at /indexnow-key.txt automatically.')],
            },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [() => invalidateConfig()] },
}
