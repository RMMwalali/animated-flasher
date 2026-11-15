import { randomBytes } from 'node:crypto'
import { expect, test } from '@playwright/test'

const email = process.env.E2E_ADMIN_EMAIL ?? 'admin@ngina.local'
const password = process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD

test('integrations are admin-only and keys never come back in full', async ({ request, isMobile }) => {
  test.skip(isMobile, 'API test, desktop only')
  expect([401, 403]).toContain((await request.get('/api/globals/integrations')).status())
  expect((await request.post('/api/admin/integrations/test', { data: { service: 'paystack' } })).status()).toBe(403)
  test.skip(!password, 'needs the seeded admin password')
  const { token } = (await (await request.post('/api/users/login', { data: { email, password } })).json()) as { token: string }
  const headers = { Authorization: `JWT ${token}` }
  // throwaway values made up for this run (never real keys)
  const indexNowKey = randomBytes(16).toString('hex')
  const fakeApiKey = `test-only-${randomBytes(6).toString('hex')}-1234`
  const save = await request.post('/api/globals/integrations', { headers, data: { indexNow: { key: indexNowKey }, google: { placesApiKey: fakeApiKey } } })
  expect(save.ok()).toBeTruthy()
  const read = (await (await request.get('/api/globals/integrations', { headers })).json()) as any
  expect(read.google.placesApiKey).toBe('••••••••1234')
  // saving the masked value back keeps the key; the public key file uses the stored IndexNow key
  await request.post('/api/globals/integrations', { headers, data: { google: { placesApiKey: read.google.placesApiKey } } })
  expect(((await (await request.get('/api/globals/integrations', { headers })).json()) as any).google.placesApiKey).toBe('••••••••1234')
  await expect.poll(async () => (await request.get('/indexnow-key.txt')).text(), { timeout: 40_000, intervals: [2000] }).toBe(indexNowKey)
  const t = (await (await request.post('/api/admin/integrations/test', { headers, data: { service: 'paystack' } })).json()) as { ok: boolean; message: string }
  expect(t.ok).toBe(false)
  expect(t.message).toMatch(/secret key/i)
  // clean up
  await request.post('/api/globals/integrations', { headers, data: { indexNow: { key: '' }, google: { placesApiKey: '' } } })
})

test('WhatsApp button, cookie choices, and empty widgets stay hidden', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('ngina-intro', '1'))
  await page.goto('/')
  const wa = page.getByRole('link', { name: /chat with us on whatsapp/i })
  await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\/254720972512\?text=/)
  await page.getByRole('button', { name: 'Choose', exact: true }).click()
  await page.getByRole('checkbox', { name: /visit statistics/i }).click()
  await page.getByRole('button', { name: 'Save choices' }).click()
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('ngina-consent') || '{}'))
  expect(stored).toMatchObject({ analytics: true, marketing: false })
  // no ad or analytics scripts without IDs; no TikTok row or reviews without content
  expect(await page.locator('script[src*="googletagmanager"], script[src*="fbevents"], script[src*="analytics.tiktok"]').count()).toBe(0)
  await expect(page.locator('#tiktok-title')).toHaveCount(0)
  await expect(page.locator('#reviews-title')).toHaveCount(0)
})
