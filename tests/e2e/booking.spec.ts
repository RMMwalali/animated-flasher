import { expect, test, type APIRequestContext } from '@playwright/test'

const email = process.env.E2E_ADMIN_EMAIL ?? 'admin@ngina.local'
const password = process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ngina-consent', JSON.stringify({ analytics: false, at: '' }))
    sessionStorage.setItem('ngina-intro', '1')
  })
})

async function staff(request: APIRequestContext) {
  const login = await request.post('/api/users/login', { data: { email, password } })
  expect(login.ok()).toBeTruthy()
  const { token } = (await login.json()) as { token: string }
  const headers = { Authorization: `JWT ${token}` }
  const get = async (path: string) => (await (await request.get(path, { headers })).json()) as any
  const action = async (data: Record<string, unknown>) => {
    const res = await request.post('/api/admin/booking', { headers, data })
    return (await res.json()) as { ok: boolean; url?: string; error?: string }
  }
  return { headers, get, action }
}

/** Create a quote for a seeded journey and send it; returns the guest's link path. */
async function sentQuote(request: APIRequestContext) {
  const s = await staff(request)
  const contact = (await s.get('/api/contacts?limit=1&depth=0')).docs[0]
  const trip = (await s.get('/api/trips?where[slug][equals]=tsavo-east-taita-hills&depth=0')).docs[0]
  const start = new Date(Date.now() + 60 * 864e5).toISOString()
  const created = await request.post('/api/quotes', { headers: s.headers, data: { title: 'E2E Tsavo plan', contact: contact.id, trip: trip.id, startDate: start, adults: 2, children: 0 } })
  expect(created.ok()).toBeTruthy()
  const quote = (await created.json()).doc
  expect(quote.total).toBeGreaterThan(0)
  expect(quote.days.length).toBeGreaterThan(0)
  const sent = await s.action({ action: 'send-quote', id: quote.id })
  expect(sent.ok, sent.error).toBeTruthy()
  return { s, quote, path: new URL(sent.url!).pathname }
}

test.describe('booking journey', () => {
  test.skip(!password, 'Set E2E_ADMIN_PASSWORD (or SEED_ADMIN_PASSWORD) to the seeded admin password')

  test('guest views a quote, accepts it and lands on their trip page', async ({ page, request }) => {
    const { s, quote, path } = await sentQuote(request)
    await page.goto(path)
    await expect(page.locator('h1')).toHaveText('E2E Tsavo plan')
    await expect(page.getByRole('heading', { name: 'Day by day' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Price' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    const robots = await page.locator('meta[name="robots"]').getAttribute('content')
    expect(robots).toContain('noindex')

    const accept = page.getByRole('button', { name: 'Accept and book' })
    await expect(accept).toBeDisabled()
    await page.getByLabel('Your full name').fill('Sample Guest E2E')
    await page.getByRole('checkbox').click()
    await accept.click()
    await page.waitForURL(/\/trip\/[\w-]{20,}$/)
    await expect(page.getByText(/My trip · NG-/)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Before you fly' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Your plan' })).toBeVisible()
    await expect(page.locator('[aria-current="step"]')).toHaveText('Booked')
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)

    const q = await s.get(`/api/quotes/${quote.id}?depth=1`)
    expect(q.status).toBe('accepted')
    expect(q.acceptedName).toBe('Sample Guest E2E')
    expect(q.booking.status).toBe('pending_deposit')
    expect(q.booking.total).toBe(q.total)
    expect(q.booking.emails?.confirmationSentAt).toBeTruthy()

    // the quote page now points to the trip page; a second accept is refused politely
    await page.goto(path)
    await expect(page.getByText(/Accepted on/)).toBeVisible()
    const again = await request.post('/api/quote/accept', { data: { token: path.split('/').pop(), name: 'X Y', agree: true } })
    expect((await again.json()).already).toBe(true)
  })

  test('guest can decline a quote with a reason', async ({ page, request, isMobile }) => {
    test.skip(isMobile, 'covered on desktop')
    const { s, quote, path } = await sentQuote(request)
    await page.goto(path)
    await page.getByRole('button', { name: 'No thanks' }).click()
    await page.getByLabel('Reason (optional)').fill('Dates do not work')
    await page.getByRole('button', { name: 'Decline', exact: true }).click()
    await expect(page.getByText('Thank you for letting us know.')).toBeVisible()
    const q = await s.get(`/api/quotes/${quote.id}?depth=0`)
    expect(q.status).toBe('declined')
    expect(q.declineReason).toBe('Dates do not work')
  })
})

test('guest endpoints refuse bad tokens, other sites and unsigned calls', async ({ request, page }) => {
  expect((await request.post('/api/trip/pay', { data: { token: 'x'.repeat(30), kind: 'deposit' } })).status()).toBe(404)
  expect((await request.post('/api/quote/accept', { data: { token: 'x'.repeat(30), name: 'A B', agree: true } })).status()).toBe(404)
  expect((await request.post('/api/quote/accept', { headers: { Origin: 'https://evil.example' }, data: { token: 'x'.repeat(30) } })).status()).toBe(403)
  expect((await request.get('/api/cron/daily')).status()).toBe(401)
  expect((await request.get('/api/cron/daily', { headers: { Authorization: 'Bearer wrong' } })).status()).toBe(401)
  expect((await request.post('/api/webhooks/paystack', { data: { event: 'charge.success', data: { reference: 'PAY-X' } } })).ok()).toBeFalsy()
  expect((await request.post('/api/admin/booking', { data: { action: 'send-quote', id: 1 } })).status()).toBe(403)
  expect((await page.goto('/quote/not-a-real-token-at-all-123'))?.status()).toBe(404)
  expect((await page.goto('/trip/not-a-real-token-at-all-123'))?.status()).toBe(404)
})
