import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ngina Trails & Safaris',
    short_name: 'Ngina',
    description: 'Safaris and coastal journeys from Diani Beach, Kenya',
    start_url: '/',
    display: 'standalone',
    background_color: '#efece5',
    theme_color: '#0e2b27',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
