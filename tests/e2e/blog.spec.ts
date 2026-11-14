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
  await expect(page.getByText('Latest', { exact: true })).toBeVisible()
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

test('home featured journeys title is fully visible below the header', async ({ page, isMobile }) => {
  test.skip(isMobile, 'pinned rail is desktop only')
  await page.goto('/')
  const title = page.locator('#journeys-title')
  await title.scrollIntoViewIfNeeded()
  await expect(title).toContainText('favourite journeys')
  const section = page.locator('#journeys [data-hscroll]')
  await page.evaluate(() => window.scrollTo(0, document.querySelector<HTMLElement>('#journeys [data-hscroll]')!.getBoundingClientRect().top + window.scrollY))
  await page.waitForTimeout(400)
  const header = await page.locator('#site-header').boundingBox()
  const eyebrow = await page.locator('#journeys .eyebrow').first().boundingBox()
  expect(section).toBeTruthy()
  expect(eyebrow!.y).toBeGreaterThanOrEqual(header!.height - 1)
})
