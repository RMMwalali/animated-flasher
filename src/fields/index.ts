import type { Field, FieldHook } from 'payload'

export const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const
export const MONTH_LABELS: Record<(typeof MONTHS)[number], string> = {
  jan: 'January', feb: 'February', mar: 'March', apr: 'April', may: 'May', jun: 'June',
  jul: 'July', aug: 'August', sep: 'September', oct: 'October', nov: 'November', dec: 'December',
}

export const slugify = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const formatSlug =
  (from: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.length) return slugify(value)
    const src = data?.[from] ?? originalDoc?.[from]
    return typeof src === 'string' ? slugify(src) : value
  }

export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  required: true,
  admin: { position: 'sidebar', description: 'Web address part. Filled automatically from the title.' },
  hooks: { beforeValidate: [formatSlug(from)] },
})

export const sampleField: Field = {
  name: 'sample',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    position: 'sidebar',
    description: 'Sample content created by the setup script. Replace with your own and untick before launch.',
  },
}

/** "Search & sharing" with a live Google preview built from the page's own fields. */
export const seoFieldWith = (preview: { titleField: string; descriptionFields: string[]; basePath?: string; typePaths?: Record<string, string> }): Field => {
  const base = seoField as Extract<Field, { type: 'group' }>
  return {
    ...base,
    admin: { ...base.admin, description: 'Written automatically from this page. Fill in a field only to change what Google shows.' },
    fields: [
      { name: 'preview', type: 'ui', admin: { components: { Field: { path: '/components/admin/SearchPreview#SearchPreview', clientProps: preview } } } },
      ...base.fields,
    ],
  } as Field
}

export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'Search & sharing',
  admin: { description: 'How this page appears on Google and when shared. Leave blank to use the defaults.' },
  fields: [
    { name: 'title', type: 'text', maxLength: 70, label: 'Search title (optional)', admin: { description: 'Leave empty to use the page title. Up to ~60 characters.' } },
    { name: 'description', type: 'textarea', maxLength: 200, label: 'Search description (optional)', admin: { description: 'Leave empty to use the summary. Up to ~155 characters.' } },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Share image (optional)', admin: { description: 'Leave empty to use a generated image with the title (1200×630).' } },
    { name: 'noIndex', type: 'checkbox', defaultValue: false, label: 'Hide from search engines' },
  ],
}

export const faqsField: Field = {
  name: 'faqs',
  type: 'array',
  label: 'Questions & answers',
  admin: {
    description: 'Short, factual Q&A. Shown on the page and marked up for Google and AI search.',
    initCollapsed: true,
  },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'textarea', required: true },
  ],
}

export const keyFactsField: Field = {
  name: 'keyFacts',
  type: 'array',
  label: 'Key facts',
  admin: { description: 'Label / value rows, e.g. "Altitude" / "1,100 m".', initCollapsed: true },
  fields: [
    { type: 'row', fields: [
      { name: 'label', type: 'text', required: true },
      { name: 'value', type: 'text', required: true },
    ] },
  ],
}

export const bestMonthsField: Field = {
  name: 'bestMonths',
  type: 'select',
  hasMany: true,
  options: MONTHS.map((m) => ({ label: MONTH_LABELS[m], value: m })),
}

export const sourceGroup: Field = {
  name: 'source',
  type: 'group',
  label: 'Source',
  admin: { description: 'Where this came from. Captured automatically.' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'channel',
          type: 'select',
          options: [
            { label: 'Enquiry form', value: 'form' },
            { label: 'Plan your trip', value: 'plan' },
            { label: 'Live chat', value: 'chat' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Walk-in / referral', value: 'referral' },
            { label: 'Other', value: 'other' },
          ],
        },
        { name: 'ctaId', type: 'text', label: 'Button / CTA id' },
        { name: 'page', type: 'text', label: 'Page' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'utmSource', type: 'text', label: 'utm_source' },
        { name: 'utmMedium', type: 'text', label: 'utm_medium' },
        { name: 'utmCampaign', type: 'text', label: 'utm_campaign' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'utmTerm', type: 'text', label: 'utm_term' },
        { name: 'utmContent', type: 'text', label: 'utm_content' },
        { name: 'referrer', type: 'text' },
      ],
    },
    { name: 'landingPage', type: 'text' },
  ],
}
