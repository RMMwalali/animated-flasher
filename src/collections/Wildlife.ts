import type { CollectionConfig } from 'payload'
import { contentAccessNoDrafts } from '@/access'
import { bestMonthsField, sampleField, slugField } from '@/fields'
import { revalidateAfterChange } from '@/hooks/revalidate'

export const Wildlife: CollectionConfig = {
  slug: 'wildlife',
  labels: { singular: 'Animal', plural: 'Wildlife guide' },
  admin: { useAsTitle: 'name', group: '04 Website', defaultColumns: ['name', 'group', 'updatedAt'] },
  access: contentAccessNoDrafts,
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'swahiliName', type: 'text' },
    { name: 'scientificName', type: 'text' },
    { name: 'group', type: 'select', required: true, options: [
      { label: 'Big cats & predators', value: 'predators' },
      { label: 'Giants & grazers', value: 'grazers' },
      { label: 'Primates', value: 'primates' },
      { label: 'Birds', value: 'birds' },
      { label: 'Marine life', value: 'marine' },
    ] },
    { name: 'description', type: 'textarea', required: true },
    { name: 'whereToSee', type: 'relationship', relationTo: 'destinations', hasMany: true },
    { name: 'tip', type: 'text', admin: { description: 'A guide\'s tip for seeing it.' } },
    bestMonthsField,
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'order', type: 'number', defaultValue: 100 },
    sampleField,
  ],
  hooks: { afterChange: [revalidateAfterChange(() => ['/wildlife'])] },
}
