import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // dismiss the consent banner for a stable layout
  await page.addInitScript(() => localStorage.setItem('ngina-consent', JSON.stringify({ analytics: false, at: '' })))
})

test('home page renders the story, journeys and enquiry form', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
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
