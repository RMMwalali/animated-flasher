import type { Field, GlobalConfig } from 'payload'
import { anyone, editors } from '@/access'
import { bestMonthsField } from '@/fields'
import { revalidateGlobal } from '@/hooks/revalidateGlobal'

const chapter = (name: string, label: string) => ({
  name, type: 'group' as const, label,
  fields: [
    { name: 'eyebrow', type: 'text' as const },
    { name: 'statement', type: 'text' as const, required: true },
    { name: 'emphasis', type: 'text' as const },
    { name: 'body', type: 'textarea' as const },
    { name: 'image', type: 'upload' as const, relationTo: 'media' as const },
    { name: 'video', type: 'upload' as const, relationTo: 'media' as const },
    { name: 'points', type: 'array' as const, fields: [{ name: 'title', type: 'text' as const, required: true }, { name: 'text', type: 'text' as const }] },
    { name: 'linkLabel', type: 'text' as const },
    { name: 'linkHref', type: 'text' as const },
  ],
})

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home page',
  admin: { group: '04 Website' },
  access: { read: anyone, update: editors },
  versions: { drafts: true, max: 20 },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Opening',
          fields: [
            { name: 'heroEyebrow', type: 'text', defaultValue: 'Diani Beach, Kenya' },
            { name: 'heroStatement', type: 'text', required: true },
            { name: 'heroEmphasis', type: 'text' },
            { name: 'heroIntro', type: 'textarea' },
            { name: 'heroImage', type: 'upload', relationTo: 'media', admin: { description: 'Wide landscape photo, at least 2400px wide.' } },
            { name: 'heroVideo', type: 'upload', relationTo: 'media', admin: { description: 'Optional short muted loop (MP4, under 8 MB). Loads after the page.' } },
            { name: 'playIntro', type: 'checkbox', defaultValue: true, label: 'Play the elephant intro on first visit' },
          ],
        },
        {
          label: 'Story',
          fields: [
            { name: 'storyStatement', type: 'textarea', required: true },
            { name: 'storyEmphasis', type: 'text' },
            { name: 'storyBody', type: 'textarea' },
          ],
        },
        { label: 'Coast chapter', fields: [chapter('coast', 'Coast')] },
        { label: 'Safari chapter', fields: [chapter('safari', 'Safari')] },
        {
          label: 'When to go',
          fields: [
            { name: 'whenStatement', type: 'text' },
            {
              name: 'seasons', type: 'array',
              fields: [
                { type: 'row', fields: [
                  { name: 'label', type: 'text', required: true },
                  { name: 'kind', type: 'select', required: true, options: ['dry', 'rains', 'migration', 'marine'] },
                ] },
                { ...(bestMonthsField as object), name: 'months', required: true } as Field,
                { name: 'note', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Closing',
          fields: [
            { name: 'ctaStatement', type: 'text', required: true },
            { name: 'ctaEmphasis', type: 'text' },
            { name: 'ctaBody', type: 'textarea' },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateGlobal] },
}
