import type { GlobalConfig } from 'payload'
import { admins, anyone } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidateGlobal'

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
            { name: 'businessName', type: 'text', required: true, defaultValue: 'Ngina Trails & Safaris' },
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
                { type: 'row', fields: [
                  { name: 'lat', type: 'number', defaultValue: -4.3167, admin: { step: 0.0001 } },
                  { name: 'lng', type: 'number', defaultValue: 39.5833, admin: { step: 0.0001 } },
                ] },
              ],
            },
            {
              name: 'hours', type: 'array', label: 'Opening hours',
              fields: [{ type: 'row', fields: [
                { name: 'days', type: 'select', hasMany: true, required: true, options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
                { name: 'opens', type: 'text', required: true, defaultValue: '08:00' },
                { name: 'closes', type: 'text', required: true, defaultValue: '18:00' },
              ] }],
            },
            { name: 'responseTime', type: 'text', defaultValue: 'one working day', admin: { description: 'Shown in acknowledgement emails: "usually within …"' } },
            { name: 'social', type: 'array', fields: [{ type: 'row', fields: [
              { name: 'platform', type: 'select', required: true, options: ['instagram', 'facebook', 'tiktok', 'youtube', 'tripadvisor', 'google'] },
              { name: 'url', type: 'text', required: true },
            ] }] },
          ],
        },
        {
          label: 'Trust',
          description: 'Licences and memberships shown on the website. Only list ones you actually hold, with the real number.',
          fields: [
            {
              name: 'trust', type: 'array', label: 'Licences & memberships',
              fields: [
                { type: 'row', fields: [
                  { name: 'name', type: 'text', required: true, admin: { description: 'e.g. Tourism Regulatory Authority licence' } },
                  { name: 'number', type: 'text', admin: { description: 'Licence / membership number' } },
                ] },
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
  hooks: { afterChange: [revalidateGlobal] },
}
