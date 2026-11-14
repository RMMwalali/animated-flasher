import type { CollectionConfig } from 'payload'
import { contentAccess } from '@/access'
import { faqsField, sampleField, seoFieldWith, slugField } from '@/fields'
import { revalidateAfterChange } from '@/hooks/revalidate'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Blog article', plural: 'Blog' },
  admin: { useAsTitle: 'title', group: '04 Website', defaultColumns: ['title', 'author', 'publishedAt', '_status'] },
  access: contentAccess,
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 30 },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'excerpt', type: 'textarea', required: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', required: true },
    faqsField,
    { name: 'author', type: 'relationship', relationTo: 'authors', required: true, admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } }, defaultValue: () => new Date().toISOString() },
    { name: 'topics', type: 'select', hasMany: true, admin: { position: 'sidebar' }, options: ['safari', 'coast', 'wildlife', 'planning', 'culture', 'marine'] },
    { name: 'related', type: 'relationship', relationTo: ['trips', 'destinations'], hasMany: true, admin: { position: 'sidebar' } },
    sampleField,
    seoFieldWith({ titleField: 'title', descriptionFields: ['excerpt'], basePath: '/blog/' }),
  ],
  hooks: { afterChange: [revalidateAfterChange((doc) => [`/blog/${doc.slug}`, '/blog'])] },
}
