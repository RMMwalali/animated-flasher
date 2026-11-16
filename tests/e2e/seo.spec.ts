import { expect, test } from '@playwright/test'

const PAGES = ['/', '/safaris', '/safaris/tsavo-east-taita-hills', '/coastal-tours/wasini-kisite-dhow', '/destinations', '/destinations/amboseli', '/wildlife', '/experiences', '/when-to-go', '/our-story', '/kenya-eta', '/blog', '/blog/what-to-pack-kenya-safari', '/contact', '/licences', '/plan-your-trip']

test('every page has its own title, a Google-length description, canonical and share image', async ({ request }) => {
  const titles = new Map<string, string>()
  for (const path of PAGES) {
    const html = await (await request.get(path)).text()
    const title = /<title>([^<]+)<\/title>/.exec(html)?.[1]
    const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1]?.replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, '.')
    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1]
    expect(title, path).toBeTruthy()
    expect(titles.has(title!), `${path} repeats the title of ${titles.get(title!)}`).toBe(false)
    titles.set(title!, path)
    expect(desc && desc.length >= 50 && desc.length <= 160, `${path} description: ${desc}`).toBe(true)
    expect(new URL(canonical!).pathname.replace(/\/$/, '') || '/').toBe(path)
    expect(html).toMatch(/<meta property="og:image" content="[^"]+"/)
  }
})

test('sitemap lists CMS pages, articles and authors; private areas stay out', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  for (const p of ['/our-story', '/kenya-eta', '/blog/what-to-pack-kenya-safari', '/blog/author/ngina-team', '/destinations/amboseli']) expect(xml).toContain(`${p}</loc>`)
  expect(xml).not.toMatch(/\/(trip|quote|pay|admin)\//)
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  expect(new Set(locs).size).toBe(locs.length)
})

test('site name and business data are published for Google', async ({ request }) => {
  const html = await (await request.get('/')).text()
  expect(html).toContain('"@type":"WebSite"')
  expect(html).toMatch(/"@type":"WebSite","@id":"[^"]+","name":"Ngina Trails/)
  expect(html).toMatch(/"hasMap":"https:\/\/(www\.google\.com\/maps|maps\.app\.goo\.gl)/)
  expect(html).not.toContain('openingHours')
})

test('search titles edited in the admin reach the website straight away', async ({ request, isMobile }) => {
  const password = process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD
  test.skip(isMobile || !password, 'desktop, needs the seeded admin password')
  const { token } = (await (await request.post('/api/users/login', { data: { email: process.env.E2E_ADMIN_EMAIL ?? 'admin@ngina.local', password } })).json()) as { token: string }
  const headers = { Authorization: `JWT ${token}` }
  const titleOf = async (p: string) => /<title>([^<]+)<\/title>/.exec(await (await request.get(p)).text())?.[1]
  // home page: Business settings → Search & Google
  await request.post('/api/globals/site-settings', { headers, data: { search: { homeTitle: 'E2E home title' } } })
  await expect.poll(() => titleOf('/'), { timeout: 15_000 }).toBe('E2E home title')
  await request.post('/api/globals/site-settings', { headers, data: { search: { homeTitle: '' } } })
  // a journey: Search & sharing → Search title
  const trip = (await (await request.get('/api/trips?where[slug][equals]=shimba-hills-morning&depth=0', { headers })).json()).docs[0]
  await request.patch(`/api/trips/${trip.id}`, { headers, data: { seo: { ...trip.seo, title: 'E2E trip title' }, _status: 'published' } })
  await expect.poll(() => titleOf('/safaris/shimba-hills-morning'), { timeout: 15_000 }).toContain('E2E trip title')
  await request.patch(`/api/trips/${trip.id}`, { headers, data: { seo: { ...trip.seo, title: '' }, _status: 'published' } })
})
