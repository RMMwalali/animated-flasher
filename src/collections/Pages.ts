import type { CollectionConfig } from 'payload'
import { contentAccess } from '@/access'
import { pageBlocks } from '@/blocks'
import { sampleField, seoField, slugField } from '@/fields'
import { revalidateAfterChange } from '@/hooks/revalidate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    group: '04 Website',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description: 'Standard pages: Our story, Experiences, When to go, Privacy, Terms, Cookies and any new page you add.',
  },
  access: contentAccess,
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 30 },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'statement', type: 'text', admin: { description: 'Large headline. Defaults to the title.' } },
        { name: 'emphasis', type: 'text', admin: { description: 'Word in the headline to underline.' } },
        { name: 'intro', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'tone', type: 'select', defaultValue: 'night',
          options: [{ label: 'Night', value: 'night' }, { label: 'Coast', value: 'coast' }, { label: 'Safari', value: 'safari' }, { label: 'Cream', value: 'cream' }],
        },
      ],
    },
    { name: 'layout', type: 'blocks', blocks: pageBlocks },
    sampleField,
    seoField,
  ],
  hooks: { afterChange: [revalidateAfterChange((doc) => [`/${doc.slug}`])] },
}
