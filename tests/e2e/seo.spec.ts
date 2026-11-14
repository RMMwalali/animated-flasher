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
