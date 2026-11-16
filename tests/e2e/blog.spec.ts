import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ngina-consent', JSON.stringify({ analytics: false, at: '' }))
    sessionStorage.setItem('ngina-intro', '1')
  })
})

test('old journal links forward to the blog', async ({ page }) => {
  const res = await page.goto('/journal/tsavo-east-from-diani')
  expect(res?.status()).toBe(200)
  expect(new URL(page.url()).pathname).toBe('/blog/tsavo-east-from-diani')
})

test('blog index: featured article, topic filter kept in the address', async ({ page }) => {
  await page.goto('/blog')
  await expect(page.getByText(/^Latest ·/).first()).toBeVisible()
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n')
  expect(ld).toContain('"Blog"')
  await page.getByRole('radio', { name: 'Marine' }).click()
  await expect(page).toHaveURL(/#topic=marine$/)
  await expect(page.locator('[data-post="kisite-mpunguti-dhow-day"]')).toBeVisible()
  await expect(page.locator('[data-post="great-migration-maasai-mara"]')).toHaveCount(0)
  await page.getByRole('radio', { name: 'All articles' }).click()
  await expect(page.locator('[data-post="great-migration-maasai-mara"]')).toBeVisible()
})

test('article: contents links to anchors, share and related posts', async ({ page, isMobile }) => {
  await page.goto('/blog/tsavo-or-amboseli-from-diani')
  const toc = page.getByRole('navigation', { name: 'In this article' }).filter({ visible: true })
  if (isMobile) await toc.getByRole('button', { name: 'In this article' }).click()
  const link = toc.getByRole('link', { name: 'Amboseli: elephants beneath Kilimanjaro' })
  await expect(link).toHaveAttribute('href', '#amboseli-elephants-beneath-kilimanjaro')
  await expect(page.locator('h2#amboseli-elephants-beneath-kilimanjaro')).toHaveCount(1)
  await link.click()
  await expect(page).toHaveURL(/#amboseli-elephants-beneath-kilimanjaro$/)
  await expect(page.getByRole('link', { name: 'WhatsApp', exact: true })).toHaveAttribute('href', /^https:\/\/wa\.me\/\?text=/)
  await expect(page.getByRole('heading', { name: 'Keep reading' })).toBeVisible()
  await expect(page.locator('[data-reading-progress]')).toBeAttached()
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n')
  expect(ld).toContain('"Article"')
  expect(ld).toContain('/blog/tsavo-or-amboseli-from-diani')
})

test('home journeys: one large journey with its name, arrows and taps move one at a time', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('ngina-intro', '1'))
  await page.goto('/')
  const rail = page.getByRole('region', { name: 'Featured journeys' })
  await rail.scrollIntoViewIfNeeded()
  await expect(page.locator('#journeys-title')).toContainText('favourite journeys')
  const items = rail.locator('li')
  await expect(items.first()).toHaveAttribute('aria-current', 'true')
  // only the selected journey shows text
  await expect(items.first().locator('h3')).toBeVisible()
  await expect.poll(() => items.nth(1).locator('.journey-text').evaluate((el) => getComputedStyle(el).opacity)).toBe('0')
  await page.getByRole('button', { name: 'Next journey' }).filter({ visible: true }).click()
  await expect(items.nth(1)).toHaveAttribute('aria-current', 'true')
  // tapping a smaller photo selects it instead of opening it (corner: the arrow sits over its middle)
  await items.nth(2).locator('a').click({ position: { x: 12, y: 12 } })
  await expect(items.nth(2)).toHaveAttribute('aria-current', 'true')
  await expect(page).toHaveURL(/\/$/)
  // the selected journey opens
  await items.nth(2).locator('a').click()
  await expect(page).toHaveURL(/\/(safaris|coastal-tours|walking)\//)
})
