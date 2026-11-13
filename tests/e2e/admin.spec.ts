import { expect, test } from '@playwright/test'

const email = process.env.E2E_ADMIN_EMAIL ?? 'admin@ngina.local'
const password = process.env.E2E_ADMIN_PASSWORD ?? 'ngina-admin-2026'

test('admin can log in and sees the overview', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
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
