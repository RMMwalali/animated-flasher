import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ngina-consent', JSON.stringify({ analytics: false, at: '' }))
    sessionStorage.setItem('ngina-intro', '1')
  })
})

const PAGES = [
  '/safaris', '/safaris/tsavo-east-taita-hills', '/coastal-tours', '/coastal-tours/wasini-kisite-dhow', '/walking-and-mountain',
  '/destinations', '/destinations/amboseli', '/wildlife', '/experiences', '/when-to-go', '/our-story', '/journal',
  '/journal/tsavo-east-from-diani', '/plan-your-trip', '/contact', '/licences', '/kenya-eta', '/privacy',
]

for (const path of PAGES) {
  test(`${path} renders with one h1 and no sideways scroll`, async ({ page }) => {
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('journey page has TouristTrip, FAQ and breadcrumb structured data', async ({ page }) => {
  await page.goto('/safaris/tsavo-east-taita-hills')
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n')
  expect(ld).toContain('"TouristTrip"')
  expect(ld).toContain('"Offer"')
  expect(ld).toContain('"FAQPage"')
  expect(ld).toContain('"BreadcrumbList"')
  await expect(page.getByRole('link', { name: /request to book/i })).toHaveAttribute('href', '/plan-your-trip?trip=tsavo-east-taita-hills')
})

test('destination page has TouristDestination data and the map links to it', async ({ page }) => {
  await page.goto('/destinations')
  await expect(page.getByRole('link', { name: /diani beach \(our home\)/i })).toBeAttached()
  await page.goto('/destinations/amboseli')
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n')
  expect(ld).toContain('"TouristDestination"')
})

test('request to book: five steps, then a lead is created', async ({ page }) => {
  await page.goto('/plan-your-trip?trip=maasai-mara-fly-in')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/request to book/i)
  await page.getByRole('button', { name: /next: when/i }).click()
  // a start date is required for a booking request
  await page.getByRole('button', { name: /next: who/i }).click()
  await expect(page.getByText(/choose a start date/i)).toBeVisible()
  const d = new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10)
  await page.getByLabel('Start date').fill(d)
  await page.getByRole('button', { name: /next: who/i }).click()
  await page.getByLabel(/nationalities/i).fill('British')
  await page.getByRole('button', { name: /next: style/i }).click()
  await page.getByRole('radio', { name: /boutique/i }).click()
  await page.getByRole('button', { name: /next: you/i }).click()
  await page.getByLabel('Your name').fill('E2E Booking Guest')
  await page.getByLabel('Email').fill(`e2e+book${Date.now()}@example.com`)
  await page.waitForTimeout(2600)
  await page.getByRole('button', { name: /send booking request/i }).click()
  await expect(page.getByText(/we have your booking request/i)).toBeVisible({ timeout: 15_000 })
})

test('sitemap, robots and llms.txt', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('/destinations/amboseli')
  expect(sitemap).toContain('/kenya-eta')
  const robots = await (await request.get('/robots.txt')).text()
  for (const bot of ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Bingbot']) expect(robots).toContain(bot)
  expect(robots).toContain('Disallow: /admin')
  const llms = await (await request.get('/llms.txt')).text()
  expect(llms).toContain('# Ngina Trails & Safaris')
  expect(llms).toContain('Kenya eTA guide')
})
