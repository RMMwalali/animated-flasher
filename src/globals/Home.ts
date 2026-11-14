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
          label: 'Welcome & stage',
          description: 'The first screen visitors see: a welcome with a sound choice, then a full-screen stage that cycles through these slides.',
          fields: [
            {
              name: 'welcome', type: 'group',
              fields: [
                { name: 'soundNote', type: 'text', defaultValue: 'Best with sound: the ocean and the bush', admin: { description: 'Short line above the enter button.' } },
                { type: 'row', fields: [
                  { name: 'enterLabel', type: 'text', defaultValue: 'Karibu', admin: { description: 'Enter button (with sound).' } },
                  { name: 'quietLabel', type: 'text', defaultValue: 'Enter without sound' },
                ] },
                { name: 'ambientAudio', type: 'upload', relationTo: 'media', admin: { description: 'Optional ambient sound (MP3, a gentle loop under 2 MB). Without it a soft generated surf sound plays.' } },
              ],
            },
            {
              name: 'stage', type: 'array', label: 'Stage slides', minRows: 1, maxRows: 6,
              admin: { description: 'Each slide shows one short statement over a photo or muted clip. 3 slides work best.', initCollapsed: true },
              fields: [
                { type: 'row', fields: [
                  { name: 'statement', type: 'text', required: true },
                  { name: 'emphasis', type: 'text', admin: { description: 'Word to underline.' } },
                ] },
                { type: 'row', fields: [
                  { name: 'image', type: 'upload', relationTo: 'media' },
                  { name: 'video', type: 'upload', relationTo: 'media', admin: { description: 'Optional muted clip (MP4).' } },
                  { name: 'scene', type: 'select', defaultValue: 'safari', admin: { description: 'Illustration used until a photo is added.' }, options: [
                    { label: 'Coast', value: 'coast' }, { label: 'Safari', value: 'safari' }, { label: 'Dawn', value: 'dawn' }, { label: 'Night', value: 'night' },
                  ] },
                ] },
              ],
            },
            { name: 'slideSeconds', type: 'number', defaultValue: 6, min: 3, max: 15 },
            { name: 'film', type: 'upload', relationTo: 'media', admin: { description: 'Optional full film (MP4) for the "Watch the film" button. Hidden when empty.' } },
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
          label: 'Featured journeys',
          description: 'The sideways-scrolling row of journeys. Tick "Featured" on a journey to show it here.',
          fields: [
            { name: 'journeysEyebrow', type: 'text', admin: { description: 'Small line above the title, e.g. "Featured journeys".' } },
            { name: 'journeysStatement', type: 'text', admin: { description: 'Section title.' } },
            { name: 'journeysEmphasis', type: 'text', admin: { description: 'Word in the title to underline.' } },
            { name: 'journeysIntro', type: 'textarea', admin: { description: 'One or two sentences under the title.' } },
          ],
        },
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
