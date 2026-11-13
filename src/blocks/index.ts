import type { Block } from 'payload'
import { faqsField, keyFactsField } from '@/fields'

const tone = {
  name: 'tone',
  type: 'select' as const,
  defaultValue: 'cream',
  admin: { description: 'Section colour: Coast (teal), Safari (green), Night (deep), Cream.' },
  options: [
    { label: 'Cream', value: 'cream' },
    { label: 'Coast (light blue)', value: 'coast' },
    { label: 'Safari (green)', value: 'safari' },
    { label: 'Night (deep)', value: 'night' },
  ],
}

export const StatementBlock: Block = {
  slug: 'statement',
  labels: { singular: 'Big statement', plural: 'Big statements' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'text', type: 'textarea', required: true },
    { name: 'emphasis', type: 'text', admin: { description: 'One word or phrase from the statement to underline.' } },
    tone,
  ],
}

export const TextMediaBlock: Block = {
  slug: 'textMedia',
  labels: { singular: 'Text + photo', plural: 'Text + photo' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'imageSide', type: 'select', defaultValue: 'right', options: ['left', 'right'] },
    { name: 'link', type: 'group', fields: [{ name: 'label', type: 'text' }, { name: 'href', type: 'text' }] },
    tone,
  ],
}

export const FactsBlock: Block = {
  slug: 'facts',
  labels: { singular: 'Key facts table', plural: 'Key facts tables' },
  fields: [{ name: 'heading', type: 'text' }, keyFactsField, tone],
}

export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'Questions & answers', plural: 'Questions & answers' },
  fields: [{ name: 'heading', type: 'text', defaultValue: 'Good to know' }, faqsField],
}

export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'label', type: 'text', defaultValue: 'Plan your trip' },
    { name: 'href', type: 'text', defaultValue: '/plan-your-trip' },
    { name: 'ctaId', type: 'text', admin: { description: 'Tracking id shown on leads, e.g. "story-footer-cta".' } },
    tone,
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Text' },
  fields: [{ name: 'content', type: 'richText', required: true }],
}

export const CardsBlock: Block = {
  slug: 'cards',
  labels: { singular: 'Cards', plural: 'Cards' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'items', type: 'relationship', relationTo: ['trips', 'destinations', 'experiences'], hasMany: true },
    tone,
  ],
}

export const pageBlocks = [StatementBlock, TextMediaBlock, FactsBlock, FaqBlock, CtaBlock, RichTextBlock, CardsBlock]
