import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // dismiss the consent banner for a stable layout
  await page.addInitScript(() => localStorage.setItem('ngina-consent', JSON.stringify({ analytics: false, at: '' })))
})

test('home page renders the stage, story, journeys and enquiry form', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.locator('.stage')).toBeVisible()
  await expect(page.locator('[data-cta="home-story-plan"]')).toBeAttached()
  await expect(page.locator('#journeys')).toBeVisible()
  await expect(page.getByRole('button', { name: /send enquiry/i })).toBeVisible()
  const width = await page.evaluate(() => document.documentElement.scrollWidth)
  const vw = await page.evaluate(() => window.innerWidth)
  expect(width).toBeLessThanOrEqual(vw)
})

test('overlay menu opens and closes', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /open menu/i }).click()
  const dialog = page.getByRole('dialog', { name: 'Menu' })
  const link = dialog.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /safaris/i })
  await expect(link).toBeVisible()
  await expect(dialog.getByRole('link', { name: /plan your trip/i })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('enquiry form validates, then submits', async ({ page }) => {
  await page.goto('/')
  const form = page.locator('#enquire form')
  await form.getByRole('button', { name: /send enquiry/i }).click()
  await expect(form.getByText(/tell us your name/i)).toBeVisible()
  await form.getByLabel('Your name').fill('E2E Test Guest')
  await form.getByLabel('Email').fill(`e2e+${Date.now()}@example.com`)
  await form.getByLabel(/tell us about your trip/i).fill('Automated smoke test, please ignore.')
  await page.waitForTimeout(2600) // the form rejects submissions faster than a human
  await form.getByRole('button', { name: /send enquiry/i }).click()
  await expect(page.getByText(/we have your enquiry/i)).toBeVisible({ timeout: 15_000 })
})

test('structured data and SEO basics are present', async ({ page }) => {
  await page.goto('/')
  const ld = await page.locator('script[type="application/ld+json"]').first().textContent()
  expect(ld).toContain('TravelAgency')
  expect(ld).toContain('Diani Beach')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/?$/)
})

test('first visit: logo opening plays on its own, then the stage (motion enabled)', async ({ browser }, testInfo) => {
  const ctx = await browser.newContext({ ...testInfo.project.use, reducedMotion: 'no-preference' })
  await ctx.addInitScript(() => localStorage.setItem('ngina-consent', JSON.stringify({ analytics: false, at: '' })))
  const page = await ctx.newPage()
  await page.goto('/')
  const intro = page.locator('[data-intro-overlay]')
  await expect(intro).toBeAttached()
  // no buttons, no sound: nothing to click
  await expect(page.getByRole('button', { name: /karibu|sound/i })).toHaveCount(0)
  await expect(intro).toHaveCount(0, { timeout: 8000 })
  await expect(page.locator('#site-header')).not.toHaveAttribute('inert', '')
  await expect(page.locator('.stage-line.is-active')).toHaveCount(1)
  await expect(page.locator('.stage-line.is-active')).toBeInViewport()
  // repeat visit in the same session skips it
  await page.reload()
  await expect(page.locator('[data-intro-overlay]')).toHaveCount(0)
  await expect(page.locator('.stage-line.is-active')).toHaveCount(1)
  await ctx.close()
})

test('the logo opening can be skipped with a tap', async ({ browser }, testInfo) => {
  const ctx = await browser.newContext({ ...testInfo.project.use, reducedMotion: 'no-preference' })
  const page = await ctx.newPage()
  await page.goto('/')
  await page.locator('[data-intro-overlay]').click({ position: { x: 20, y: 20 } })
  await expect(page.locator('[data-intro-overlay]')).toHaveCount(0, { timeout: 3000 })
  await ctx.close()
})

test('stage pauses and moves between scenes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'phone', 'scene arrows are desktop-only')
  await page.goto('/')
  const active = () => page.locator('.stage-line.is-active').textContent()
  const first = await active()
  await page.getByRole('button', { name: 'Next scene' }).click()
  await expect.poll(active).not.toBe(first)
  await expect(page.getByRole('button', { name: /play scenes|pause scenes/i })).toBeVisible()
})

test('no hand-drawn strokes: emphasis is colour, buttons are plain', async ({ page }) => {
  for (const path of ['/', '/destinations']) {
    await page.goto(path)
    await expect(page.locator('svg.brush')).toHaveCount(0)
    await expect(page.locator('#site-header button svg path[d^="M52 5"]')).toHaveCount(0)
  }
  await expect(page.getByText(/explore ngina/i)).toHaveCount(0)
  const em = page.locator('.stage-em, .emphasis').first()
  if (await em.count()) {
    const color = await em.evaluate((el) => getComputedStyle(el).color)
    expect(color).not.toBe(await page.locator('body').evaluate((el) => getComputedStyle(el).color))
  }
})

test('no floating WhatsApp button', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-whatsapp]')).toHaveCount(0)
  await expect(page.locator('img[src*="whatsapp-3d"]')).toHaveCount(0)
})

test('the scroll lion fades out at the footer', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the lion shows on larger screens')
  await page.addInitScript(() => sessionStorage.setItem('ngina-intro', '1'))
  await page.goto('/blog/tsavo-east-from-diani')
  const lion = page.getByRole('progressbar', { name: 'Page scroll progress' })
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2))
  await expect.poll(() => lion.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect.poll(() => lion.evaluate((el) => getComputedStyle(el).opacity)).toBe('0')
})
