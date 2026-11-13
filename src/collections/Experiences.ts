import type { CollectionConfig } from 'payload'
import { contentAccessNoDrafts } from '@/access'
import { sampleField, slugField } from '@/fields'
import { revalidateAfterChange } from '@/hooks/revalidate'

export const Experiences: CollectionConfig = {
  slug: 'experiences',
  labels: { singular: 'Experience', plural: 'Experiences' },
  admin: { useAsTitle: 'title', group: '04 Website', defaultColumns: ['title', 'category', 'duration', 'priceFrom'] },
  access: contentAccessNoDrafts,
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'category', type: 'select', required: true, options: [
      { label: 'On the water', value: 'water' },
      { label: 'In the wild', value: 'wild' },
      { label: 'Culture & history', value: 'culture' },
      { label: 'On foot', value: 'foot' },
    ] },
    { name: 'summary', type: 'textarea', required: true },
    { type: 'row', fields: [
      { name: 'duration', type: 'text', admin: { description: 'e.g. "Full day"' } },
      { name: 'priceFrom', type: 'number', admin: { description: 'US$ per person' } },
      { name: 'location', type: 'relationship', relationTo: 'destinations' },
    ] },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'order', type: 'number', defaultValue: 100 },
    sampleField,
  ],
  hooks: { afterChange: [revalidateAfterChange(() => ['/experiences'])] },
}
