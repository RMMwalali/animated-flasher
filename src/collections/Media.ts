import type { CollectionConfig } from 'payload'
import { anyone, editors } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Photo / video', plural: 'Photos & videos' },
  admin: { group: '04 Website', description: 'Upload your own photos and videos. Always add a short description (alt text) for accessibility and Google.' },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  upload: {
    // local disk fallback (dev / VPS). With R2 configured, files go to the bucket instead.
    staticDir: process.env.MEDIA_DIR || 'media',
    mimeTypes: ['image/*', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'application/pdf'],
    focalPoint: true,
    crop: true,
    imageSizes: [
      { name: 'thumb', width: 480, height: 320, position: 'centre' },
      { name: 'card', width: 960, height: 1200, position: 'centre' },
      { name: 'wide', width: 1920, height: undefined, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'thumb',
  },
  fields: [
    { name: 'alt', type: 'text', required: true, label: 'Description (alt text)', admin: { description: 'Describe what is in the photo, e.g. "Elephants at a waterhole in Tsavo East at dusk".' } },
    { name: 'caption', type: 'text' },
    { name: 'credit', type: 'text', admin: { description: 'Photographer credit, if required.' } },
    { name: 'poster', type: 'upload', relationTo: 'media', admin: { description: 'Videos only: still image shown before the video loads.', condition: (d) => String(d?.mimeType ?? '').startsWith('video') } },
  ],
}
