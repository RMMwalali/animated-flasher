import type { CollectionConfig } from 'payload'
import { contentAccessNoDrafts } from '@/access'
import { sampleField, slugField } from '@/fields'

export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: { singular: 'Guide / author', plural: 'Guides & authors' },
  admin: { useAsTitle: 'name', group: '04 Website', description: 'People who write journal articles and guides. Bios build trust with readers and search engines.' },
  access: contentAccessNoDrafts,
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'role', type: 'text', admin: { description: 'e.g. "Safari guide, 12 years in Tsavo"' } },
    { name: 'bio', type: 'textarea', required: true },
    { name: 'expertise', type: 'text', hasMany: true, admin: { description: 'Topics, e.g. birding, marine life, Swahili coast history.' } },
    { name: 'qualifications', type: 'text', hasMany: true, admin: { description: 'Real certifications only, e.g. KPSGA Silver guide.' } },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    sampleField,
  ],
}
