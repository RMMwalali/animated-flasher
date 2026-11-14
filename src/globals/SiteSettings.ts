import type { GlobalConfig } from 'payload'
import { admins, anyone } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidateGlobal'
import { coordsFromMapsUrl } from '@/lib/seo/text'

/** Pin from a Google Maps link; short maps.app.goo.gl links are expanded first. */
async function pinFromLink(url: string) {
  const direct = coordsFromMapsUrl(url)
  if (direct || !/^https:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//.test(url)) return direct
  try {
    const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(5000) })
    return coordsFromMapsUrl(res.headers.get('location'))
  } catch {
    return null
  }
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Business settings',
  admin: { group: '05 Team', description: 'Your business details. Used across the website, emails and Google markup.' },
  access: { read: anyone, update: admins },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Business',
          fields: [
            { name: 'businessName', type: 'text', required: true, defaultValue: 'Ngina Trails and Safaris' },
            { name: 'tagline', type: 'text', defaultValue: 'Safaris and coastal journeys from Diani Beach, Kenya' },
            { type: 'row', fields: [
              { name: 'email', type: 'email' },
              { name: 'phone', type: 'text', admin: { description: 'International format, e.g. +254 7XX XXX XXX' } },
              { name: 'whatsapp', type: 'text', admin: { description: 'Number for WhatsApp, digits only with country code.' } },
            ] },
            {
              name: 'address', type: 'group',
              fields: [
                { type: 'row', fields: [{ name: 'street', type: 'text' }, { name: 'locality', type: 'text', defaultValue: 'Diani Beach' }] },
                { type: 'row', fields: [
                  { name: 'region', type: 'text', defaultValue: 'Kwale County' },
                  { name: 'postalCode', type: 'text' },
                  { name: 'country', type: 'text', defaultValue: 'KE', admin: { description: 'Two-letter code.' } },
                ] },
                {
                  name: 'googleMapsUrl', type: 'text', label: 'Google Maps link',
                  admin: { description: 'Open your business (or your exact spot) in Google Maps, press Share → Copy link, and paste it here. The map pin below fills in automatically when you save.' },
                },
                { type: 'row', fields: [
                  { name: 'lat', type: 'number', label: 'Pin latitude', defaultValue: -4.3167, admin: { step: 0.000001, description: 'Filled from the link. Or right-click the spot in Google Maps and click the numbers to copy them.' } },
                  { name: 'lng', type: 'number', label: 'Pin longitude', defaultValue: 39.5833, admin: { step: 0.000001 } },
                ] },
                { name: 'showMap', type: 'checkbox', defaultValue: true, label: 'Show a map on the Contact page', admin: { description: 'The map only loads when a visitor clicks it (no Google cookies before that).' } },
              ],
            },
            {
              name: 'hours', type: 'array', label: 'Opening hours', admin: { description: 'Optional. Leave empty to show "Enquire any time · we reply within …" instead of office hours.' },
              fields: [{ type: 'row', fields: [
                { name: 'days', type: 'select', hasMany: true, required: true, options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
                { name: 'opens', type: 'text', required: true, defaultValue: '08:00' },
                { name: 'closes', type: 'text', required: true, defaultValue: '18:00' },
              ] }],
            },
            { name: 'responseTime', type: 'text', defaultValue: 'one working day', admin: { description: 'Shown on the website and in emails: "we reply within …", e.g. 24 hours.' } },
            { name: 'social', type: 'array', label: 'Profiles on other sites', admin: { description: 'Your Google Business Profile, TripAdvisor, SafariBookings and social pages. Search engines and AI assistants use these to confirm they are all the same business.' }, fields: [{ type: 'row', fields: [
              { name: 'platform', type: 'select', required: true, options: ['google', 'tripadvisor', 'safaribookings', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'x', 'other'] },
              { name: 'url', type: 'text', required: true },
            ] }] },
          ],
        },
        {
          label: 'Search & Google',
          description: 'How your website appears on Google, Bing and AI assistants. Every page and article also gets its own title and description automatically (see "Search & sharing" on each one).',
          fields: [
            {
              name: 'search', type: 'group', label: false,
              fields: [
                { type: 'row', fields: [
                  { name: 'siteName', type: 'text', label: 'Site name in search results', admin: { description: 'The name shown above your results on Google. Leave empty to use the business name.' } },
                  { name: 'alternateName', type: 'text', label: 'Also known as', admin: { description: 'Optional short name, e.g. "Ngina Safaris".' } },
                ] },
                { name: 'defaultDescription', type: 'textarea', label: 'Home page description', maxLength: 200, admin: { description: 'Shown under your home page on Google (about 155 characters). Other pages describe themselves automatically.' } },
                { type: 'row', fields: [
                  { name: 'siteIcon', type: 'upload', relationTo: 'media', label: 'Site icon', admin: { description: 'The small square logo next to your name in Google results and browser tabs. Square PNG, at least 512×512. Leave empty to use the elephant.' } },
                  { name: 'shareImage', type: 'upload', relationTo: 'media', label: 'Default share image', admin: { description: 'Used when the home page is shared on WhatsApp or social media (1200×630). Other pages make their own.' } },
                ] },
                { type: 'collapsible', label: 'Verify ownership (Google Search Console, Bing)', admin: { initCollapsed: false }, fields: [
                  { name: 'googleVerification', type: 'text', label: 'Google verification code', admin: { description: 'Search Console → Add property → URL prefix → HTML tag. Paste only the code inside content="…", or the whole tag.' } },
                  { name: 'bingVerification', type: 'text', label: 'Bing verification code', admin: { description: 'Bing Webmaster Tools → Add site → HTML Meta Tag. Paste the code or the whole tag.' } },
                ] },
                { name: 'allowAiCrawlers', type: 'checkbox', defaultValue: true, label: 'Let AI assistants read the website (ChatGPT, Claude, Perplexity, Gemini)', admin: { description: 'Recommended: they can only recommend you if they can read your pages.' } },
                { name: 'hideFromSearch', type: 'checkbox', defaultValue: false, label: 'Hide the whole website from search engines', admin: { description: 'Only for testing or before launch. While ticked, Google and Bing are asked to drop every page.' } },
              ],
            },
          ],
        },
        {
          label: 'Trust',
          description: 'Licences and memberships shown on the website. Only list ones you actually hold, with the real number.',
          fields: [
            {
              name: 'trust', type: 'array', label: 'Licences & memberships',
              admin: { description: 'Shown on the Licences & memberships page, journey pages and the footer. Expired items are hidden automatically.' },
              fields: [
                { type: 'row', fields: [
                  { name: 'name', type: 'text', required: true, admin: { description: 'e.g. Tour operator licence' } },
                  { name: 'kind', type: 'select', defaultValue: 'licence', options: [
                    { label: 'Licence / permit', value: 'licence' }, { label: 'Membership', value: 'membership' }, { label: 'Certification', value: 'certification' },
                  ] },
                ] },
                { type: 'row', fields: [
                  { name: 'issuer', type: 'text', admin: { description: 'Issuing body, e.g. Tourism Regulatory Authority (TRA)' } },
                  { name: 'number', type: 'text', admin: { description: 'Licence / membership number' } },
                  { name: 'validUntil', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' }, description: 'Expiry date (optional).' } },
                ] },
                { name: 'description', type: 'textarea', admin: { description: 'One or two sentences: what it means for travellers.' } },
                { name: 'certificate', type: 'upload', relationTo: 'media', admin: { description: 'Optional: a photo or PDF of the certificate. Shown as "View certificate" on the Licences page.' } },
                { name: 'url', type: 'text', admin: { description: 'Link to verify, if the body publishes one.' } },
                { name: 'sample', type: 'checkbox', defaultValue: false, admin: { description: 'Placeholder. Hidden on the live site until you untick it.' } },
              ],
            },
          ],
        },
        {
          label: 'Reviews',
          fields: [
            {
              name: 'reviews', type: 'group',
              fields: [
                { type: 'row', fields: [
                  { name: 'delayDays', type: 'number', defaultValue: 2, min: 0, admin: { description: 'Days after the trip ends before asking.' } },
                  { name: 'reminderDays', type: 'number', defaultValue: 7, min: 1, admin: { description: 'Days before the one reminder.' } },
                ] },
                {
                  name: 'platforms', type: 'array', label: 'Review links',
                  admin: { description: 'Direct "write a review" links. Guests choose any of these.' },
                  defaultValue: [
                    { name: 'Google', url: '', enabled: true },
                    { name: 'TripAdvisor', url: '', enabled: true },
                    { name: 'SafariBookings', url: '', enabled: true },
                  ],
                  fields: [{ type: 'row', fields: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'url', type: 'text', admin: { description: 'Google: from Business Profile → "Ask for reviews". TripAdvisor: your listing\'s review link. SafariBookings: from your operator dashboard.' } },
                    { name: 'enabled', type: 'checkbox', defaultValue: true },
                  ] }],
                },
              ],
            },
          ],
        },
        {
          label: 'Notifications',
          fields: [
            { name: 'notifications', type: 'group', fields: [
              { name: 'teamEmails', type: 'text', admin: { description: 'Comma-separated addresses told about unassigned leads.' } },
            ] },
            { name: 'defaultDepositPercent', type: 'number', defaultValue: 30, min: 0, max: 100 },
            { name: 'showSampleBanner', type: 'checkbox', defaultValue: true, label: 'Show "sample content" banner on the website', admin: { description: 'Untick at launch, once sample content is replaced.' } },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc }) => {
        const a = data.address ?? {}
        const changed = a.googleMapsUrl && a.googleMapsUrl !== originalDoc?.address?.googleMapsUrl
        if (changed) {
          const pin = await pinFromLink(String(a.googleMapsUrl))
          if (pin) data.address = { ...a, lat: pin.lat, lng: pin.lng }
        }
        // accept a whole <meta …> tag as well as the bare code
        for (const k of ['googleVerification', 'bingVerification'] as const) {
          const v = data.search?.[k]
          if (typeof v === 'string') data.search[k] = /content=["']([^"']+)["']/.exec(v)?.[1] ?? v.trim()
        }
        return data
      },
    ],
    afterChange: [revalidateGlobal],
  },
}
