/**
 * Sample content loader, shared by `pnpm seed` and the admin's
 * "Load sample content" button. Idempotent: existing documents (matched by
 * slug / filename) are kept; gaps are filled. With `overwriteGlobals: false`
 * (the admin button) the Home page and Business settings are only written
 * when they are still empty, so the owner's edits are never replaced.
 */
import type { Payload } from 'payload'
import { photos } from '@/content/photos'
import * as S from '@/content/sample'

export type PhotoFile = { filePath: string } | { file: { data: Buffer; mimetype: string; name: string; size: number } }
export type SeedOptions = {
  log?: (m: string) => void
  /** How to get the bytes of a sample photo (disk for the script, HTTP for the admin button). */
  loadPhoto: (url: string, filename: string) => Promise<PhotoFile>
  overwriteGlobals?: boolean
}
export type SeedResult = { photos: number; created: number; skipped: number; trips: Record<string, any>; destinations: Record<string, number> }

export const SEED_CONTEXT = { seeding: true, skipRevalidate: true, skipLeadHooks: false }

export async function seedContent(payload: Payload, opts: SeedOptions): Promise<SeedResult> {
  const log = opts.log ?? (() => {})
  const ctx = SEED_CONTEXT
  let created = 0
  let skipped = 0

  async function upsert(collection: any, where: Record<string, any>, data: Record<string, any>, o: { draft?: boolean } = {}) {
    const found = await payload.find({ collection, where, limit: 1, depth: 0, overrideAccess: true })
    if (found.docs[0]) {
      skipped++
      return found.docs[0] as any
    }
    created++
    return payload.create({ collection, data: { ...data, ...(o.draft === false ? { _status: 'published' } : {}) } as any, overrideAccess: true, context: ctx })
  }

  // ---------- sample photos (free stock, see docs/PHOTO-CREDITS.md) ----------
  const media: Record<string, number> = {}
  for (const [key, p] of Object.entries(photos)) {
    const filename = p.url.split('/').pop()!
    // match on filename or the sample's unique description: storage may rename files (e.g. "-2")
    const found = await payload.find({ collection: 'media', where: { or: [{ filename: { equals: filename } }, { alt: { equals: p.alt } }] }, limit: 1, depth: 0, overrideAccess: true })
    let doc = found.docs[0]
    if (!doc) {
      const src = await opts.loadPhoto(p.url, filename)
      doc = await payload.create({
        collection: 'media', overrideAccess: true, context: ctx,
        data: { alt: p.alt, credit: p.credit, caption: 'Sample photo: replace with your own' },
        ...src,
      })
      created++
    }
    media[key] = doc.id
  }
  const photoId = (k?: string | null) => (k ? media[k] : undefined)
  log(`photos (${Object.keys(media).length})`)

  async function ensurePhoto(collection: any, doc: any, field: string, key?: string | null) {
    const id = photoId(key)
    if (id && !doc[field]) await payload.update({ collection, id: doc.id, data: { [field]: id } as any, overrideAccess: true, context: ctx })
  }

  // ---------- globals ----------
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
  const settingsEmpty = !settings.trust?.length && !settings.email && !settings.phone
  if (opts.overwriteGlobals || settingsEmpty) {
    await payload.updateGlobal({ slug: 'site-settings', data: S.sampleSettings as any, overrideAccess: true, context: ctx })
  }
  const home = await payload.findGlobal({ slug: 'home', depth: 0, overrideAccess: true })
  if (opts.overwriteGlobals || !home.heroStatement) {
    const { stage, coast, safari, ...homeRest } = S.sampleHome
    await payload.updateGlobal({
      slug: 'home', overrideAccess: true, context: ctx,
      data: {
        ...homeRest, _status: 'published',
        stage: stage.map(({ photo, ...s }) => ({ ...s, image: photoId(photo) })),
        coast: { ...coast, photo: undefined, image: photoId(coast.photo) },
        safari: { ...safari, photo: undefined, image: photoId(safari.photo) },
      } as any,
    })
  }
  log('settings + home')

  // ---------- content ----------
  const author = await upsert('authors', { slug: { equals: S.sampleAuthor.slug } }, { ...S.sampleAuthor, sample: true })
  const dest: Record<string, number> = {}
  for (const d of S.sampleDestinations) {
    const { photo, ...dd } = d as typeof d & { photo?: string }
    const doc = await upsert('destinations', { slug: { equals: d.slug } }, {
      ...dd, sample: true, heroImage: photoId(photo), bestMonths: [...d.bestMonths], keyFacts: d.keyFacts.map((f) => ({ ...f })), highlights: d.highlights.map((h) => ({ ...h })), faqs: d.faqs.map((f) => ({ ...f })),
    }, { draft: false })
    await ensurePhoto('destinations', doc, 'heroImage', photo)
    dest[d.slug] = doc.id
  }
  const trips: Record<string, any> = {}
  for (const t of S.sampleTrips) {
    const { photo, ...tt } = t
    trips[t.slug] = await upsert('trips', { slug: { equals: t.slug } }, {
      ...tt, sample: true, heroImage: photoId(photo), startsFrom: 'Diani Beach', childPercent: 50,
      destinations: t.destinations.map((s) => dest[s]).filter(Boolean),
      highlights: t.highlights.map((text) => ({ text })), inclusions: t.inclusions.map((text) => ({ text })), exclusions: t.exclusions.map((text) => ({ text })),
      itinerary: t.itinerary.map((d) => ({ ...d, meals: d.meals ? [...d.meals] : [] })),
      keyFacts: [
        { label: 'Duration', value: `${t.days} ${t.days === 1 ? 'day' : 'days'}` },
        { label: 'Starts from', value: 'Diani Beach' },
        ...(t.difficulty ? [{ label: 'Difficulty', value: t.difficulty }] : []),
      ],
    }, { draft: false })
    await ensurePhoto('trips', trips[t.slug], 'heroImage', photo)
  }
  for (const w of S.sampleWildlife) {
    const { photo, ...ww } = w as typeof w & { photo?: string }
    const wdoc = await upsert('wildlife', { slug: { equals: w.slug } }, { ...ww, sample: true, image: photoId(photo), whereToSee: w.whereToSee.map((s) => dest[s]).filter(Boolean), bestMonths: 'bestMonths' in w ? [...w.bestMonths] : [] })
    await ensurePhoto('wildlife', wdoc, 'image', photo)
  }
  for (const e of S.sampleExperiences) await upsert('experiences', { slug: { equals: e.slug } }, { ...e, sample: true, location: dest[e.location] })
  for (const p of S.samplePosts) {
    await upsert('posts', { slug: { equals: p.slug } }, { ...p, sample: true, author: author.id, topics: [...p.topics], faqs: [...p.faqs], publishedAt: new Date().toISOString() }, { draft: false })
  }
  for (const pg of S.samplePages) await upsert('pages', { slug: { equals: pg.slug } }, { ...pg, sample: true }, { draft: false })
  for (const r of S.sampleCannedReplies) await upsert('canned-replies', { title: { equals: r.title } }, r)
  log('content')

  // ---------- operations: sample suppliers ----------
  const sup = (name: string, type: string, extra: Record<string, unknown> = {}) => upsert('suppliers', { name: { equals: name } }, { name, type, ...extra })
  await sup('Sample driver-guide (replace)', 'guide', { phone: '', location: dest['tsavo-east'] })
  await sup('Land Cruiser KXX 000X (sample)', 'vehicle')
  await sup('Sample Tsavo East lodge (replace)', 'lodge', { location: dest['tsavo-east'], rates: 'Add your contracted rates here.' })
  await sup('Sample Shimoni dhow crew (replace)', 'boat', { location: dest['wasini-kisite'] })
  log('suppliers')

  return { photos: Object.keys(media).length, created, skipped, trips, destinations: dest }
}
