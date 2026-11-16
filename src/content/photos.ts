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
  shimbaSable: { url: '/sample/shimba-sable.webp', width: 2000, height: 1333, alt: 'A sable antelope with curved horns looking out from dense green bush', credit: 'Wolfgang Hasselmann / Unsplash', source: u('a-sable-antelope-peeking-through-dense-green-foliage-vPTwHRoqCKU') },
  wasiniDhow: { url: '/sample/wasini-dhow.webp', width: 2000, height: 1333, alt: 'A traditional dhow with a white lateen sail on turquoise water off the East African coast', credit: 'Aron Marinelli / Unsplash', source: u('a-sailboat-with-people-on-it-in-the-ocean-U8Z9TthY8r4') },
  mombasa: { url: '/sample/mombasa.webp', width: 2000, height: 1333, alt: 'A white building with arched windows and a red-roofed veranda in Mombasa', credit: 'Victor Birai / Unsplash', source: u('a-large-white-building-with-arched-windows-on-a-sunny-day-dHslYFmDE4A') },
  lamu: { url: '/sample/lamu.webp', width: 2000, height: 1264, alt: 'The Lamu Town waterfront: whitewashed Swahili buildings across the calm harbour', credit: 'Stanislav Lvovsky / Unsplash', source: u('a-body-of-water-with-a-bunch-of-houses-on-it-I2JrrXqxsu0') },
  watamu: { url: '/sample/watamu.webp', width: 2000, height: 1500, alt: 'A palm-fringed sandy bay with boats moored in blue water at Watamu', credit: 'Abdul Noor / Unsplash', source: u('a-sandy-beach-with-palm-trees-and-boats-in-the-water-5nzBUd3NleA') },
  mountKenya: { url: '/sample/mount-kenya.webp', width: 2000, height: 1333, alt: 'The jagged peaks of Mount Kenya above a snow-dusted rocky slope', credit: 'Bonface / Unsplash', source: u('snow-covered-mountains-at-daytime-pwit6HBpVZ0') },
  coastalForest: { url: '/sample/coastal-forest.webp', width: 2000, height: 1124, alt: 'Dense green indigenous forest canopy in Kenya', credit: 'Derricks Nature Book / Unsplash', source: u('a-forest-filled-with-lots-of-green-trees-vrBAxSrlcWo') },
  mzimaSprings: { url: '/sample/mzima-springs.webp', width: 2000, height: 1500, alt: 'Clear spring water rushing over rocks among green trees at Mzima Springs, Tsavo West', credit: 'Melissa van Niekerk / Unsplash', source: u('green-trees-beside-river-during-daytime-LORN3BgsAUg') },
  leopard: { url: '/sample/leopard.webp', width: 2000, height: 1500, alt: 'A leopard resting on a twisted branch in dry bush in Samburu', credit: 'Tucker Tangeman / Unsplash', source: u('leopard-on-brown-tree-branch-under-blue-sky-during-daytime-ZVZCmk0jLXg') },
  cheetah: { url: '/sample/cheetah.webp', width: 2000, height: 1600, alt: 'A cheetah walking through tall golden grass in the Maasai Mara', credit: 'sutirta budiman / Unsplash', source: u('cheetah-walking-on-brown-field-during-daytime-wTGi8NxVuR8') },
  grevysZebra: { url: '/sample/grevys-zebra.webp', width: 2000, height: 1600, alt: 'A Grevy’s zebra with narrow stripes and large rounded ears in Samburu', credit: 'sutirta budiman / Unsplash', source: u('zebra-standing-on-field-A2RUYt7YBEI') },
  reticulatedGiraffe: { url: '/sample/reticulated-giraffe.webp', width: 2000, height: 1343, alt: 'A young reticulated giraffe in a misty woodland clearing at dawn in Samburu', credit: 'Terry Granger / Unsplash', source: u('a-giraffe-standing-in-a-field-with-trees-in-the-background-icZkvTek6Dg') },
  blackRhino: { url: '/sample/black-rhino.webp', width: 2000, height: 1346, alt: 'A black rhino in profile with an oxpecker on its back, Lewa Wildlife Conservancy', credit: 'David Clode / Unsplash', source: u('black-rhino-GGuPS7sfbtY') },
  sableAntelope: { url: '/sample/sable-antelope.webp', width: 2000, height: 1333, alt: 'A dark sable antelope bull with sweeping curved horns in dry bush', credit: 'Chris Stenger / Unsplash', source: u('black-and-brown-animal-on-brown-grass-field-during-daytime-_7g_bqkihsc') },
  colobus: { url: '/sample/colobus.webp', width: 2000, height: 1333, alt: 'A black-and-white colobus monkey sitting in a leafy tree in Kenya', credit: 'Steve Enoch / Unsplash', source: u('a-monkey-is-sitting-in-a-tree-looking-up-5bT1GH3v8YM') },
  flamingos: { url: '/sample/nakuru-flamingos.webp', width: 2000, height: 1325, alt: 'A huge flock of pink lesser flamingos on the shore of Lake Nakuru', credit: 'Bibhash (Polygon.Cafe) Banerjee / Unsplash', source: u('flock-of-birds-flying-over-the-sea-during-daytime-3QPNiZ_Nqjs') },
  humpback: { url: '/sample/humpback.webp', width: 2000, height: 1330, alt: 'A humpback whale breaching with its long white flippers raised', credit: 'Todd Cravens / Unsplash', source: u('humpback-whale-breaching-blue-ocean-lwACYK8ScmA') },
  dolphins: { url: '/sample/dolphins.webp', width: 2000, height: 1330, alt: 'Two bottlenose dolphins swimming underwater over a seagrass bed', credit: 'NOAA / Unsplash', source: u('dolphin-in-body-of-water-NsvzdXtvyio') },
  greenTurtle: { url: '/sample/green-turtle.webp', width: 2000, height: 1500, alt: 'A green sea turtle gliding over a reef in turquoise water', credit: 'Sébastien Goldberg / Unsplash', source: u('a-sea-turtle-swimming-in-the-ocean-9R_bNdo4-2I') },
  sunsetDhow: { url: '/sample/sunset-dhow.webp', width: 2000, height: 1428, alt: 'A dhow with a lateen sail silhouetted against the sunset', credit: 'Mats Havia / Unsplash', source: u('a-sailboat-with-people-on-it-in-the-ocean-at-sunset-2B01B5jg2FE') },
  reef: { url: '/sample/reef.webp', width: 2000, height: 1333, alt: 'A diver swimming over a coral reef surrounded by small orange fish', credit: 'NEOM / Unsplash', source: u('a-person-swimming-over-a-coral-reef-with-lots-of-fish-xDQKvPjxtxo') },
  kitesurf: { url: '/sample/kitesurf.webp', width: 2000, height: 1333, alt: 'A kitesurfer carving across bright blue water', credit: 'julio andres rosario ortiz / Unsplash', source: u('a-man-riding-a-board-on-top-of-a-body-of-water-UzlGXyw3s5E') },
  balloon: { url: '/sample/balloon.webp', width: 2000, height: 1600, alt: 'A hot air balloon floating above zebras on the Maasai Mara', credit: 'sutirta budiman / Unsplash', source: u('red-and-yellow-hot-air-balloon-over-field-with-zebras-kjOBqwMUnWw') },
  seaCave: { url: '/sample/sea-cave.webp', width: 2000, height: 1333, alt: 'Turquoise water under the low rock ceiling of a limestone sea cave', credit: 'Lei Hwang / Unsplash', source: u('clear-turquoise-water-inside-a-rocky-cave-ZztrglasLjk') },
  coralRuins: { url: '/sample/coral-ruins.webp', width: 2000, height: 1333, alt: 'Weathered coral-stone pillars and roofless walls of old Swahili ruins', credit: 'Nichika Sakurai / Unsplash', source: u('the-ruins-of-an-old-church-in-the-middle-of-a-field-87LNz7bbYew') },
  waterfall: { url: '/sample/waterfall.webp', width: 2000, height: 1333, alt: 'A wide waterfall pouring over a rock ledge into a boulder-strewn river in Kenya', credit: 'Stanley G. Mathu / Unsplash', source: u('a-waterfall-with-rocks-and-trees-TGdJD8kjzmc') },
} satisfies Record<string, SamplePhoto>

export type PhotoKey = keyof typeof photos
