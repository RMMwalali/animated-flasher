import type { CollectionConfig } from 'payload'
import { contentAccess } from '@/access'
import { bestMonthsField, faqsField, keyFactsField, sampleField, seoField, slugField } from '@/fields'
import { revalidateAfterChange } from '@/hooks/revalidate'

export const Destinations: CollectionConfig = {
  slug: 'destinations',
  labels: { singular: 'Destination', plural: 'Destinations' },
  admin: { useAsTitle: 'name', group: '04 Website', defaultColumns: ['name', 'region', 'distanceFromDiani', '_status'], description: 'One page per place. Facts here power Google and AI answers, so keep them accurate.' },
  access: contentAccess,
  versions: { drafts: true, maxPerDoc: 30 },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'region', type: 'select', required: true, options: [{ label: 'Coast', value: 'coast' }, { label: 'Safari', value: 'safari' }, { label: 'Mountain', value: 'mountain' }], admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'summary', type: 'textarea', required: true },
            { name: 'statement', type: 'text' },
            { name: 'emphasis', type: 'text' },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'body', type: 'richText' },
            { name: 'highlights', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
          ],
        },
        {
          label: 'Facts',
          fields: [
            { type: 'row', fields: [
              { name: 'county', type: 'text' },
              { name: 'distanceFromDiani', type: 'text', admin: { description: 'e.g. "approx. 160 km / 3 h by road"' } },
              { name: 'altitude', type: 'text' },
            ] },
            { type: 'row', fields: [
              { name: 'area', type: 'text', admin: { description: 'e.g. "13,747 km²"' } },
              { name: 'lat', type: 'number', admin: { step: 0.0001 } },
              { name: 'lng', type: 'number', admin: { step: 0.0001 } },
            ] },
            bestMonthsField,
            keyFactsField,
          ],
        },
        { label: 'Q&A', fields: [faqsField] },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    sampleField,
  ],
  hooks: { afterChange: [revalidateAfterChange((doc) => [`/destinations/${doc.slug}`, '/destinations'])] },
}
