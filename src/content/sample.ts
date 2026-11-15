/**
 * SAMPLE CONTENT: realistic starter content for Ngina Trails and Safaris.
 * Everything is flagged `sample: true` in the CMS. Facts about places are
 * real (park areas, altitudes, UNESCO listings); prices, itineraries and
 * contact details are placeholders for the owner to replace.
 * No reviews, ratings, awards or memberships are invented.
 */
import { lexical } from './lexical'
import type { PhotoKey } from './photos'

type M = 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec'
const DRY: M[] = ['jan', 'feb', 'mar', 'jun', 'jul', 'aug', 'sep', 'oct']
const COAST_BEST: M[] = ['jan', 'feb', 'mar', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

export const sampleSettings = {
  businessName: 'Ngina Trails and Safaris',
  tagline: 'Safaris and coastal journeys from Diani Beach, Kenya',
  email: 'cngina35@gmail.com',
  phone: '+254 720 972 512',
  whatsapp: '+254 720 972 512',
  address: { street: '', locality: 'Diani Beach', region: 'Kwale County', postalCode: '', country: 'KE', lat: -4.3167, lng: 39.5833, googleMapsUrl: '', showMap: true },
  // No fixed office hours: guests from every time zone can enquire any time.
  hours: [] as { days: string[]; opens: string; closes: string }[],
  responseTime: '24 hours',
  whatsappButton: true,
  whatsappMessage: 'Jambo! I would like to ask about a trip.',
  bankAccounts: [] as { label: string; currency: string; bankName: string; branch?: string | null; accountName: string; accountNumber: string; swift?: string | null; bankCode?: string | null }[],
  mpesa: { paybill: '', till: '' },
  paymentNote: '',
  social: [] as { platform: string; url: string }[],
  trust: [
    {
      name: 'Tour operator licence', kind: 'licence', issuer: 'Tourism Regulatory Authority (TRA)', number: '', sample: true,
      url: 'https://www.tourismauthority.go.ke/',
      description: 'Kenya\'s tourism regulator licenses tour operators under the Tourism Act, 2011. Travelling with a licensed operator is a legal requirement for organised tours.',
    },
    {
      name: 'Association member', kind: 'membership', issuer: 'Kenya Association of Tour Operators (KATO)', number: '', sample: true,
      url: 'https://katokenya.org/',
      description: 'KATO members agree to the association\'s code of conduct, and the association offers a route for raising concerns about a member.',
    },
    {
      name: 'Single business permit', kind: 'licence', issuer: 'County Government of Kwale', number: '', sample: true,
      description: 'Our business permit for operating from Diani Beach, Kwale County.',
    },
    {
      name: 'Eco-rating and certified guides', kind: 'certification', issuer: 'Ecotourism Kenya / Kenya Professional Safari Guides Association (KPSGA)', number: '', sample: true,
      url: 'https://www.ecotourismkenya.org/',
      description: 'Independent recognition of responsible tourism practice and of our guides\' professional training.',
    },
  ],
  reviews: {
    delayDays: 2,
    reminderDays: 7,
    platforms: [
      { name: 'Google', url: '', enabled: true },
      { name: 'TripAdvisor', url: '', enabled: true },
      { name: 'SafariBookings', url: '', enabled: true },
    ],
  },
  notifications: { teamEmails: 'cngina35@gmail.com' },
  search: {
    siteName: '',
    alternateName: 'Ngina Safaris',
    defaultDescription: 'Diani Beach tour operator: safaris to Tsavo, Amboseli and the Maasai Mara, Kisite-Mpunguti dhow days, Lamu, Mombasa and Mount Kenya treks.',
    googleVerification: '',
    bingVerification: '',
    allowAiCrawlers: true,
    hideFromSearch: false,
  },
  defaultDepositPercent: 30,
  showSampleBanner: true,
}

export const sampleHome = {
  heroEyebrow: 'Diani Beach, Kenya',
  heroStatement: 'Wake to the Indian Ocean. Fall asleep to the wild.',
  heroEmphasis: 'wild',
  heroIntro: 'A Diani Beach team guiding coastal days and safaris beyond: Tsavo, Amboseli, the Mara and the reefs on our doorstep.',
  playIntro: true,
  welcome: { soundNote: 'Best with sound: the ocean and the bush', enterLabel: 'Karibu', quietLabel: 'Enter without sound' },
  stage: [
    { statement: 'Wake to the Indian Ocean.', emphasis: 'Ocean', scene: 'coast', photo: 'dianiSunset' as PhotoKey },
    { statement: 'Walk where the elephants run red.', emphasis: 'red', scene: 'safari', photo: 'samburuElephants' as PhotoKey },
    { statement: 'Follow the great migration.', emphasis: 'migration', scene: 'safari', photo: 'maraMigration' as PhotoKey },
    { statement: 'Sleep under an open sky.', emphasis: 'open', scene: 'night', photo: 'maraSunset' as PhotoKey },
  ],
  slideSeconds: 6,
  storyStatement: 'The coast is our home. The wild is our backyard.',
  storyEmphasis: 'home',
  storyBody:
    'We are based in Diani Beach on Kenya\'s south coast. Mornings start on white coral sand; three hours inland the red earth of Tsavo begins. We plan every journey from here, with drivers and guides we know by name.',
  coast: {
    eyebrow: 'By day · The coast',
    statement: 'Dhows, coral gardens and a town of carved doors.',
    emphasis: 'coral',
    body: 'From Diani the Swahili coast opens up: the marine park at Kisite-Mpunguti, the sacred Kaya forests, Mombasa\'s Old Town and, further north, Watamu and Lamu.',
    points: [
      { title: 'Kisite-Mpunguti Marine Park', text: 'Snorkelling and dolphins from a traditional dhow' },
      { title: 'Lamu Old Town', text: 'UNESCO World Heritage Site, still without cars' },
      { title: 'Fort Jesus, Mombasa', text: 'Portuguese fort built in the 1590s' },
      { title: 'Kaya Kinondo', text: 'Sacred Mijikenda forest, a short walk from Diani' },
    ],
    linkLabel: 'Coastal tours',
    linkHref: '/coastal-tours',
    photo: 'dianiSunset' as PhotoKey,
  },
  safari: {
    eyebrow: 'Beyond · The wild',
    statement: 'Red elephants, golden plains and Kilimanjaro at dawn.',
    emphasis: 'dawn',
    body: 'Tsavo East is about three hours from Diani by road. Beyond it lie Tsavo West, Amboseli and, by light aircraft, the Maasai Mara.',
    points: [
      { title: 'Tsavo East', text: 'Elephants dusted red by the soil' },
      { title: 'Amboseli', text: 'Elephant herds beneath Kilimanjaro' },
      { title: 'Maasai Mara', text: 'The Great Migration, July to October' },
      { title: 'Shimba Hills', text: 'Kenya\'s only sable antelope, 45 minutes away' },
    ],
    linkLabel: 'Safaris',
    linkHref: '/safaris',
    photo: 'maraGiraffeZebra' as PhotoKey,
  },
  journeysEyebrow: 'Featured journeys',
  journeysStatement: 'Our favourite journeys from Diani.',
  journeysEmphasis: 'favourite',
  journeysIntro: 'The safaris and coastal days we plan most often. Every one starts at your hotel on the south coast.',
  tiktokTitle: 'Fresh from the field',
  tiktokVideos: [] as { url: string }[],
  whenStatement: 'Kenya is a year-round country. Here is how the seasons fall.',
  seasons: [
    { label: 'Dry season', kind: 'dry', months: ['jan', 'feb', 'mar'], note: 'Hot, clear, excellent game viewing' },
    { label: 'Long rains', kind: 'rains', months: ['apr', 'may'], note: 'Green, quiet, lower prices' },
    { label: 'Dry season', kind: 'dry', months: ['jun', 'jul', 'aug', 'sep', 'oct'], note: 'Peak safari season' },
    { label: 'Short rains', kind: 'rains', months: ['nov'], note: 'Brief afternoon showers' },
    { label: 'Great Migration (Mara)', kind: 'migration', months: ['jul', 'aug', 'sep', 'oct'], note: 'River crossings, timing varies' },
    { label: 'Humpback whales (south coast)', kind: 'marine', months: ['jul', 'aug', 'sep', 'oct'], note: 'Seen from boats off Kisite' },
  ],
  ctaStatement: 'Tell us where your journey begins.',
  ctaEmphasis: 'begins',
  ctaBody: 'Share your dates and what you would love to see. We reply personally, with a plan and a clear price.',
}

const faq = (question: string, answer: string) => ({ question, answer })

export const sampleDestinations = [
  {
    name: 'Diani Beach', slug: 'diani', photo: 'dianiSunset' as PhotoKey, region: 'coast', order: 1,
    summary: 'Our home: a long white-sand beach on Kenya\'s south coast, fringed by coral reef and coastal forest.',
    statement: 'Our home on the south coast.', emphasis: 'home',
    county: 'Kwale County', distanceFromDiani: 'You are here', altitude: 'Sea level', area: '', lat: -4.3167, lng: 39.5833,
    bestMonths: COAST_BEST,
    keyFacts: [
      { label: 'Distance from Mombasa', value: 'About 35 km south, via the Likoni ferry' },
      { label: 'Nearest airstrip', value: 'Ukunda (Diani) airstrip' },
      { label: 'Primates', value: 'Angolan black-and-white colobus' },
    ],
    highlights: [{ text: 'Reef-protected lagoon for swimming' }, { text: 'Colobus monkeys in the coastal forest' }, { text: 'Kaya Kinondo sacred forest' }],
    faqs: [
      faq('Is Diani a good base for safaris?', 'Yes. Tsavo East is about three hours by road, Shimba Hills about 45 minutes, and light aircraft fly from Ukunda airstrip.'),
      faq('When is the sea calmest in Diani?', 'Generally from about November to March, during the north-east monsoon (kaskazi). The south-east monsoon (kusi), roughly June to September, brings stronger wind, popular with kitesurfers.'),
    ],
  },
  {
    name: 'Wasini Island & Kisite-Mpunguti', slug: 'wasini-kisite', region: 'coast', order: 2,
    summary: 'A protected marine park of coral islands near Shimoni, reached by dhow, with dolphins and some of Kenya\'s best snorkelling.',
    statement: 'Dolphins, dhows and coral gardens.', emphasis: 'coral',
    county: 'Kwale County', distanceFromDiani: 'About 60 km south / 1 h 15 min to Shimoni', altitude: 'Sea level', area: '', lat: -4.6600, lng: 39.3800,
    bestMonths: ['jan', 'feb', 'mar', 'oct', 'nov', 'dec'],
    keyFacts: [
      { label: 'Protected area', value: 'Kisite-Mpunguti Marine National Park and Reserve' },
      { label: 'Gazetted', value: '1978' },
      { label: 'Departure point', value: 'Shimoni jetty' },
      { label: 'Humpback whales', value: 'Usually July to October' },
    ],
    highlights: [{ text: 'Snorkel the coral gardens' }, { text: 'Indo-Pacific bottlenose dolphins' }, { text: 'Swahili lunch on Wasini Island' }],
    faqs: [faq('Can non-swimmers join the Kisite dhow trip?', 'Yes. Life jackets are provided and you can snorkel close to the boat or simply watch from the deck.')],
  },
  {
    name: 'Shimba Hills', slug: 'shimba-hills', region: 'safari', order: 3,
    summary: 'A forested coastal plateau above Diani, home to the only population of sable antelope in Kenya, with waterfalls and forest walks.',
    statement: 'Forest, falls and the rare sable antelope.', emphasis: 'rare',
    county: 'Kwale County', distanceFromDiani: 'About 30 km / 45 min', altitude: 'About 120 to 450 m', area: '', lat: -4.2333, lng: 39.4167,
    bestMonths: DRY,
    keyFacts: [
      { label: 'Protected area', value: 'Shimba Hills National Reserve' },
      { label: 'Signature species', value: 'Sable antelope (only Kenyan population)' },
      { label: 'Walk', value: 'Sheldrick Falls trail, with a ranger' },
    ],
    highlights: [{ text: 'Sheldrick Falls walk' }, { text: 'Elephants in coastal forest' }, { text: 'Half-day or full-day from Diani' }],
    faqs: [faq('Can I visit Shimba Hills in a morning?', 'Yes. It is close enough for a half-day game drive and walk, returning to Diani for lunch.')],
  },
  {
    name: 'Tsavo East', slug: 'tsavo-east', photo: 'tsavoElephants' as PhotoKey, region: 'safari', order: 4,
    summary: 'One of Kenya\'s largest national parks, known for elephants coloured red by the soil, the Galana River and Lugard Falls.',
    statement: 'Where the elephants turn red.', emphasis: 'red',
    county: 'Taita-Taveta', distanceFromDiani: 'About 160 km / 3 h to Buchuma gate', altitude: 'About 150 to 1,000 m', area: '13,747 km²', lat: -2.9833, lng: 38.5000,
    bestMonths: DRY,
    keyFacts: [
      { label: 'Area', value: '13,747 km²' },
      { label: 'Landmarks', value: 'Galana River, Lugard Falls, Mudanda Rock, Aruba Dam' },
      { label: 'Famous for', value: 'Red-dusted elephants' },
    ],
    highlights: [{ text: 'Elephant herds at Mudanda Rock' }, { text: 'Lugard Falls on the Galana' }, { text: 'Easy reach from the coast' }],
    faqs: [
      faq('How far is Tsavo East from Diani?', 'About 160 km to Buchuma gate, roughly three hours by road depending on traffic through Mombasa.'),
      faq('Why are the elephants in Tsavo red?', 'They dust-bathe in the park\'s red lateritic soil, which coats their skin.'),
    ],
  },
  {
    name: 'Tsavo West', slug: 'tsavo-west', region: 'safari', order: 5,
    summary: 'Volcanic hills, lava flows and the clear pools of Mzima Springs, where hippos can be watched from an underwater hide.',
    statement: 'Lava fields and crystal springs.', emphasis: 'springs',
    county: 'Taita-Taveta', distanceFromDiani: 'About 250 km / 5 h', altitude: 'About 230 to 1,800 m', area: '9,065 km²', lat: -3.0000, lng: 38.1000,
    bestMonths: DRY,
    keyFacts: [
      { label: 'Area', value: '9,065 km²' },
      { label: 'Landmarks', value: 'Mzima Springs, Shetani lava flow, Chaimu crater' },
      { label: 'Rhino', value: 'Ngulia Rhino Sanctuary' },
    ],
    highlights: [{ text: 'Underwater hippo hide at Mzima' }, { text: 'Shetani lava flow' }, { text: 'Combine with Amboseli' }],
    faqs: [faq('Is Tsavo West different from Tsavo East?', 'Yes. Tsavo West is hillier and more volcanic, with springs and lava flows; Tsavo East is flatter and more open.')],
  },
  {
    name: 'Amboseli', slug: 'amboseli', photo: 'kilimanjaro' as PhotoKey, region: 'safari', order: 6,
    summary: 'A compact park of swamps and dry lakebed at the foot of Kilimanjaro, famous for large elephant herds.',
    statement: 'Elephants beneath Kilimanjaro.', emphasis: 'Kilimanjaro',
    county: 'Kajiado County', distanceFromDiani: 'About 440 km / 7 to 8 h, usually via Tsavo West', altitude: 'About 1,150 m', area: '392 km²', lat: -2.6500, lng: 37.2500,
    bestMonths: DRY,
    keyFacts: [
      { label: 'Area', value: '392 km²' },
      { label: 'View', value: 'Mount Kilimanjaro (5,895 m, in Tanzania)' },
      { label: 'Best light', value: 'Early morning, before cloud covers the mountain' },
    ],
    highlights: [{ text: 'Kilimanjaro at sunrise' }, { text: 'Elephants in the swamps' }, { text: 'Observation Hill' }],
    faqs: [faq('Will I see Kilimanjaro from Amboseli?', 'Often, especially at dawn and dusk. The mountain is frequently hidden by cloud during the middle of the day.')],
  },
  {
    name: 'Maasai Mara', slug: 'maasai-mara', photo: 'maraMigration' as PhotoKey, region: 'safari', order: 7,
    summary: 'Kenya\'s best-known reserve: open grassland, big cats and, from about July to October, the Great Migration.',
    statement: 'The plains of the Great Migration.', emphasis: 'Migration',
    county: 'Narok County', distanceFromDiani: 'By light aircraft from Ukunda (Diani) airstrip, usually via Nairobi', altitude: 'About 1,500 to 2,100 m', area: '1,510 km²', lat: -1.4833, lng: 35.1500,
    bestMonths: ['jul', 'aug', 'sep', 'oct', 'jan', 'feb'],
    keyFacts: [
      { label: 'Reserve area', value: '1,510 km² (plus surrounding conservancies)' },
      { label: 'Migration', value: 'Usually July to October; timing varies each year' },
      { label: 'Getting there', value: 'Fly-in recommended from the coast' },
    ],
    highlights: [{ text: 'Mara River crossings' }, { text: 'Lion, leopard and cheetah' }, { text: 'Hot-air balloon at sunrise' }],
    faqs: [faq('When is the Great Migration in the Maasai Mara?', 'Usually from about July to October, but it depends on the rains, so exact crossing dates cannot be guaranteed.')],
  },
  {
    name: 'Samburu', slug: 'samburu', photo: 'samburuElephants' as PhotoKey, region: 'safari', order: 8,
    summary: 'Semi-arid reserve along the Ewaso Ng\'iro River, home to the "Samburu special five" found mostly north of the equator.',
    statement: 'The special five of the north.', emphasis: 'five',
    county: 'Samburu County', distanceFromDiani: 'Fly via Nairobi', altitude: 'About 800 to 1,200 m', area: '165 km²', lat: 0.6167, lng: 37.5333,
    bestMonths: DRY,
    keyFacts: [
      { label: 'Reserve area', value: '165 km²' },
      { label: 'Special five', value: 'Grevy\'s zebra, reticulated giraffe, Somali ostrich, beisa oryx, gerenuk' },
      { label: 'River', value: 'Ewaso Ng\'iro' },
    ],
    highlights: [{ text: 'Reticulated giraffe' }, { text: 'Elephants at the river' }, { text: 'Samburu culture' }],
    faqs: [faq('What are the Samburu special five?', 'Grevy\'s zebra, reticulated giraffe, Somali ostrich, beisa oryx and gerenuk.')],
  },
  {
    name: 'Lake Nakuru', slug: 'lake-nakuru', region: 'safari', order: 9,
    summary: 'A Rift Valley soda lake and fenced national park, important for black and white rhino, with flamingos at times.',
    statement: 'Rhinos on the Rift Valley floor.', emphasis: 'Rhinos',
    county: 'Nakuru County', distanceFromDiani: 'Fly via Nairobi, then about 3 h by road', altitude: 'About 1,750 m', area: '188 km²', lat: -0.3667, lng: 36.0833,
    bestMonths: DRY,
    keyFacts: [
      { label: 'Area', value: '188 km²' },
      { label: 'Rhino', value: 'Black and southern white rhino' },
      { label: 'Flamingos', value: 'Numbers vary with lake levels' },
    ],
    highlights: [{ text: 'Rhino sightings' }, { text: 'Baboon Cliff viewpoint' }, { text: 'Rothschild\'s giraffe' }],
    faqs: [faq('Are there still flamingos at Lake Nakuru?', 'Sometimes. Since lake levels rose from around 2013 numbers have varied; nearby Lake Bogoria often has more.')],
  },
  {
    name: 'Mount Kenya', slug: 'mount-kenya', region: 'mountain', order: 10,
    summary: 'Africa\'s second-highest mountain. Trekkers reach Point Lenana (4,985 m); the higher peaks need technical climbing.',
    statement: 'A walk to the roof of Kenya.', emphasis: 'roof',
    county: 'Meru, Nyeri, Kirinyaga, Embu, Tharaka-Nithi', distanceFromDiani: 'Fly to Nairobi, then 3 to 4 h by road', altitude: 'Point Lenana 4,985 m; Batian 5,199 m', area: '', lat: -0.1500, lng: 37.3000,
    bestMonths: ['jan', 'feb', 'aug', 'sep'],
    keyFacts: [
      { label: 'Trekking summit', value: 'Point Lenana, 4,985 m' },
      { label: 'Highest peak', value: 'Batian, 5,199 m (technical)' },
      { label: 'UNESCO', value: 'World Heritage Site since 1997' },
      { label: 'Popular routes', value: 'Sirimon, Chogoria, Naro Moru' },
    ],
    highlights: [{ text: 'Glacial tarns and giant lobelias' }, { text: 'Sunrise from Point Lenana' }, { text: 'Chogoria gorge descent' }],
    faqs: [faq('Do I need climbing experience for Point Lenana?', 'No technical skills are needed, but you should be fit and allow time to acclimatise to the altitude.')],
  },
  {
    name: 'Watamu', slug: 'watamu', region: 'coast', order: 11,
    summary: 'A quiet coastal village north of Mombasa with a marine national park, Mida Creek and the Gede ruins nearby.',
    statement: 'Turtles, tides and a lost Swahili town.', emphasis: 'lost',
    county: 'Kilifi County', distanceFromDiani: 'About 150 km north / 3 to 4 h', altitude: 'Sea level', area: '', lat: -3.3500, lng: 40.0167,
    bestMonths: COAST_BEST,
    keyFacts: [
      { label: 'Marine park', value: 'Watamu Marine National Park' },
      { label: 'Nearby', value: 'Gede Ruins, Mida Creek, Arabuko-Sokoke Forest' },
    ],
    highlights: [{ text: 'Snorkelling in the marine park' }, { text: 'Gede Ruins' }, { text: 'Sunset at Mida Creek' }],
    faqs: [faq('Can I combine Watamu and Malindi?', 'Yes. Malindi is about 25 km north of Watamu, so the two combine easily in one or two days.')],
  },
  {
    name: 'Lamu', slug: 'lamu', region: 'coast', order: 12,
    summary: 'Lamu Old Town is the oldest and best-preserved Swahili settlement in East Africa, a UNESCO World Heritage Site where donkeys and dhows replace cars.',
    statement: 'A town of carved doors and dhows.', emphasis: 'dhows',
    county: 'Lamu County', distanceFromDiani: 'Fly to Manda airstrip, then boat', altitude: 'Sea level', area: '', lat: -2.2717, lng: 40.9020,
    bestMonths: COAST_BEST,
    keyFacts: [
      { label: 'UNESCO', value: 'Lamu Old Town, inscribed 2001' },
      { label: 'Getting around', value: 'On foot, by donkey or by boat' },
      { label: 'Airstrip', value: 'Manda Island' },
    ],
    highlights: [{ text: 'Sunset dhow sail' }, { text: 'Lamu Fort and museum' }, { text: 'Shela beach' }],
    faqs: [faq('Are there cars on Lamu?', 'Almost none. People walk, ride donkeys or travel by boat, which is a large part of the island\'s character.')],
  },
  {
    name: 'Mombasa', slug: 'mombasa', region: 'coast', order: 13,
    summary: 'Kenya\'s historic port city: Fort Jesus, the narrow lanes of Old Town and centuries of Swahili, Arab, Portuguese and Indian influence.',
    statement: 'Old Town lanes and a Portuguese fort.', emphasis: 'Old Town',
    county: 'Mombasa County', distanceFromDiani: 'About 35 km / 1 to 1.5 h via the Likoni ferry', altitude: 'Sea level', area: '', lat: -4.0435, lng: 39.6682,
    bestMonths: COAST_BEST,
    keyFacts: [
      { label: 'UNESCO', value: 'Fort Jesus, inscribed 2011' },
      { label: 'Fort built', value: '1593 to 1596, by the Portuguese' },
    ],
    highlights: [{ text: 'Fort Jesus' }, { text: 'Old Town walking tour' }, { text: 'Spice market' }],
    faqs: [faq('How long do I need in Mombasa Old Town?', 'Half a day covers Fort Jesus and a guided walk; a full day leaves time for the markets and lunch.')],
  },
] as const

type TripSeed = {
  photo?: PhotoKey
  title: string; slug: string; type: 'safari' | 'coastal' | 'walking'; featured?: boolean; order: number
  summary: string; statement: string; emphasis: string; days: number; nights: number; priceFrom: number; priceBasis?: string
  difficulty?: 'easy' | 'moderate' | 'challenging'; groupSizeMax?: number; bestMonths: M[]; destinations: string[]
  highlights: string[]; itinerary: { title: string; description: string; overnight?: string; meals?: ('B' | 'L' | 'D')[]; drive?: string }[]
  inclusions: string[]; exclusions: string[]; faqs: { question: string; answer: string }[]
}

const SAFARI_INC = ['Private 4×4 safari vehicle with pop-up roof', 'Professional driver-guide', 'Park entry fees as per itinerary', 'Accommodation and meals as listed', 'Bottled water on game drives', 'Pick-up and drop-off in Diani']
const SAFARI_EXC = ['International flights and visas (eTA)', 'Travel insurance', 'Drinks at lodges', 'Tips for guides and staff']

export const sampleTrips: TripSeed[] = [
  {
    title: 'Tsavo East & Taita Hills', photo: 'tsavoElephants', slug: 'tsavo-east-taita-hills', type: 'safari', featured: true, order: 1,
    summary: 'Our most popular safari from the coast: red elephants of Tsavo East and a night in the Taita Hills.',
    statement: 'Three days, two parks, one red-earth horizon.', emphasis: 'red-earth',
    days: 3, nights: 2, priceFrom: 780, priceBasis: 'per person sharing, sample price', difficulty: 'easy', groupSizeMax: 6,
    bestMonths: DRY, destinations: ['tsavo-east', 'diani'],
    highlights: ['Game drives in Tsavo East', 'Mudanda Rock and Lugard Falls', 'Taita Hills Wildlife Sanctuary', 'Return to the beach in time for sunset'],
    itinerary: [
      { title: 'Diani to Tsavo East', description: 'Early pick-up, drive inland via Mombasa and enter Tsavo East at Buchuma gate. Afternoon game drive.', overnight: 'Lodge in Tsavo East', meals: ['L', 'D'], drive: 'About 3 h' },
      { title: 'Tsavo East to Taita Hills', description: 'Morning game drive past Mudanda Rock, then on to the Taita Hills Wildlife Sanctuary for an afternoon drive.', overnight: 'Lodge in Taita Hills', meals: ['B', 'L', 'D'] },
      { title: 'Taita Hills to Diani', description: 'Sunrise drive, breakfast and return to the coast.', meals: ['B'], drive: 'About 3.5 h' },
    ],
    inclusions: SAFARI_INC, exclusions: SAFARI_EXC,
    faqs: [faq('Is three days enough for Tsavo?', 'Three days gives two full game-drive sessions in Tsavo East plus the Taita Hills. Add a night for a slower pace.')],
  },
  {
    title: 'Amboseli & Tsavo West', photo: 'kilimanjaro', slug: 'amboseli-tsavo-west', type: 'safari', featured: true, order: 2,
    summary: 'Volcanic Tsavo West and the elephants of Amboseli beneath Kilimanjaro, by road from Diani.',
    statement: 'From lava fields to the foot of Kilimanjaro.', emphasis: 'Kilimanjaro',
    days: 5, nights: 4, priceFrom: 1650, priceBasis: 'per person sharing, sample price', difficulty: 'easy', groupSizeMax: 6,
    bestMonths: DRY, destinations: ['tsavo-west', 'amboseli'],
    highlights: ['Mzima Springs underwater hide', 'Shetani lava flow', 'Two days in Amboseli', 'Dawn views of Kilimanjaro'],
    itinerary: [
      { title: 'Diani to Tsavo West', description: 'Drive inland to Tsavo West. Afternoon at Mzima Springs.', overnight: 'Lodge in Tsavo West', meals: ['L', 'D'], drive: 'About 5 h' },
      { title: 'Tsavo West', description: 'Full day: Shetani lava flow, Chaimu crater and the Ngulia hills.', overnight: 'Lodge in Tsavo West', meals: ['B', 'L', 'D'] },
      { title: 'Tsavo West to Amboseli', description: 'Drive to Amboseli for an afternoon among the swamps.', overnight: 'Lodge or camp in Amboseli', meals: ['B', 'L', 'D'], drive: 'About 4 h' },
      { title: 'Amboseli', description: 'Sunrise for the clearest views of Kilimanjaro; Observation Hill.', overnight: 'Lodge or camp in Amboseli', meals: ['B', 'L', 'D'] },
      { title: 'Amboseli to Diani', description: 'Morning drive, then the long road home to the coast.', meals: ['B', 'L'], drive: 'About 7 h' },
    ],
    inclusions: SAFARI_INC, exclusions: SAFARI_EXC,
    faqs: [faq('Can we fly back instead of driving?', 'Yes. We can arrange a light-aircraft flight from Amboseli to Ukunda via Nairobi to save the long drive.')],
  },
  {
    title: 'Maasai Mara fly-in from Diani', photo: 'maraMigration', slug: 'maasai-mara-fly-in', type: 'safari', featured: true, order: 3,
    summary: 'Fly from the beach to the plains for three nights in the Mara, timed for the migration if you wish.',
    statement: 'Beach in the morning. Lions by the afternoon.', emphasis: 'Lions',
    days: 4, nights: 3, priceFrom: 2450, priceBasis: 'per person sharing, sample price, flights included', difficulty: 'easy', groupSizeMax: 6,
    bestMonths: ['jul', 'aug', 'sep', 'oct', 'jan', 'feb'], destinations: ['maasai-mara'],
    highlights: ['Light-aircraft flights from Ukunda', 'Game drives with Mara guides', 'Optional hot-air balloon', 'Mara River in season'],
    itinerary: [
      { title: 'Fly to the Mara', description: 'Morning flight from Ukunda airstrip, usually via Nairobi. Afternoon game drive.', overnight: 'Camp in the Maasai Mara', meals: ['L', 'D'] },
      { title: 'Maasai Mara', description: 'Full day of game drives with a picnic lunch.', overnight: 'Camp in the Maasai Mara', meals: ['B', 'L', 'D'] },
      { title: 'Maasai Mara', description: 'Optional sunrise balloon flight, then another day on the plains.', overnight: 'Camp in the Maasai Mara', meals: ['B', 'L', 'D'] },
      { title: 'Fly back to Diani', description: 'Morning drive en route to the airstrip and flight back to the coast.', meals: ['B'] },
    ],
    inclusions: ['Return light-aircraft flights', ...SAFARI_INC.slice(1)], exclusions: [...SAFARI_EXC, 'Hot-air balloon (optional)'],
    faqs: [faq('Is the migration guaranteed?', 'No. It usually reaches the Mara from about July to October, but its timing depends on the rains.')],
  },
  {
    title: 'Samburu & Lake Nakuru', photo: 'samburuElephants', slug: 'samburu-lake-nakuru', type: 'safari', order: 4,
    summary: 'The arid north and the Rift Valley: Samburu\'s special five and the rhinos of Lake Nakuru.',
    statement: 'North of the equator, into the Rift.', emphasis: 'Rift',
    days: 6, nights: 5, priceFrom: 2300, priceBasis: 'per person sharing, sample price', difficulty: 'easy', groupSizeMax: 6,
    bestMonths: DRY, destinations: ['samburu', 'lake-nakuru'],
    highlights: ['Samburu special five', 'Crossing the equator', 'Rhinos at Lake Nakuru', 'Baboon Cliff viewpoint'],
    itinerary: [
      { title: 'Fly to Nairobi, drive north', description: 'Morning flight from the coast, then drive north to Samburu.', overnight: 'Lodge in Samburu', meals: ['L', 'D'] },
      { title: 'Samburu', description: 'Game drives along the Ewaso Ng\'iro River.', overnight: 'Lodge in Samburu', meals: ['B', 'L', 'D'] },
      { title: 'Samburu', description: 'A second day for elephants, gerenuk and reticulated giraffe.', overnight: 'Lodge in Samburu', meals: ['B', 'L', 'D'] },
      { title: 'Samburu to Lake Nakuru', description: 'Cross the equator and descend into the Rift Valley.', overnight: 'Lodge at Lake Nakuru', meals: ['B', 'L', 'D'] },
      { title: 'Lake Nakuru', description: 'Rhino tracking by vehicle and Baboon Cliff.', overnight: 'Lodge at Lake Nakuru', meals: ['B', 'L', 'D'] },
      { title: 'Return to the coast', description: 'Drive to Nairobi for the flight back to Ukunda.', meals: ['B'] },
    ],
    inclusions: ['Domestic flights coast to Nairobi and back', ...SAFARI_INC.slice(1)], exclusions: SAFARI_EXC,
    faqs: [faq('Is this trip good for a second safari?', 'Yes. It shows a very different Kenya from Tsavo and the Mara, with species you will not see in the south.')],
  },
  {
    title: 'Shimba Hills morning safari', slug: 'shimba-hills-morning', type: 'safari', order: 5,
    summary: 'A half-day in the forested hills above Diani: sable antelope, elephants and the walk to Sheldrick Falls.',
    statement: 'A safari before lunch.', emphasis: 'lunch',
    days: 1, nights: 0, priceFrom: 140, priceBasis: 'per person, sample price', difficulty: 'easy', groupSizeMax: 6,
    bestMonths: DRY, destinations: ['shimba-hills'],
    highlights: ['Sable antelope', 'Ranger-led walk to Sheldrick Falls', 'Back in Diani by early afternoon'],
    itinerary: [{ title: 'Shimba Hills', description: 'Early pick-up, game drive, guided walk to the falls and return to Diani.', meals: ['B'] }],
    inclusions: ['Private vehicle and driver-guide', 'Park fees', 'Ranger for the falls walk', 'Breakfast picnic'], exclusions: ['Tips'],
    faqs: [faq('How fit do I need to be for the falls walk?', 'Moderately. The path to Sheldrick Falls is steep in places and takes about two hours there and back.')],
  },
  {
    title: 'Wasini & Kisite dhow day', slug: 'wasini-kisite-dhow', type: 'coastal', featured: true, order: 6,
    summary: 'A full day on a traditional dhow: snorkelling in Kisite-Mpunguti Marine Park, dolphins and a Swahili seafood lunch on Wasini.',
    statement: 'A day on the water, the Swahili way.', emphasis: 'water',
    days: 1, nights: 0, priceFrom: 120, priceBasis: 'per person, sample price', difficulty: 'easy', groupSizeMax: 12,
    bestMonths: ['jan', 'feb', 'mar', 'oct', 'nov', 'dec'], destinations: ['wasini-kisite'],
    highlights: ['Snorkelling on the coral gardens', 'Dolphin spotting', 'Seafood lunch on Wasini', 'Shimoni caves (optional)'],
    itinerary: [{ title: 'Diani to Shimoni and the marine park', description: 'Drive south to Shimoni, sail by dhow into the marine park to snorkel, lunch on Wasini Island and return in the afternoon.', meals: ['L'], drive: 'About 1 h 15 min each way' }],
    inclusions: ['Return transfers from Diani', 'Dhow and crew', 'Snorkelling gear', 'Marine park fees', 'Seafood lunch'], exclusions: ['Drinks', 'Tips'],
    faqs: [faq('Will we see dolphins?', 'Often, but they are wild animals, so sightings cannot be guaranteed.')],
  },
  {
    title: 'Mombasa Old Town & Fort Jesus', slug: 'mombasa-old-town', type: 'coastal', order: 7,
    summary: 'A guided day in Kenya\'s historic port: Fort Jesus, the Old Town lanes and the spice market.',
    statement: 'Five centuries in a single walk.', emphasis: 'centuries',
    days: 1, nights: 0, priceFrom: 95, priceBasis: 'per person, sample price', difficulty: 'easy', groupSizeMax: 10,
    bestMonths: COAST_BEST, destinations: ['mombasa'],
    highlights: ['Fort Jesus (UNESCO)', 'Old Town walking tour', 'Spice market and Swahili lunch'],
    itinerary: [{ title: 'Mombasa', description: 'Cross on the Likoni ferry, tour Fort Jesus, walk the Old Town and lunch before returning to Diani.', meals: ['L'] }],
    inclusions: ['Transfers', 'Local guide', 'Fort Jesus entry', 'Lunch'], exclusions: ['Drinks', 'Tips', 'Shopping'],
    faqs: [faq('What should I wear in Old Town?', 'Light clothes that cover shoulders and knees are respectful in the Old Town and its mosques.')],
  },
  {
    title: 'Lamu Old Town escape', slug: 'lamu-old-town', type: 'coastal', order: 8,
    summary: 'Three days on Lamu: carved doors, donkeys, dhow sails at sunset and the dunes of Shela.',
    statement: 'Slow days on a car-free island.', emphasis: 'car-free',
    days: 3, nights: 2, priceFrom: 890, priceBasis: 'per person sharing, sample price', difficulty: 'easy', groupSizeMax: 8,
    bestMonths: COAST_BEST, destinations: ['lamu'],
    highlights: ['Lamu Old Town (UNESCO)', 'Sunset dhow sail', 'Shela beach and dunes'],
    itinerary: [
      { title: 'Fly to Lamu', description: 'Flight to Manda, boat to Lamu, afternoon walk through the Old Town.', overnight: 'Guesthouse in Lamu', meals: ['D'] },
      { title: 'Lamu', description: 'Lamu Fort and museum, then a sunset dhow sail.', overnight: 'Guesthouse in Lamu', meals: ['B', 'D'] },
      { title: 'Return', description: 'Morning at Shela, then fly back.', meals: ['B'] },
    ],
    inclusions: ['Flights', 'Boat transfers', 'Accommodation', 'Guided walk', 'Dhow sail'], exclusions: ['Lunches', 'Drinks', 'Tips'],
    faqs: [faq('Is Lamu suitable for families?', 'Yes, with older children who enjoy walking; there are no cars, so lanes are calm.')],
  },
  {
    title: 'Watamu, Gede & Malindi', slug: 'watamu-malindi', type: 'coastal', order: 9,
    summary: 'Two days up the coast: the marine park, the ruined Swahili town of Gede and sunset over Mida Creek.',
    statement: 'Ruins in the forest, turtles in the bay.', emphasis: 'Ruins',
    days: 2, nights: 1, priceFrom: 420, priceBasis: 'per person sharing, sample price', difficulty: 'easy', groupSizeMax: 6,
    bestMonths: COAST_BEST, destinations: ['watamu'],
    highlights: ['Watamu Marine National Park', 'Gede Ruins', 'Mida Creek boardwalk'],
    itinerary: [
      { title: 'Diani to Watamu', description: 'Drive north, afternoon at the Gede Ruins and Mida Creek.', overnight: 'Hotel in Watamu', meals: ['D'], drive: 'About 3.5 h' },
      { title: 'Watamu & Malindi', description: 'Morning snorkelling, then Malindi old town and the drive back.', meals: ['B', 'L'] },
    ],
    inclusions: ['Transport', 'Accommodation', 'Entry fees', 'Snorkelling'], exclusions: ['Drinks', 'Tips'],
    faqs: [faq('Is the drive long?', 'About three and a half hours each way, so two days is the comfortable minimum.')],
  },
  {
    title: 'Mount Kenya: Sirimon to Chogoria', slug: 'mount-kenya-sirimon-chogoria', type: 'walking', featured: true, order: 10,
    summary: 'A five-day trek to Point Lenana (4,985 m), up the gentle Sirimon route and down the dramatic Chogoria gorge.',
    statement: 'Walk to the roof of Kenya.', emphasis: 'roof',
    days: 5, nights: 4, priceFrom: 1400, priceBasis: 'per person, sample price', difficulty: 'challenging', groupSizeMax: 8,
    bestMonths: ['jan', 'feb', 'aug', 'sep'], destinations: ['mount-kenya'],
    highlights: ['Summit Point Lenana at sunrise', 'Giant lobelias and groundsels', 'Lake Michaelson and the Chogoria gorge'],
    itinerary: [
      { title: 'Sirimon gate to Old Moses', description: 'Short first walk through forest to acclimatise.', overnight: 'Mountain hut', meals: ['L', 'D'] },
      { title: 'To Shipton\'s camp', description: 'Through the Mackinder valley under the main peaks.', overnight: 'Mountain hut', meals: ['B', 'L', 'D'] },
      { title: 'Summit day', description: 'Pre-dawn climb to Point Lenana, then descend to the Chogoria side.', overnight: 'Camp', meals: ['B', 'L', 'D'] },
      { title: 'Chogoria descent', description: 'Past Lake Michaelson and the gorge rim.', overnight: 'Bandas', meals: ['B', 'L', 'D'] },
      { title: 'Out and away', description: 'Final walk out and transfer.', meals: ['B'] },
    ],
    inclusions: ['Certified mountain guide, cook and porters', 'Park fees', 'Huts and camping', 'Meals on the mountain'], exclusions: ['Flights to Nairobi', 'Sleeping bag hire', 'Tips'],
    faqs: [faq('How hard is the Point Lenana trek?', 'It is non-technical but strenuous; altitude is the main challenge. Good fitness and a slow pace matter most.')],
  },
  {
    title: 'Kaya Kinondo forest walk', slug: 'kaya-kinondo-walk', type: 'walking', order: 11,
    summary: 'A guided walk through a sacred Mijikenda forest on the edge of Diani, with a local elder or guide.',
    statement: 'A sacred forest, a few minutes from the sea.', emphasis: 'sacred',
    days: 1, nights: 0, priceFrom: 35, priceBasis: 'per person, sample price', difficulty: 'easy', groupSizeMax: 10,
    bestMonths: COAST_BEST, destinations: ['diani'],
    highlights: ['Part of the Sacred Mijikenda Kaya Forests (UNESCO)', 'Medicinal plants and forest customs', 'Colobus monkeys'],
    itinerary: [{ title: 'Kaya Kinondo', description: 'A two-hour walk with a community guide; customs such as wrapping a kaniki cloth are explained on arrival.' }],
    inclusions: ['Community guide fee', 'Transfers within Diani'], exclusions: ['Tips'],
    faqs: [faq('Is there a dress code?', 'Visitors are asked to wear a kaniki (provided) over their clothes and to follow the guide\'s instructions on customs.')],
  },
]

export const sampleWildlife = [
  { name: 'African elephant', slug: 'african-elephant', photo: 'tsavoElephants' as PhotoKey, swahiliName: 'Tembo', scientificName: 'Loxodonta africana', group: 'grazers', description: 'The largest land animal. In Tsavo they often look red from dust-bathing in the soil.', whereToSee: ['tsavo-east', 'amboseli', 'tsavo-west', 'shimba-hills'], tip: 'Watch the waterholes around midday in the dry season.', order: 1 },
  { name: 'Lion', slug: 'lion', photo: 'maraLioness' as PhotoKey, swahiliName: 'Simba', scientificName: 'Panthera leo', group: 'predators', description: 'Kenya\'s most sought-after sighting. Most active at dawn and dusk.', whereToSee: ['maasai-mara', 'tsavo-east', 'amboseli'], tip: 'Early starts matter: lions are often moving at first light.', order: 2 },
  { name: 'Leopard', slug: 'leopard', swahiliName: 'Chui', scientificName: 'Panthera pardus', group: 'predators', description: 'Elusive and mostly nocturnal; often rests in trees along rivers.', whereToSee: ['maasai-mara', 'samburu', 'tsavo-west'], tip: 'Scan the branches of large acacias and fig trees.', order: 3 },
  { name: 'Cheetah', slug: 'cheetah', swahiliName: 'Duma', scientificName: 'Acinonyx jubatus', group: 'predators', description: 'Built for speed on open grassland; hunts by day.', whereToSee: ['maasai-mara', 'tsavo-east', 'samburu'], order: 4 },
  { name: 'Grevy\'s zebra', slug: 'grevys-zebra', swahiliName: 'Punda milia', scientificName: 'Equus grevyi', group: 'grazers', description: 'An endangered zebra with narrow stripes, found mainly in northern Kenya.', whereToSee: ['samburu'], order: 5 },
  { name: 'Reticulated giraffe', slug: 'reticulated-giraffe', swahiliName: 'Twiga', scientificName: 'Giraffa reticulata', group: 'grazers', description: 'Bold, net-like markings; one of the Samburu special five.', whereToSee: ['samburu'], order: 6 },
  { name: 'Black rhino', slug: 'black-rhino', swahiliName: 'Kifaru', scientificName: 'Diceros bicornis', group: 'grazers', description: 'Critically endangered browser, protected in sanctuaries such as Ngulia and Lake Nakuru.', whereToSee: ['lake-nakuru', 'tsavo-west'], order: 7 },
  { name: 'Sable antelope', slug: 'sable-antelope', swahiliName: 'Palahala', scientificName: 'Hippotragus niger', group: 'grazers', description: 'Striking antelope with sweeping horns; in Kenya found only in the Shimba Hills.', whereToSee: ['shimba-hills'], order: 8 },
  { name: 'Angolan black-and-white colobus', slug: 'angolan-colobus', swahiliName: 'Mbega', scientificName: 'Colobus angolensis palliatus', group: 'primates', description: 'Leaf-eating monkey of Diani\'s coastal forest, protected by local conservation groups.', whereToSee: ['diani'], tip: 'Look up in the forest patches along the Diani beach road.', order: 9 },
  { name: 'Lesser flamingo', slug: 'lesser-flamingo', swahiliName: 'Heroe', scientificName: 'Phoeniconaias minor', group: 'birds', description: 'Gathers on Rift Valley soda lakes; numbers move with lake conditions.', whereToSee: ['lake-nakuru'], order: 10 },
  { name: 'Humpback whale', slug: 'humpback-whale', swahiliName: 'Nyangumi', scientificName: 'Megaptera novaeangliae', group: 'marine', description: 'Migrates along the Kenyan coast, usually from about July to October.', whereToSee: ['wasini-kisite', 'watamu'], bestMonths: ['jul', 'aug', 'sep', 'oct'], order: 11 },
  { name: 'Indo-Pacific bottlenose dolphin', slug: 'bottlenose-dolphin', swahiliName: 'Pomboo', scientificName: 'Tursiops aduncus', group: 'marine', description: 'Frequently seen around Kisite-Mpunguti on dhow trips.', whereToSee: ['wasini-kisite'], order: 12 },
  { name: 'Green turtle', slug: 'green-turtle', swahiliName: 'Kasa', scientificName: 'Chelonia mydas', group: 'marine', description: 'Feeds on seagrass in the marine parks and nests on quieter beaches.', whereToSee: ['watamu', 'wasini-kisite', 'diani'], order: 13 },
] as const

export const sampleExperiences = [
  { title: 'Sunset dhow sail', slug: 'sunset-dhow', category: 'water', summary: 'Sail on a traditional lateen-rigged dhow as the sun drops over the coast.', duration: '2 to 3 hours', priceFrom: 60, location: 'diani', order: 1 },
  { title: 'Snorkelling at Kisite', slug: 'snorkelling-kisite', category: 'water', summary: 'Coral gardens in one of Kenya\'s best marine parks.', duration: 'Full day', priceFrom: 120, location: 'wasini-kisite', order: 2 },
  { title: 'Kitesurfing lessons', slug: 'kitesurfing', category: 'water', summary: 'Diani\'s monsoon winds make it one of East Africa\'s kitesurfing hubs (roughly Dec to Mar and Jun to Sep).', duration: 'From 2 hours', location: 'diani', order: 3 },
  { title: 'Colobus forest walk', slug: 'colobus-walk', category: 'wild', summary: 'Meet Diani\'s Angolan colobus monkeys with a conservation guide.', duration: '1.5 hours', priceFrom: 25, location: 'diani', order: 4 },
  { title: 'Hot-air balloon over the Mara', slug: 'mara-balloon', category: 'wild', summary: 'Drift over the plains at sunrise, followed by a bush breakfast.', duration: 'Sunrise, about 1 hour flight', location: 'maasai-mara', order: 5 },
  { title: 'Shimoni caves', slug: 'shimoni-caves', category: 'culture', summary: 'Coral caves near Shimoni linked to the coast\'s slave-trade history.', duration: '1 hour', location: 'wasini-kisite', order: 6 },
  { title: 'Gede Ruins', slug: 'gede-ruins', category: 'culture', summary: 'Remains of a Swahili town abandoned centuries ago, deep in the forest near Watamu.', duration: '2 hours', location: 'watamu', order: 7 },
  { title: 'Sheldrick Falls trail', slug: 'sheldrick-falls', category: 'foot', summary: 'A ranger-led walk down to a forest waterfall in the Shimba Hills.', duration: '2 hours', location: 'shimba-hills', order: 8 },
] as const

export const sampleAuthor = {
  name: 'The Ngina guiding team', slug: 'ngina-team', role: 'Guides and planners based in Diani Beach',
  bio: 'Written by our Diani-based planning team. Replace this with real bios of your guides: their names, years of experience and specialities.',
  expertise: ['Kenyan safaris', 'Swahili coast'], qualifications: [] as string[],
}

export const samplePosts = [
  {
    title: 'Tsavo East from Diani: what to expect', slug: 'tsavo-east-from-diani', photo: 'tsavoElephants' as PhotoKey,
    excerpt: 'How far it is, how long you need and what you are likely to see on a safari from the south coast.',
    topics: ['safari', 'planning'],
    content: lexical([
      'Tsavo East is the closest major national park to Diani Beach, which makes it the natural first safari for most coastal visitors.',
      { h2: 'How far is it?' },
      'Buchuma gate is roughly 160 km from Diani. Allow about three hours, depending on traffic through Mombasa.',
      { h2: 'How long should I go for?' },
      'A day trip is possible but long. Two or three days lets you enjoy early-morning and late-afternoon game drives, when animals are most active.',
      { h2: 'What will I see?' },
      { ul: ['Elephants, often red from the soil', 'Lion and, with luck, cheetah', 'Buffalo, giraffe, zebra and many antelope', 'Lugard Falls and Mudanda Rock'] },
    ]),
    faqs: [faq('Can I do Tsavo East as a day trip from Diani?', 'Yes, but it means about six hours on the road. Staying at least one night gives a far better experience.')],
  },
  {
    title: 'Kisite-Mpunguti: a day on the dhow', slug: 'kisite-mpunguti-dhow-day', photo: 'dianiSunset' as PhotoKey,
    excerpt: 'Snorkelling, dolphins and lunch on Wasini Island: a plain guide to the south coast\'s favourite day out.',
    topics: ['coast', 'marine'],
    content: lexical([
      'Kisite-Mpunguti Marine National Park lies off Shimoni, about an hour and a quarter south of Diani.',
      { h2: 'What happens on the day' },
      'Most trips sail from Shimoni by dhow, stop to snorkel the coral gardens, look for dolphins and finish with a seafood lunch on Wasini Island.',
      { h2: 'When to go' },
      'The sea is usually calmest from about October to March. Humpback whales pass along the coast from about July to October.',
    ]),
    faqs: [faq('Do I need to be a strong swimmer?', 'No. Life jackets are provided and you can stay close to the boat.')],
  },
  {
    title: 'What to pack for a Kenya safari (and a few days on the coast)', slug: 'what-to-pack-kenya-safari', photo: 'maraGiraffeZebra' as PhotoKey,
    excerpt: 'A short, practical packing list for game drives and the beach, including the luggage limits on small planes.',
    topics: ['planning', 'safari'],
    content: lexical([
      'Most of our guests combine a few days on safari with time on the beach in Diani. The good news: you need less than you think, and almost everything works in both places.',
      { h2: 'Clothes for game drives' },
      'Mornings and evenings in the parks can be cool, especially in an open vehicle, while middays are hot. Pack **layers** you can take off as the day warms up.',
      { ul: ['Neutral colours: khaki, olive, brown and beige', 'Avoid dark blue and black, which attract tsetse flies in some parks', 'A warm fleece or light jacket for early starts', 'A wide-brimmed hat and sunglasses', 'Comfortable closed shoes for walks'] },
      { h2: 'For the coast' },
      { ul: ['Light cotton or linen clothes', 'Reef shoes or sandals for the lagoon at low tide', 'Reef-safe sunscreen', 'Something to cover shoulders and knees in Mombasa Old Town, Lamu and other traditional areas'] },
      { h2: 'Luggage on small planes' },
      'If any part of your trip is by light aircraft, for example a fly-in to the Maasai Mara, bags are often limited to about **15 kg per person, including hand luggage, in soft bags**. Limits vary by airline, so we confirm yours when we book. We can usually store larger suitcases in Diani while you are away.',
      { h2: 'Useful extras' },
      { ul: ['Binoculars: one pair each is ideal', 'A camera with a zoom lens, spare batteries and memory cards', 'A refillable water bottle', 'Insect repellent', 'Any personal medicines, in their original packaging'] },
      { h2: 'Plastic bags' },
      'Kenya banned single-use plastic carrier bags in 2017. Leave them at home, including duty-free bags, and pack toiletries in reusable pouches instead.',
      { h2: 'Health' },
      'Ask a travel clinic or your doctor about vaccinations and malaria prevention well before you travel. They will advise based on your health and the places you are visiting.',
    ]),
    faqs: [
      faq('Do I need special safari clothing?', 'No. Comfortable clothes in neutral colours, layers for cool mornings and a hat are enough.'),
      faq('How much luggage can I take on a fly-in safari?', 'Often about 15 kg per person in soft bags, including hand luggage, but it depends on the airline. We confirm the limit for your flights.'),
    ],
  },
  {
    title: 'Tsavo or Amboseli: which safari from Diani?', slug: 'tsavo-or-amboseli-from-diani', photo: 'kilimanjaro' as PhotoKey,
    excerpt: 'Two very different parks within reach of the south coast. How they compare and how to combine them.',
    topics: ['safari', 'planning'],
    content: lexical([
      'Both parks can be reached by road from Diani, and both are famous for elephants. They feel very different, though, and the right choice depends on how much time you have.',
      { h2: 'Tsavo East: the closest big park' },
      'Tsavo East covers 13,747 km² and is the nearest major national park to Diani, about three hours by road. It is wide, open and red: the elephants are coloured by the soil. Highlights include the Galana River, Lugard Falls and Mudanda Rock. It works for a short safari of one to three nights.',
      { h2: 'Tsavo West: volcanic hills and springs' },
      'Tsavo West, 9,065 km², is hillier and greener, shaped by old lava flows. Visit Mzima Springs, where you can watch hippos from an underwater hide, the Shetani lava flow and the Ngulia Rhino Sanctuary.',
      'Our [Amboseli & Tsavo West safari](/safaris/amboseli-tsavo-west) combines both parks in five days.',
      { h2: 'Amboseli: elephants beneath Kilimanjaro' },
      'Amboseli is much smaller, 392 km², with swamps fed by water from Kilimanjaro. On clear mornings the mountain (5,895 m, across the border in Tanzania) rises behind the elephant herds. It is further from the coast: allow a full day of driving, or combine it with Tsavo West on the way.',
      { h2: 'Which should I choose?' },
      { ul: ['**Two or three days:** Tsavo East, perhaps with the Taita Hills', '**Four or five days:** Tsavo West and Amboseli together', '**Short on time but keen on Kilimanjaro:** fly back from Amboseli to save the long drive'] },
    ]),
    faqs: [
      faq('Which park is closer to Diani?', 'Tsavo East. Its Buchuma gate is roughly 160 km from Diani, about three hours by road.'),
      faq('When can I see Kilimanjaro from Amboseli?', 'Early morning usually gives the clearest view, before cloud builds up around the summit.'),
    ],
  },
  {
    title: 'The Great Migration: when and where to see it', slug: 'great-migration-maasai-mara', photo: 'maraMigration' as PhotoKey,
    excerpt: 'What the migration is, when it usually reaches the Maasai Mara and how to get there from the coast.',
    topics: ['wildlife', 'safari'],
    content: lexical([
      'The Great Migration is the year-round movement of more than a million wildebeest, with zebra and gazelle, between Tanzania\'s Serengeti and Kenya\'s Maasai Mara, following the rain and fresh grass.',
      { h2: 'When is it in Kenya?' },
      'The herds are usually in the Maasai Mara from about **July to October**. Timing changes every year with the rains, so no one can promise exact dates.',
      { h2: 'The river crossings' },
      'The most dramatic moments are the crossings of the Mara River, where crocodiles wait. Herds can gather on the bank for hours, or days, before crossing. Patience, and a guide who knows the crossing points, makes all the difference.',
      { h2: 'Outside migration season' },
      'The Mara is excellent all year. The resident lions, cheetahs, elephants and other plains game stay put, and there are fewer vehicles outside the peak months.',
      { h2: 'Getting there from Diani' },
      'The Mara is a long way from the coast by road, so we recommend flying. Light aircraft leave from Ukunda airstrip in Diani, usually connecting via Nairobi. See our [Maasai Mara fly-in from Diani](/safaris/maasai-mara-fly-in).',
    ]),
    faqs: [
      faq('Can you guarantee a river crossing?', 'No. Crossings depend on the herds and the weather. Spending at least three nights in the Mara gives you the best chance.'),
      faq('Is the migration only in Kenya?', 'No. The herds spend most of the year in the Serengeti in Tanzania and are usually in the Maasai Mara from about July to October.'),
    ],
  },
  {
    title: 'Meet the colobus monkeys of Diani', slug: 'diani-colobus-monkeys', photo: 'dianiSunset' as PhotoKey,
    excerpt: 'The black-and-white monkeys of Diani\'s coastal forest, where to see them and how to be a good neighbour.',
    topics: ['wildlife', 'coast'],
    content: lexical([
      'Diani\'s coastal forest is home to the **Angolan black-and-white colobus** (Colobus angolensis palliatus), known in Swahili as mbega. With their long white-tipped tails, they are one of the coast\'s most memorable sights.',
      { h2: 'A monkey that eats leaves' },
      'Colobus live almost entirely in the trees and feed mainly on leaves. Unlike some other monkeys around Diani, they rarely come to the ground and do not raid hotel breakfasts.',
      { h2: 'Where to see them' },
      { ul: ['Patches of forest along the Diani beach road', 'Kaya Kinondo, the sacred Mijikenda forest south of Diani', 'On a guided colobus walk with a local conservation group'] },
      { h2: 'Being a good neighbour' },
      { ul: ['Never feed monkeys: it makes them ill and teaches them to approach people', 'Drive slowly on the beach road, where monkeys cross', 'Keep food and bags closed when Sykes\' monkeys or baboons are around'] },
      'Local conservation groups work to protect the colobus and their forest. A guided walk is the best way to see them and to support that work.',
    ]),
    faqs: [faq('Are the colobus monkeys dangerous?', 'No. They are shy, leaf-eating monkeys that stay in the trees. As with all wildlife, keep your distance and never feed them.')],
  },
  {
    title: 'The Kenya eTA in short', slug: 'kenya-eta-in-short', photo: 'maraSunset' as PhotoKey,
    excerpt: 'A quick summary of Kenya\'s Electronic Travel Authorisation, with a link to our full step-by-step guide.',
    topics: ['planning'],
    content: lexical([
      'Most visitors to Kenya need an **Electronic Travel Authorisation (eTA)**, approved before they fly. Here is the short version. Our [full Kenya eTA guide](/kenya-eta) has every step. These details were checked against the official portal on 13 November 2026.',
      { h2: 'The essentials' },
      { ul: ['Apply only on the official website, etakenya.go.ke, or the official Kenya Travel Authorisation app', 'One application per traveller, including children', 'US$30 for a standard single-entry eTA', 'Apply at least 2 weeks before you travel; processing usually takes about 3 working days', 'Your passport must be valid for at least 6 months, with a blank page'] },
      { h2: 'Who does not need one' },
      'Citizens of East African Community countries, and of many Commonwealth and African countries, are exempt. Check your nationality on the official portal.',
      { h2: 'Watch out for look-alike sites' },
      'Some websites charge extra to submit the same application. Use only the official portal or app.',
      { h2: 'An eTA is not a guarantee of entry' },
      'The final decision is always made at the border. Keep a copy of your approval, your return ticket and your accommodation details with you.',
    ]),
    faqs: [faq('Do children need their own eTA?', 'Yes. Every traveller needs their own eTA, including infants and children, unless their nationality is exempt.')],
  },
]

const legal = (title: string, paras: (string | { h2: string } | { ul: string[] })[]) => ({ title, paras })

export const samplePages = [
  {
    title: 'Our story', slug: 'our-story',
    hero: { eyebrow: 'Diani Beach, Kenya', statement: 'Born on the coast, at home in the wild.', emphasis: 'wild', intro: 'Ngina Trails and Safaris is a small team based in Diani Beach. This page is sample content: tell your own story here.', tone: 'night' },
    layout: [
      { blockType: 'statement', eyebrow: '01 · Where we are', text: 'We plan every journey from Diani, where the reef meets the forest.', emphasis: 'Diani', tone: 'cream' },
      { blockType: 'textMedia', eyebrow: '02 · How we travel', heading: 'Small groups, private vehicles, people we know.', body: 'We work with drivers, guides, lodges and boat crews we have travelled with ourselves. Replace this with your own story: how Ngina started and what you care about.', imageSide: 'right', tone: 'coast' },
      { blockType: 'statement', eyebrow: '03 · What we believe', text: 'Travel should leave the coast and the parks better than we found them.', emphasis: 'better', tone: 'safari' },
      { blockType: 'cta', heading: 'Plan a journey with us', body: 'Tell us what you would love to see.', label: 'Plan your trip', href: '/plan-your-trip', ctaId: 'story-cta', tone: 'night' },
    ],
  },
  {
    title: 'When to go', slug: 'when-to-go',
    hero: { eyebrow: 'Seasons', statement: 'There is no wrong month, only different ones.', emphasis: 'different', intro: 'Kenya sits on the equator, so temperatures change little. The rains shape the seasons.', tone: 'coast' },
    layout: [
      { blockType: 'facts', heading: 'The year at a glance', tone: 'cream', keyFacts: [
        { label: 'January to March', value: 'Dry and hot. Excellent game viewing; calm seas on the coast.' },
        { label: 'April to May', value: 'Long rains. Green landscapes, fewer visitors, lower prices. Some lodges close.' },
        { label: 'June to October', value: 'Dry season and peak safari time. Great Migration in the Mara, usually July to October.' },
        { label: 'November', value: 'Short rains, usually brief afternoon showers.' },
        { label: 'December', value: 'Festive peak on the coast; book early.' },
      ] },
      { blockType: 'faq', heading: 'Good to know', faqs: [
        faq('What is the best month for a Kenya safari?', 'June to October and January to March are the driest and best for game viewing. July to October adds the Great Migration in the Maasai Mara.'),
        faq('Is it worth travelling in the rainy season?', 'Often, yes. Rain usually falls in short bursts, the parks are green and quiet, and prices are lower.'),
      ] },
    ],
  },
  {
    title: 'Kenya eTA guide', slug: 'kenya-eta',
    hero: { eyebrow: 'Before you fly', statement: 'Your Kenya eTA, step by step.', emphasis: 'eTA', intro: 'Most visitors to Kenya need an Electronic Travel Authorisation (eTA), approved before they travel. Here is what it is, who needs one and how to apply. Checked against the official portal on 13 November 2026.', tone: 'coast' },
    layout: [
      { blockType: 'facts', heading: 'At a glance (checked 13 November 2026)', tone: 'cream', keyFacts: [
        { label: 'Who needs one', value: 'All visitors, including infants and children, unless their nationality or status is exempt.' },
        { label: 'Main exemptions', value: 'Citizens of East African Community countries (stays up to 180 days), and citizens of many Commonwealth and African countries (stays up to 90 or 60 days, depending on the country). Check your nationality on the official portal.' },
        { label: 'Where to apply', value: 'Only on the official website, etakenya.go.ke, or the official "Kenya Travel Authorisation" app. One application per traveller.' },
        { label: 'Cost', value: 'US$30 for a standard single-entry eTA. Transit eTA US$20. An expedited service costs extra.' },
        { label: 'When to apply', value: 'At least 2 weeks before travel is recommended. Processing usually takes about 3 working days, sometimes longer.' },
        { label: 'What you need', value: 'Passport valid for at least 6 months with a blank page, a photo or selfie, email and phone number, your itinerary and your accommodation confirmation.' },
        { label: 'Good to know', value: 'An approved eTA is not a guarantee of entry: the final decision is made at the border.' },
      ] },
      { blockType: 'richText', content: lexical([
        { h2: 'How to apply' },
        { ul: [
          'Go to **etakenya.go.ke** (or the official app) and choose Apply now. Avoid other websites offering to apply for a fee.',
          'Fill in one application for each traveller, including children.',
          'Upload your passport details and photo, and attach your itinerary and accommodation confirmation.',
          'Pay online, then watch your email for the approval and keep a copy with your passport.',
        ] },
        { h2: 'How we help' },
        'Once your trip is confirmed we send you the itinerary and accommodation confirmation the application asks for, and remind you to apply in good time. Applications are personal, so each traveller submits their own on the official site.',
        { h2: 'Health and vaccinations' },
        'Vaccination requirements depend on where you are travelling from. Check with your doctor or travel clinic and the official Kenyan guidance before you travel.',
        'Rules change. Always confirm the current requirements on the official portal before you book flights.',
      ]) },
      { blockType: 'faq', heading: 'eTA questions', faqs: [
        faq('Do children and babies need a Kenya eTA?', 'Yes. The official portal says all visitors, including infants and children, need an approved eTA unless they are exempt.'),
        faq('How much does the Kenya eTA cost?', 'A standard single-entry eTA costs US$30, and a transit eTA US$20, according to the official portal (checked November 2026).'),
        faq('How long does a Kenya eTA take?', 'Usually about 3 working days. The portal recommends applying at least 2 weeks before you travel.'),
        faq('Do East African citizens need an eTA?', 'Citizens of East African Community countries are listed as exempt for stays of up to 180 days. Check the official portal for your nationality.'),
        faq('Can Ngina apply for my eTA?', 'Each traveller applies on the official website or app. We send you the itinerary and accommodation confirmation you need to attach.'),
      ] },
      { blockType: 'cta', heading: 'Plan your trip, and we will send what you need.', label: 'Plan your trip', href: '/plan-your-trip', ctaId: 'eta-cta', tone: 'safari' },
    ],
  },
  {
    title: 'Experiences', slug: 'experiences',
    hero: { eyebrow: 'Experiences', statement: 'Small moments that make a journey.', emphasis: 'moments', intro: 'Add any of these to a safari or coastal stay.', tone: 'night' },
    layout: [],
  },
  ...[
    legal('Privacy policy', [
      'SAMPLE TEXT: have this reviewed by a lawyer before launch. This policy explains how Ngina Trails and Safaris ("we") handles personal data under the Kenya Data Protection Act, 2019 and, for visitors from Europe, the GDPR.',
      { h2: 'What we collect' },
      { ul: ['Details you give us: name, email, phone, country, travel dates and preferences, and messages.', 'Booking details for the people travelling, limited to what the trip requires.', 'Payment confirmations from our payment provider (we never see or store full card numbers).', 'Basic analytics only if you accept them in the cookie banner.'] },
      { h2: 'Why we use it' },
      'To answer your enquiry, plan and operate your trip, take payments, meet legal obligations, and (only with your consent) send occasional news.',
      { h2: 'Who we share it with' },
      'Suppliers who deliver your trip (lodges, drivers, guides, airlines), and service providers that run our website, email, chat and payments, under contracts that protect your data.',
      { h2: 'Your rights' },
      'You can ask to see, correct or delete your data, or object to its use, by emailing us. You may also complain to the Office of the Data Protection Commissioner (Kenya).',
      { h2: 'How long we keep it' },
      'Enquiries for up to two years; booking and payment records for as long as tax law requires.',
    ]),
    legal('Terms and conditions', [
      'SAMPLE TEXT: replace with your own booking terms reviewed by a lawyer.',
      { h2: 'Bookings and deposits' },
      'A booking is confirmed when we receive the deposit shown on your quote. The balance is due by the date on your booking confirmation.',
      { h2: 'Cancellations' },
      'Set out your cancellation charges here, for example as a percentage of the trip cost by days before departure.',
      { h2: 'Park fees and changes' },
      'Kenya Wildlife Service and county park fees are set by the authorities and may change; we pass on any change at cost.',
      { h2: 'Travel insurance' },
      'Comprehensive travel insurance, including medical evacuation, is a condition of travel.',
    ]),
    legal('Cookie policy', [
      'We use only the cookies needed for the site to work (for example to remember your cookie choice and keep a live chat open) unless you choose to allow analytics.',
      { h2: 'Your choice' },
      'You can change your choice at any time with the "Cookie settings" link in the footer.',
    ]),
  ].map((l) => ({
    title: l.title,
    slug: l.title === 'Privacy policy' ? 'privacy' : l.title === 'Terms and conditions' ? 'terms' : 'cookies',
    hero: { eyebrow: 'Legal', statement: l.title, tone: 'cream' as const },
    layout: [{ blockType: 'richText', content: lexical(l.paras) }],
  })),
]

export const sampleCannedReplies = [
  { title: 'Thanks, will reply with a plan', shortcut: 'thanks', body: 'Jambo {firstName},\n\nThank you for getting in touch. I am putting together a few options for you and will send them over shortly.\n\nBest wishes,\n{agentName}' },
  { title: 'Ask for dates and group', shortcut: 'dates', body: 'Hi {firstName},\n\nTo give you an accurate price, could you share your travel dates, how many adults and children are travelling, and the style of accommodation you prefer?\n\nThank you,\n{agentName}' },
  { title: 'Deposit link sent', shortcut: 'deposit', body: 'Hi {firstName},\n\nYour booking is held. You can pay the deposit by M-Pesa or card using the secure link I have just sent.\n\nAsante,\n{agentName}' },
]
