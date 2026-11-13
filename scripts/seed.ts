/**
 * Seed sample content + demo CRM data. Safe to re-run: it skips anything
 * that already exists (matched by slug / email). Run: `pnpm seed`
 *   --reset   delete existing sample content first
 * Logins: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (and optional SEED_SALES_PASSWORD,
 * SEED_EDITOR_PASSWORD). Any password not provided is generated randomly and
 * printed once, only when that user is first created. Nothing is hardcoded.
 *
 * The seed never changes the database schema (no dev "push"): run
 * `pnpm migrate` first on a new database. Pushing would mark the database as
 * dev-managed and make later `payload migrate` runs (e.g. Vercel builds) stop
 * at an interactive prompt. Set PAYLOAD_PUSH=true only for a throwaway dev DB.
 */
try {
  process.loadEnvFile?.('.env')
} catch {
  /* no .env file: rely on the environment */
}

process.env.PAYLOAD_PUSH ??= 'false'

const { randomBytes } = await import('node:crypto')
const { getPayload } = await import('payload')
const { default: config } = await import('../src/payload.config')
const S = await import('../src/content/sample')

const payload = await getPayload({ config })
try {
  await payload.count({ collection: 'users', overrideAccess: true })
} catch {
  console.error('[seed] The database has no tables yet. Run `pnpm migrate` first, then `pnpm seed`.')
  process.exit(1)
}
const ctx = { seeding: true, skipRevalidate: true, skipLeadHooks: false }
const reset = process.argv.includes('--reset')
const log = (m: string) => console.log(`[seed] ${m}`)

async function upsert<T extends Record<string, any>>(collection: any, where: Record<string, any>, data: T, opts: { draft?: boolean } = {}) {
  const found = await payload.find({ collection, where, limit: 1, depth: 0, overrideAccess: true })
  if (found.docs[0]) return found.docs[0] as any
  return payload.create({ collection, data: { ...data, ...(opts.draft === false ? { _status: 'published' } : {}) } as any, overrideAccess: true, context: ctx })
}

if (reset) {
  for (const c of ['payments', 'bookings', 'quotes', 'messages', 'conversations', 'activities', 'tasks', 'leads', 'contacts', 'departures', 'suppliers', 'posts', 'trips', 'experiences', 'wildlife', 'destinations', 'pages', 'authors', 'canned-replies', 'review-requests']) {
    await payload.delete({ collection: c as any, where: { id: { exists: true } }, overrideAccess: true, context: ctx })
  }
  log('cleared existing content')
}

// ---------- team ----------
const created: string[] = []
async function seedUser(email: string, envVar: string, data: Record<string, unknown>) {
  const found = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, depth: 0, overrideAccess: true })
  if (found.docs[0]) return found.docs[0] as any
  const fromEnv = process.env[envVar]
  const generated = randomBytes(12).toString('base64url')
  const user = await payload.create({ collection: 'users', data: { email, password: fromEnv || generated, ...data } as any, overrideAccess: true, context: ctx })
  created.push(fromEnv ? `${email} (from ${envVar})` : `${email}  generated: ${generated}`)
  return user
}
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@ngina.local'
const admin = await seedUser(adminEmail, 'SEED_ADMIN_PASSWORD', { name: 'Ngina Admin', roles: ['admin'], takesNewLeads: true })
const agent = await seedUser('sales@ngina.local', 'SEED_SALES_PASSWORD', { name: 'Amani (sample agent)', roles: ['sales'], title: 'Safari planner', signature: 'Amani\nNgina Trails & Safaris · Diani Beach, Kenya' })
await seedUser('editor@ngina.local', 'SEED_EDITOR_PASSWORD', { name: 'Content editor (sample)', roles: ['editor'], takesNewLeads: false })
log(`team ready (admin: ${adminEmail})`)
if (created.length) log(`new logins (shown once, store them safely):\n  ${created.join('\n  ')}`)

// ---------- globals ----------
await payload.updateGlobal({ slug: 'site-settings', data: S.sampleSettings as any, overrideAccess: true, context: ctx })
await payload.updateGlobal({ slug: 'home', data: { ...S.sampleHome, _status: 'published' } as any, overrideAccess: true, context: ctx })
log('settings + home')

// ---------- content ----------
const author = await upsert('authors', { slug: { equals: S.sampleAuthor.slug } }, { ...S.sampleAuthor, sample: true })
const dest: Record<string, number> = {}
for (const d of S.sampleDestinations) {
  const doc = await upsert('destinations', { slug: { equals: d.slug } }, {
    ...d, sample: true, bestMonths: [...d.bestMonths], keyFacts: d.keyFacts.map((f) => ({ ...f })), highlights: d.highlights.map((h) => ({ ...h })), faqs: d.faqs.map((f) => ({ ...f })),
  }, { draft: false })
  dest[d.slug] = doc.id
}
const trips: Record<string, any> = {}
for (const t of S.sampleTrips) {
  trips[t.slug] = await upsert('trips', { slug: { equals: t.slug } }, {
    ...t, sample: true, startsFrom: 'Diani Beach', childPercent: 50,
    destinations: t.destinations.map((s) => dest[s]).filter(Boolean),
    highlights: t.highlights.map((text) => ({ text })), inclusions: t.inclusions.map((text) => ({ text })), exclusions: t.exclusions.map((text) => ({ text })),
    itinerary: t.itinerary.map((d) => ({ ...d, meals: d.meals ? [...d.meals] : [] })),
    keyFacts: [
      { label: 'Duration', value: `${t.days} ${t.days === 1 ? 'day' : 'days'}` },
      { label: 'Starts from', value: 'Diani Beach' },
      ...(t.difficulty ? [{ label: 'Difficulty', value: t.difficulty }] : []),
    ],
  }, { draft: false })
}
for (const w of S.sampleWildlife) {
  await upsert('wildlife', { slug: { equals: w.slug } }, { ...w, sample: true, whereToSee: w.whereToSee.map((s) => dest[s]).filter(Boolean), bestMonths: 'bestMonths' in w ? [...w.bestMonths] : [] })
}
for (const e of S.sampleExperiences) await upsert('experiences', { slug: { equals: e.slug } }, { ...e, sample: true, location: dest[e.location] })
for (const p of S.samplePosts) {
  await upsert('posts', { slug: { equals: p.slug } }, { ...p, sample: true, author: author.id, topics: [...p.topics], faqs: [...p.faqs], publishedAt: new Date().toISOString() }, { draft: false })
}
for (const pg of S.samplePages) await upsert('pages', { slug: { equals: pg.slug } }, { ...pg, sample: true }, { draft: false })
for (const r of S.sampleCannedReplies) await upsert('canned-replies', { title: { equals: r.title } }, r)
log('content')

// ---------- operations ----------
const sup = async (name: string, type: string, extra: Record<string, unknown> = {}) => upsert('suppliers', { name: { equals: name } }, { name, type, ...extra })
const guide = await sup('Sample driver-guide (replace)', 'guide', { phone: '', location: dest['tsavo-east'] })
const vehicle = await sup('Land Cruiser KXX 000X (sample)', 'vehicle')
await sup('Sample Tsavo East lodge (replace)', 'lodge', { location: dest['tsavo-east'], rates: 'Add your contracted rates here.' })
await sup('Sample Shimoni dhow crew (replace)', 'boat', { location: dest['wasini-kisite'] })

const day = (n: number) => new Date(Date.now() + n * 864e5).toISOString()
await upsert('departures', { label: { exists: true }, trip: { equals: trips['tsavo-east-taita-hills'].id }, startDate: { greater_than: day(-1) } }, {
  trip: trips['tsavo-east-taita-hills'].id, startDate: day(9), capacity: 6, guide: guide.id, vehicle: vehicle.id, status: 'scheduled',
})

// ---------- CRM demo data ----------
const existingLeads = await payload.count({ collection: 'leads', overrideAccess: true })
if (existingLeads.totalDocs === 0) {
  const people = [
    { firstName: 'Sample', lastName: 'Guest A', email: 'guest.a@example.com', country: 'United Kingdom', status: 'new', trip: 'tsavo-east-taita-hills', channel: 'form', cta: 'home-closing-form', utm: ['google', 'cpc', 'tsavo-safari'] },
    { firstName: 'Sample', lastName: 'Guest B', email: 'guest.b@example.com', country: 'Germany', status: 'contacted', trip: 'wasini-kisite-dhow', channel: 'chat', cta: 'chat-widget', utm: [] },
    { firstName: 'Sample', lastName: 'Guest C', email: 'guest.c@example.com', country: 'Kenya', status: 'quoted', trip: 'amboseli-tsavo-west', channel: 'plan', cta: 'plan-your-trip', utm: ['instagram', 'social', 'migration'] },
    { firstName: 'Sample', lastName: 'Guest D', email: 'guest.d@example.com', country: 'United States', status: 'deposit_paid', trip: 'maasai-mara-fly-in', channel: 'form', cta: 'trip-maasai-mara-fly-in-plan', utm: [] },
    { firstName: 'Sample', lastName: 'Guest E', email: 'guest.e@example.com', country: 'Italy', status: 'travelled', trip: 'tsavo-east-taita-hills', channel: 'referral', cta: '', utm: [] },
  ] as const
  for (const [i, p] of people.entries()) {
    const source = { channel: p.channel, ctaId: p.cta || undefined, page: p.channel === 'plan' ? '/plan-your-trip' : '/', utmSource: p.utm[0], utmMedium: p.utm[1], utmCampaign: p.utm[2] }
    const contact = await payload.create({ collection: 'contacts', overrideAccess: true, context: ctx, data: { firstName: p.firstName, lastName: p.lastName, email: p.email, country: p.country, owner: agent.id, source, tags: ['sample'] } })
    const t = trips[p.trip]
    const lead = await payload.create({
      collection: 'leads', overrideAccess: true, context: ctx,
      data: { title: `${contact.fullName}: ${t.title}`, contact: contact.id, status: p.status, assignedTo: i === 0 ? undefined : agent.id, trips: [t.id], adults: 2, children: i % 2, travelStart: day(20 + i * 12), estimatedValue: (t.priceFrom ?? 500) * 2, message: 'SAMPLE: we would love to see elephants and spend a few days on the beach.', source },
    })
    const conv = await payload.create({ collection: 'conversations', overrideAccess: true, context: ctx, data: { subject: `Enquiry: ${t.title}`, contact: contact.id, lead: lead.id, channel: p.channel === 'chat' ? 'chat' : 'email', status: 'open', assignedTo: agent.id, threadKey: `sample${i}`, source } })
    await payload.create({ collection: 'messages', overrideAccess: true, context: ctx, data: { conversation: conv.id, direction: 'in', channel: conv.channel, fromName: contact.fullName, fromEmail: contact.email, body: `SAMPLE MESSAGE: Hello! We are interested in ${t.title} for two people. What dates work best?` } })
    if (['contacted', 'quoted', 'deposit_paid', 'travelled'].includes(p.status)) {
      await payload.create({ collection: 'messages', overrideAccess: true, context: ctx, data: { conversation: conv.id, direction: 'out', channel: conv.channel, author: agent.id, body: `Jambo ${contact.firstName}, thank you! I will send a plan shortly. (sample reply)`, deliveryStatus: 'logged' } })
    }
    if (['quoted', 'deposit_paid', 'travelled'].includes(p.status)) {
      const quote = await payload.create({ collection: 'quotes', overrideAccess: true, context: { ...ctx, skipQuoteHooks: true }, data: { title: t.title, lead: lead.id, contact: contact.id, trip: t.id, adults: 2, children: 0, startDate: day(20 + i * 12), currency: 'USD', depositPercent: 30, status: p.status === 'quoted' ? 'sent' : 'accepted' } })
      if (p.status !== 'quoted') {
        const booking = await payload.create({
          collection: 'bookings', overrideAccess: true, context: ctx,
          data: { title: t.title, contact: contact.id, lead: lead.id, quote: quote.id, trip: t.id, startDate: p.status === 'travelled' ? day(-10) : day(20 + i * 12), endDate: p.status === 'travelled' ? day(-8) : undefined, pax: 2, currency: 'USD', total: quote.total ?? 0, depositDue: quote.deposit ?? 0, status: 'pending_deposit' },
        })
        await payload.update({ collection: 'quotes', id: quote.id, data: { booking: booking.id }, overrideAccess: true, context: { ...ctx, skipQuoteHooks: true } })
        await payload.create({ collection: 'payments', overrideAccess: true, context: ctx, data: { booking: booking.id, contact: contact.id, kind: 'deposit', amount: quote.deposit ?? 0, currency: 'USD', status: 'success', provider: 'manual', method: 'bank', notes: 'SAMPLE payment' } })
        if (p.status === 'travelled') {
          await payload.create({ collection: 'payments', overrideAccess: true, context: ctx, data: { booking: booking.id, contact: contact.id, kind: 'balance', amount: (quote.total ?? 0) - (quote.deposit ?? 0), currency: 'USD', status: 'success', provider: 'manual', method: 'card', notes: 'SAMPLE payment' } })
        }
      }
    }
    // pipeline status last, so automation above cannot move it
    await payload.update({ collection: 'leads', id: lead.id, data: { status: p.status }, overrideAccess: true, context: { ...ctx, skipLeadHooks: true } })
  }
  await payload.create({ collection: 'tasks', overrideAccess: true, context: ctx, data: { title: 'Call Sample Guest A about Tsavo dates (sample)', due: day(0), assignedTo: agent.id } })
  await payload.create({ collection: 'tasks', overrideAccess: true, context: ctx, data: { title: 'Confirm lodge for the next Tsavo departure (sample)', due: day(-1), assignedTo: admin.id } })
  log('demo CRM data')
}

log('done')
process.exit(0)

export {}
