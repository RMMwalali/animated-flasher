import type { CollectionConfig } from 'payload'
import { contentAccess } from '@/access'
import { bestMonthsField, faqsField, keyFactsField, sampleField, seoFieldWith, slugField } from '@/fields'
import { revalidateAfterChange } from '@/hooks/revalidate'

export const TRIP_TYPES = [
  { label: 'Safari', value: 'safari' },
  { label: 'Coastal tour', value: 'coastal' },
  { label: 'Walking & mountain', value: 'walking' },
] as const

export const tripPath = (doc: { type?: string | null; slug?: string | null }) =>
  doc.type === 'coastal' ? `/coastal-tours/${doc.slug}` : doc.type === 'walking' ? `/walking-and-mountain/${doc.slug}` : `/safaris/${doc.slug}`

export const Trips: CollectionConfig = {
  slug: 'trips',
  labels: { singular: 'Journey', plural: 'Journeys' },
  admin: {
    useAsTitle: 'title',
    group: '04 Website',
    defaultColumns: ['title', 'type', 'days', 'priceFrom', 'featured', '_status'],
    description: 'Safaris, coastal tours and walking trips. These also feed the quote builder.',
  },
  access: contentAccess,
  versions: { drafts: true, maxPerDoc: 30 },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'type', type: 'select', required: true, defaultValue: 'safari', options: [...TRIP_TYPES], admin: { position: 'sidebar' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Show on the home page.' } },
    { name: 'order', type: 'number', defaultValue: 100, admin: { position: 'sidebar', description: 'Lower numbers show first.' } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'summary', type: 'textarea', required: true, admin: { description: 'One or two sentences. Used on cards and in search results.' } },
            { name: 'statement', type: 'text', admin: { description: 'Large headline on the journey page.' } },
            { name: 'emphasis', type: 'text', admin: { description: 'Word in the headline to underline.' } },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
            { name: 'highlights', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
            { name: 'destinations', type: 'relationship', relationTo: 'destinations', hasMany: true },
          ],
        },
        {
          label: 'Facts & price',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'days', type: 'number', required: true, min: 1 },
                { name: 'nights', type: 'number', min: 0 },
                { name: 'startsFrom', type: 'text', defaultValue: 'Diani Beach', admin: { description: 'Pick-up point.' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'priceFrom', type: 'number', min: 0, admin: { description: 'Lowest price per person, US$.' } },
                { name: 'priceBasis', type: 'text', defaultValue: 'per person sharing', admin: { description: 'e.g. "per person sharing, low season".' } },
                { name: 'childPercent', type: 'number', defaultValue: 50, min: 0, max: 100, admin: { description: 'Child price as % of adult price (quote builder).' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'singleSupplement', type: 'number', min: 0, admin: { description: 'US$ extra for a single room.' } },
                { name: 'groupSizeMax', type: 'number', min: 1 },
                { name: 'difficulty', type: 'select', options: ['easy', 'moderate', 'challenging'] },
              ],
            },
            bestMonthsField,
            keyFactsField,
          ],
        },
        {
          label: 'Day by day',
          fields: [
            {
              name: 'itinerary',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
                { type: 'row', fields: [
                  { name: 'overnight', type: 'text' },
                  { name: 'meals', type: 'select', hasMany: true, options: [{ label: 'Breakfast', value: 'B' }, { label: 'Lunch', value: 'L' }, { label: 'Dinner', value: 'D' }] },
                  { name: 'drive', type: 'text', admin: { description: 'e.g. "3 h drive, 160 km"' } },
                ] },
              ],
            },
            { name: 'inclusions', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
            { name: 'exclusions', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
          ],
        },
        { label: 'Q&A', fields: [faqsField] },
        { label: 'SEO', fields: [seoFieldWith({ titleField: 'title', descriptionFields: ['summary'], typePaths: { safari: '/safaris/', coastal: '/coastal-tours/', walking: '/walking-and-mountain/' } })] },
      ],
    },
    sampleField,
  ],
  hooks: { afterChange: [revalidateAfterChange((doc) => [tripPath(doc), '/safaris', '/coastal-tours', '/walking-and-mountain'])] },
}
