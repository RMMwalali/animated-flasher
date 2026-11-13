/**
 * SAMPLE PHOTOS: free stock photography (Unsplash License: free for
 * commercial use, no attribution required; credited anyway). Self-hosted in
 * public/sample/ and uploaded to the media library by `pnpm seed`. Replace
 * with your own photos. Full list with sources: docs/PHOTO-CREDITS.md
 */
export type SamplePhoto = { url: string; alt: string; width: number; height: number; credit: string; source: string }

const u = (id: string) => `https://unsplash.com/photos/${id}`

export const photos = {
  dianiSunset: { url: '/sample/diani-sunset.webp', width: 2000, height: 1500, alt: 'Sunrise over the Indian Ocean from Diani Beach, with palm trees and a wooden fence on the sand', credit: 'Flo P / Unsplash', source: u('Z-yATRnA0es') },
  samburuElephants: { url: '/sample/samburu-elephants.webp', width: 2000, height: 1333, alt: 'A herd of red-brown elephants grazing among green trees in Samburu National Reserve', credit: 'Photos By Beks / Unsplash', source: u('B3fLaAAy6nU') },
  maraMigration: { url: '/sample/mara-migration.webp', width: 2000, height: 1369, alt: 'Wildebeest running across the dry plains of the Maasai Mara during the migration', credit: 'Harshil Gudka / Unsplash', source: u('aKcVSSDotgo') },
  maraSunset: { url: '/sample/mara-sunset-trees.webp', width: 2000, height: 1197, alt: 'Acacia trees and grazing antelope silhouetted against an orange sunset in the Maasai Mara', credit: 'Ahmed Galal / Unsplash', source: u('8fH4JwxbAyw') },
  maraGiraffeZebra: { url: '/sample/mara-giraffe-zebra.webp', width: 2000, height: 1458, alt: 'Giraffes and zebras walking together across the grass of the Maasai Mara', credit: 'Heather M. Edwards / Unsplash', source: u('taC5veAcyiA') },
  tsavoElephants: { url: '/sample/tsavo-elephants.webp', width: 2000, height: 2512, alt: 'Two elephants drinking at a waterhole near Tsavo National Park', credit: 'alexia ellesse / Unsplash', source: u('oV1LyrTtQXQ') },
  kilimanjaro: { url: '/sample/kilimanjaro.webp', width: 2000, height: 1338, alt: 'Snow-capped Mount Kilimanjaro rising above clouds and acacia trees, seen from Amboseli', credit: 'Sergey Pesterev / Unsplash', source: u('DWXR-nAbxCk') },
  maraLioness: { url: '/sample/mara-lioness.webp', width: 2000, height: 1333, alt: 'A lioness in profile against the golden grass of the Maasai Mara', credit: 'Anushka Srivastav / Unsplash', source: u('bTbshcmB3gQ') },
} satisfies Record<string, SamplePhoto>

export type PhotoKey = keyof typeof photos
