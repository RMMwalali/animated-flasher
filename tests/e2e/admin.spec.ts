import { expect, test } from '@playwright/test'

const email = process.env.E2E_ADMIN_EMAIL ?? 'admin@ngina.local'
const password = process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD

test('admin can log in and sees the overview', async ({ page }) => {
  test.skip(!password, 'Set E2E_ADMIN_PASSWORD (or SEED_ADMIN_PASSWORD) to the seeded admin password')
  await page.goto('/admin/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password!)
  await page.getByRole('button', { name: /log ?in/i }).click()
  await expect(page.getByRole('heading', { name: /jambo/i })).toBeVisible({ timeout: 30_000 })
  await expect(page.getByRole('heading', { name: /new leads/i })).toBeVisible()
  await page.goto('/admin/pipeline')
  await expect(page.getByRole('heading', { name: /leads pipeline/i })).toBeVisible()
})

test('admin API rejects anonymous access to CRM data', async ({ request }) => {
  const res = await request.get('/api/leads')
  expect([401, 403]).toContain(res.status())
})

test('loading sample content is admin-only', async ({ request }) => {
  const res = await request.post('/api/admin/load-sample')
  expect(res.status()).toBe(403)
})
