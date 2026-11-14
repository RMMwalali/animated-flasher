/**
 * Read-side content layer for the public site. Reads Payload; if the
 * database is unreachable (e.g. a build without DATABASE_URL) it falls back
 * to the bundled sample content so the site always renders.
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { cache } from 'react'
import * as S from '@/content/sample'
import { photos, type PhotoKey } from '@/content/photos'
import { env } from '@/lib/env'
import { localizeUrl } from '@/lib/media-url'
import type { Destination, Experience, Home, Media, Page, Post, SiteSetting, Trip, Wildlife } from '@/payload-types'

export type MediaVM = { url: string; alt: string; width?: number; height?: number; mimeType?: string; focalX?: number; focalY?: number; poster?: MediaVM | null }
export type QA = { question: string; answer: string }
export type Fact = { label: string; value: string }
export type SEO = { title?: string | null; description?: string | null; image?: MediaVM | null; noIndex?: boolean | null }

export type TripVM = {
  slug: string; title: string; type: 'safari' | 'coastal' | 'walking'; summary: string; statement?: string | null; emphasis?: string | null
  days: number; nights?: number | null; priceFrom?: number | null; priceBasis?: string | null; startsFrom?: string | null
  difficulty?: string | null; groupSizeMax?: number | null; bestMonths: string[]; highlights: string[]
  itinerary: { title: string; description?: string | null; overnight?: string | null; meals?: string[] | null; drive?: string | null }[]
  inclusions: string[]; exclusions: string[]; faqs: QA[]; keyFacts: Fact[]; destinations: { slug: string; name: string }[]
  heroImage?: MediaVM | null; gallery: MediaVM[]; sample: boolean; seo?: SEO; updatedAt?: string; featured: boolean
}
export type DestinationVM = {
  slug: string; name: string; region: 'coast' | 'safari' | 'mountain'; summary: string; statement?: string | null; emphasis?: string | null
  county?: string | null; distanceFromDiani?: string | null; altitude?: string | null; area?: string | null; lat?: number | null; lng?: number | null
  bestMonths: string[]; keyFacts: Fact[]; highlights: string[]; faqs: QA[]; body?: unknown; heroImage?: MediaVM | null; sample: boolean; seo?: SEO; updatedAt?: string
}
export type WildlifeVM = { slug: string; name: string; swahiliName?: string | null; scientificName?: string | null; group: string; description: string; tip?: string | null; whereToSee: { slug: string; name: string }[]; bestMonths: string[]; image?: MediaVM | null }
export type ExperienceVM = { slug: string; title: string; category: string; summary: string; duration?: string | null; priceFrom?: number | null; location?: { slug: string; name: string } | null; image?: MediaVM | null }
export type AuthorVM = { name: string; slug: string; role?: string | null; bio: string; expertise: string[]; qualifications: string[]; photo?: MediaVM | null }
export type PostVM = { slug: string; title: string; excerpt: string; content: unknown; faqs: QA[]; author: AuthorVM; publishedAt: string; updatedAt?: string; topics: string[]; heroImage?: MediaVM | null; sample: boolean; seo?: SEO }
export type PageVM = { slug: string; title: string; hero: { eyebrow?: string | null; statement?: string | null; emphasis?: string | null; intro?: string | null; image?: MediaVM | null; tone?: string | null }; layout: any[]; sample: boolean; seo?: SEO; updatedAt?: string }
export type StageSlide = { statement: string; emphasis?: string | null; scene: 'coast' | 'safari' | 'dawn' | 'night'; image?: MediaVM | null; video?: MediaVM | null }
export type HomeVM = Omit<typeof S.sampleHome, 'stage' | 'welcome'> & {
  heroImage?: MediaVM | null; heroVideo?: MediaVM | null; film?: MediaVM | null
  welcome: { soundNote: string; enterLabel: string; quietLabel: string; ambientAudio?: MediaVM | null }
  stage: StageSlide[]
  coast: typeof S.sampleHome.coast & { image?: MediaVM | null; video?: MediaVM | null }
  safari: typeof S.sampleHome.safari & { image?: MediaVM | null; video?: MediaVM | null }
}
export type SettingsVM = typeof S.sampleSettings & { fromSample: boolean; search: typeof S.sampleSettings.search & { siteIcon?: MediaVM | null; shareImage?: MediaVM | null } }

// ---------- payload access ----------
let failedAt = 0
export const getPayloadSafe = cache(async (): Promise<Payload | null> => {
  if (!env.DATABASE_URL && env.NODE_ENV === 'production') return null
  if (failedAt && Date.now() - failedAt < 30_000) return null
  try {
    return await getPayload({ config })
  } catch (e) {
    failedAt = Date.now()
    console.warn('[content] database unavailable, using sample content:', (e as Error).message)
    return null
  }
})

async function q<T>(fn: (p: Payload) => Promise<T>): Promise<T | null> {
  const p = await getPayloadSafe()
  if (!p) return null
  try {
    return await fn(p)
  } catch (e) {
    console.warn('[content] query failed, using sample content:', (e as Error).message)
    return null
  }
}

// ---------- mappers ----------
/** Sample photo (self-hosted) as a MediaVM. */
export const samplePhoto = (key?: PhotoKey | null): MediaVM | null => {
  if (!key) return null
  const p = photos[key]
  return { url: p.url, alt: p.alt, width: p.width, height: p.height, mimeType: 'image/webp' }
}
const sampleStage = () => S.sampleHome.stage.map(({ photo, ...x }) => ({ ...x, image: samplePhoto(photo) }))
export function media(m: Media | number | null | undefined): MediaVM | null {
  if (!m || typeof m !== 'object' || !m.url) return null
  return {
    url: localizeUrl(m.url), alt: m.alt ?? '', width: m.width ?? undefined, height: m.height ?? undefined, mimeType: m.mimeType ?? undefined,
    focalX: m.focalX ?? undefined, focalY: m.focalY ?? undefined, poster: media(m.poster as Media | null),
  }
}
const texts = (a?: { text?: string | null }[] | null) => (a ?? []).map((x) => x.text ?? '').filter(Boolean)
const seo = (s?: { title?: string | null; description?: string | null; image?: unknown; noIndex?: boolean | null } | null): SEO | undefined =>
  s ? { title: s.title, description: s.description, image: media(s.image as Media), noIndex: s.noIndex } : undefined
const ref = (d: unknown): { slug: string; name: string } | null =>
  d && typeof d === 'object' && 'slug' in d ? { slug: String((d as Destination).slug), name: String((d as Destination).name) } : null

const destName = (slug: string) => S.sampleDestinations.find((d) => d.slug === slug)?.name ?? slug

function tripFromDoc(t: Trip): TripVM {
  return {
    slug: t.slug, title: t.title, type: t.type, summary: t.summary, statement: t.statement, emphasis: t.emphasis,
    days: t.days, nights: t.nights, priceFrom: t.priceFrom, priceBasis: t.priceBasis, startsFrom: t.startsFrom, difficulty: t.difficulty,
    groupSizeMax: t.groupSizeMax, bestMonths: t.bestMonths ?? [], highlights: texts(t.highlights),
    itinerary: (t.itinerary ?? []).map((d) => ({ title: d.title, description: d.description, overnight: d.overnight, meals: d.meals, drive: d.drive })),
    inclusions: texts(t.inclusions), exclusions: texts(t.exclusions), faqs: (t.faqs ?? []) as QA[], keyFacts: (t.keyFacts ?? []) as Fact[],
    destinations: (t.destinations ?? []).map(ref).filter(Boolean) as TripVM['destinations'],
    heroImage: media(t.heroImage as Media), gallery: ((t.gallery ?? []) as Media[]).map(media).filter(Boolean) as MediaVM[],
    sample: Boolean(t.sample), seo: seo(t.seo), updatedAt: t.updatedAt, featured: Boolean(t.featured),
  }
}
function tripFromSample(t: (typeof S.sampleTrips)[number]): TripVM {
  return {
    ...t, startsFrom: 'Diani Beach', keyFacts: [], gallery: [], heroImage: samplePhoto(t.photo), sample: true, featured: Boolean(t.featured),
    highlights: [...t.highlights], inclusions: [...t.inclusions], exclusions: [...t.exclusions], bestMonths: [...t.bestMonths],
    itinerary: t.itinerary.map((d) => ({ ...d, meals: d.meals ? [...d.meals] : [] })), faqs: [...t.faqs],
    destinations: t.destinations.map((slug) => ({ slug, name: destName(slug) })),
  }
}
function destFromDoc(d: Destination): DestinationVM {
  return {
    slug: d.slug, name: d.name, region: d.region, summary: d.summary, statement: d.statement, emphasis: d.emphasis, county: d.county,
    distanceFromDiani: d.distanceFromDiani, altitude: d.altitude, area: d.area, lat: d.lat, lng: d.lng, bestMonths: d.bestMonths ?? [],
    keyFacts: (d.keyFacts ?? []) as Fact[], highlights: texts(d.highlights), faqs: (d.faqs ?? []) as QA[], body: d.body,
    heroImage: media(d.heroImage as Media), sample: Boolean(d.sample), seo: seo(d.seo), updatedAt: d.updatedAt,
  }
}
function destFromSample(d: (typeof S.sampleDestinations)[number]): DestinationVM {
  return {
    ...d, region: d.region, bestMonths: [...d.bestMonths], keyFacts: d.keyFacts.map((f) => ({ ...f })), highlights: d.highlights.map((h) => h.text),
    faqs: d.faqs.map((f) => ({ ...f })), heroImage: samplePhoto('photo' in d ? d.photo : null), sample: true,
  }
}

// ---------- queries ----------
const PUBLISHED = { _status: { equals: 'published' } } as const

export const getSettings = cache(async (): Promise<SettingsVM> => {
  const s = await q((p) => p.findGlobal({ slug: 'site-settings', depth: 1 }))
  if (!s) return { ...S.sampleSettings, fromSample: true }
  const g = s as SiteSetting
  return {
    ...S.sampleSettings, ...(g as any), fromSample: false,
    address: { ...S.sampleSettings.address, ...(g.address ?? {}) },
    hours: (g.hours ?? []) as any,
    trust: (g.trust ?? []).map((t) => ({ ...t, certificate: media(t.certificate as Media) })) as any, social: (g.social ?? []) as any,
    search: {
      ...S.sampleSettings.search,
      ...Object.fromEntries(Object.entries(g.search ?? {}).filter(([, v]) => v != null && v !== '')),
      siteIcon: media(g.search?.siteIcon as Media), shareImage: media(g.search?.shareImage as Media),
    } as SettingsVM['search'],
  }
})

export const getHome = cache(async (): Promise<HomeVM> => {
  const h = (await q((p) => p.findGlobal({ slug: 'home', depth: 1 }))) as Home | null
  if (!h || !h.heroStatement)
    return {
      ...S.sampleHome, welcome: { ...S.sampleHome.welcome }, stage: sampleStage(),
      coast: { ...S.sampleHome.coast, image: samplePhoto(S.sampleHome.coast.photo) },
      safari: { ...S.sampleHome.safari, image: samplePhoto(S.sampleHome.safari.photo) },
    } as HomeVM
  const ch = (c: Home['coast'], fb: typeof S.sampleHome.coast) => ({
    ...fb, ...Object.fromEntries(Object.entries(c ?? {}).filter(([, v]) => v != null && v !== '')),
    points: c?.points?.length ? c.points.map((x) => ({ title: x.title, text: x.text ?? '' })) : fb.points,
    image: media(c?.image as Media), video: media(c?.video as Media),
  })
  return {
    ...S.sampleHome, ...Object.fromEntries(Object.entries(h).filter(([, v]) => v != null && v !== '')),
    heroImage: media(h.heroImage as Media), heroVideo: media(h.heroVideo as Media),
    coast: ch(h.coast, S.sampleHome.coast) as HomeVM['coast'], safari: ch(h.safari, S.sampleHome.safari) as HomeVM['safari'],
    seasons: (h.seasons?.length ? h.seasons : S.sampleHome.seasons) as any,
    welcome: {
      soundNote: h.welcome?.soundNote || S.sampleHome.welcome.soundNote,
      enterLabel: h.welcome?.enterLabel || S.sampleHome.welcome.enterLabel,
      quietLabel: h.welcome?.quietLabel || S.sampleHome.welcome.quietLabel,
      ambientAudio: media(h.welcome?.ambientAudio as Media),
    },
    stage: h.stage?.length
      ? h.stage.map((x) => ({ statement: x.statement, emphasis: x.emphasis, scene: (x.scene ?? 'safari') as StageSlide['scene'], image: media(x.image as Media), video: media(x.video as Media) }))
      : sampleStage(),
    slideSeconds: h.slideSeconds ?? S.sampleHome.slideSeconds,
    film: media(h.film as Media),
  } as HomeVM
})

export const getTrips = cache(async (opts: { type?: TripVM['type']; featured?: boolean } = {}): Promise<TripVM[]> => {
  const res = await q((p) =>
    p.find({
      collection: 'trips', depth: 1, limit: 100, sort: 'order',
      where: { and: [PUBLISHED, ...(opts.type ? [{ type: { equals: opts.type } }] : []), ...(opts.featured ? [{ featured: { equals: true } }] : [])] },
    }),
  )
  if (res && res.docs.length) return res.docs.map(tripFromDoc)
  if (res && !res.docs.length && !(await isEmptyDb())) return []
  return S.sampleTrips.filter((t) => (!opts.type || t.type === opts.type) && (!opts.featured || t.featured)).map(tripFromSample)
})

export const getTrip = cache(async (slug: string): Promise<TripVM | null> => {
  const res = await q((p) => p.find({ collection: 'trips', depth: 1, limit: 1, where: { and: [PUBLISHED, { slug: { equals: slug } }] } }))
  if (res?.docs[0]) return tripFromDoc(res.docs[0])
  if (res && !(await isEmptyDb())) return null
  const s = S.sampleTrips.find((t) => t.slug === slug)
  return s ? tripFromSample(s) : null
})

export const getDestinations = cache(async (): Promise<DestinationVM[]> => {
  const res = await q((p) => p.find({ collection: 'destinations', depth: 1, limit: 100, sort: 'order', where: PUBLISHED }))
  if (res && res.docs.length) return res.docs.map(destFromDoc)
  if (res && !(await isEmptyDb())) return []
  return S.sampleDestinations.map(destFromSample)
})

export const getDestination = cache(async (slug: string): Promise<DestinationVM | null> => {
  const res = await q((p) => p.find({ collection: 'destinations', depth: 1, limit: 1, where: { and: [PUBLISHED, { slug: { equals: slug } }] } }))
  if (res?.docs[0]) return destFromDoc(res.docs[0])
  if (res && !(await isEmptyDb())) return null
  const s = S.sampleDestinations.find((d) => d.slug === slug)
  return s ? destFromSample(s) : null
})

export const getTripsForDestination = cache(async (slug: string) => (await getTrips()).filter((t) => t.destinations.some((d) => d.slug === slug)))

export const getWildlife = cache(async (): Promise<WildlifeVM[]> => {
  const res = await q((p) => p.find({ collection: 'wildlife', depth: 1, limit: 200, sort: 'order' }))
  if (res && res.docs.length)
    return res.docs.map((w: Wildlife) => ({
      slug: w.slug, name: w.name, swahiliName: w.swahiliName, scientificName: w.scientificName, group: w.group, description: w.description, tip: w.tip,
      whereToSee: (w.whereToSee ?? []).map(ref).filter(Boolean) as WildlifeVM['whereToSee'], bestMonths: w.bestMonths ?? [], image: media(w.image as Media),
    }))
  return S.sampleWildlife.map((w) => ({ ...w, tip: 'tip' in w ? w.tip : null, bestMonths: 'bestMonths' in w ? [...w.bestMonths] : [], whereToSee: w.whereToSee.map((slug) => ({ slug, name: destName(slug) })), image: samplePhoto('photo' in w ? w.photo : null) }))
})

export const getExperiences = cache(async (): Promise<ExperienceVM[]> => {
  const res = await q((p) => p.find({ collection: 'experiences', depth: 1, limit: 200, sort: 'order' }))
  if (res && res.docs.length)
    return res.docs.map((e: Experience) => ({ slug: e.slug, title: e.title, category: e.category, summary: e.summary, duration: e.duration, priceFrom: e.priceFrom, location: ref(e.location), image: media(e.image as Media) }))
  return S.sampleExperiences.map((e) => ({ ...e, priceFrom: 'priceFrom' in e ? e.priceFrom : null, location: { slug: e.location, name: destName(e.location) }, image: null }))
})

const authorFrom = (a: any): AuthorVM =>
  a && typeof a === 'object'
    ? { name: a.name, slug: a.slug, role: a.role, bio: a.bio, expertise: a.expertise ?? [], qualifications: a.qualifications ?? [], photo: media(a.photo) }
    : { ...S.sampleAuthor, photo: null }

export const getPosts = cache(async (): Promise<PostVM[]> => {
  const res = await q((p) => p.find({ collection: 'posts', depth: 2, limit: 100, sort: '-publishedAt', where: PUBLISHED }))
  if (res && res.docs.length)
    return res.docs.map((d: Post) => ({
      slug: d.slug, title: d.title, excerpt: d.excerpt, content: d.content, faqs: (d.faqs ?? []) as QA[], author: authorFrom(d.author),
      publishedAt: d.publishedAt ?? d.createdAt, updatedAt: d.updatedAt, topics: d.topics ?? [], heroImage: media(d.heroImage as Media), sample: Boolean(d.sample), seo: seo(d.seo),
    }))
  if (res && !(await isEmptyDb())) return []
  // newest first, like the database query; dates are illustrative
  return S.samplePosts
    .map(({ photo, ...d }, i) => ({ ...d, faqs: [...d.faqs], topics: [...d.topics], author: authorFrom(null), publishedAt: new Date(Date.UTC(2026, 6, 1 + i * 14)).toISOString(), heroImage: samplePhoto(photo), sample: true }))
    .reverse()
})

export const getPost = cache(async (slug: string) => (await getPosts()).find((p) => p.slug === slug) ?? null)

export const getPage = cache(async (slug: string): Promise<PageVM | null> => {
  const res = await q((p) => p.find({ collection: 'pages', depth: 2, limit: 1, where: { and: [PUBLISHED, { slug: { equals: slug } }] } }))
  const d = res?.docs[0] as Page | undefined
  if (d) return { slug: d.slug, title: d.title, hero: { ...(d.hero ?? {}), image: media(d.hero?.image as Media) }, layout: d.layout ?? [], sample: Boolean(d.sample), seo: seo(d.seo), updatedAt: d.updatedAt }
  if (res && !(await isEmptyDb())) return null
  const s = S.samplePages.find((p) => p.slug === slug)
  return s ? { ...s, hero: { ...s.hero }, layout: s.layout as any[], sample: true } : null
})

/** Every published page (for the sitemap and pre-rendering), including ones the owner adds. */
export const getPages = cache(async (): Promise<{ slug: string; updatedAt?: string; noIndex: boolean }[]> => {
  const res = await q((p) => p.find({ collection: 'pages', depth: 0, limit: 500, where: PUBLISHED, select: { slug: true, updatedAt: true, seo: true } as any }))
  if (res && res.docs.length) return (res.docs as Page[]).map((d) => ({ slug: d.slug, updatedAt: d.updatedAt, noIndex: Boolean(d.seo?.noIndex) }))
  if (res && !(await isEmptyDb())) return []
  return S.samplePages.map((p) => ({ slug: p.slug, noIndex: false }))
})

/** True when the database is reachable but has never been seeded. */
const isEmptyDb = cache(async () => {
  const r = await q((p) => p.count({ collection: 'trips' }))
  return !r || r.totalDocs === 0
})
