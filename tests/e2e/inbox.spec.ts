import { randomBytes } from 'node:crypto'
import { expect, test, type APIRequestContext } from '@playwright/test'

const email = process.env.E2E_ADMIN_EMAIL ?? 'admin@ngina.local'
const password = process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD

async function login(request: APIRequestContext) {
  const { token } = (await (await request.post('/api/users/login', { data: { email, password } })).json()) as { token: string }
  return { Authorization: `JWT ${token}` }
}

test.describe('inbox', () => {
  test.skip(!password, 'needs the seeded admin password')
  test.skip(({ isMobile }) => isMobile, 'desktop covers the API flows')

  test('incoming email threads into the right conversation, once', async ({ request }) => {
    const headers = await login(request)
    // throwaway inbound webhook credentials for this run
    const user = `e2e-${randomBytes(4).toString('hex')}`
    const pass = randomBytes(12).toString('hex')
    // other tests save Integrations too, so (re)save the credentials before each attempt
    const saveCreds = () => request.post('/api/globals/integrations', { headers, data: { postmark: { inboundUser: user, inboundPassword: pass } } })
    const auth = { Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}` }
    const conv = (await (await request.get('/api/conversations?limit=1&where[threadKey][exists]=true&depth=0', { headers })).json()).docs[0]
    const id = `<${randomBytes(6).toString('hex')}@e2e.test>`
    const msg = { MessageID: id, From: 'guest@example.com', FromName: 'E2E Guest', Subject: 'Re: plan', MailboxHash: conv.threadKey, TextBody: 'Two adults please.\n\nOn Mon wrote:\n> old' }
    await expect.poll(async () => { await saveCreds(); return (await request.post('/api/webhooks/postmark-inbound', { headers: auth, data: msg })).status() }, { timeout: 40_000, intervals: [2000] }).toBe(200)
    expect((await (await request.post('/api/webhooks/postmark-inbound', { headers: auth, data: msg })).json()).status).toBe('duplicate')
    const last = (await (await request.get(`/api/messages?where[conversation][equals]=${conv.id}&sort=-createdAt&limit=1`, { headers })).json()).docs[0]
    expect(last).toMatchObject({ direction: 'in', fromEmail: 'guest@example.com' })
    expect(last.body).toContain('Two adults please.')
    expect(last.body).not.toContain('old')
    // a stranger (e.g. forwarded from Gmail) gets a new contact and conversation
    const stranger = `new-${randomBytes(3).toString('hex')}@example.com`
    const r = await (await request.post('/api/webhooks/postmark-inbound', { headers: auth, data: { MessageID: `<${randomBytes(6).toString('hex')}@e2e>`, From: stranger, FromName: 'New Person', Subject: 'Safari question', TextBody: 'Do you go to Tsavo?' } })).json()
    expect(r.status).toBe('logged')
    const c = (await (await request.get(`/api/contacts?where[email][equals]=${stranger}`, { headers })).json()).docs[0]
    expect(c.firstName).toBe('New')
    expect((await request.post('/api/webhooks/postmark-inbound', { headers: { Authorization: `Basic ${Buffer.from(`${user}:not-the-password`).toString('base64')}` }, data: msg })).status()).toBe(401)
    await request.post('/api/globals/integrations', { headers, data: { postmark: { inboundUser: '', inboundPassword: '' } } })
  })

  test('agent replies, notes and logs a WhatsApp chat from the Inbox', async ({ page, request }) => {
    const headers = await login(request)
    await page.goto('/admin/login')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/password/i).fill(password!)
    await page.getByRole('button', { name: /log ?in/i }).click()
    await page.waitForURL(/\/admin(?!\/login)/)
    await page.goto('/admin/inbox')
    await page.getByRole('tab', { name: 'All' }).click()
    await page.locator('.ng-inbox__item').first().click()
    await expect(page.locator('.ng-inbox__head h2')).toBeVisible()
    await page.getByRole('tab', { name: 'Internal note' }).click()
    await page.getByRole('textbox', { name: 'Internal note' }).fill('E2E note: guest prefers WhatsApp')
    await page.getByRole('button', { name: 'Add note' }).click()
    await expect(page.locator('.ng-msg--note').filter({ hasText: 'E2E note: guest prefers WhatsApp' })).toBeVisible()
    await page.getByRole('tab', { name: 'Reply by email' }).click()
    await page.getByRole('textbox', { name: 'Reply' }).fill('Jambo! Here are the dates.')
    await page.getByRole('button', { name: /^(Send|Save)$/ }).click()
    await expect(page.locator('.ng-msg--out').filter({ hasText: 'Jambo! Here are the dates.' })).toBeVisible()

    const contact = (await (await request.get('/api/contacts?limit=1&depth=0&sort=createdAt', { headers })).json()).docs[0]
    await page.getByRole('button', { name: 'Log WhatsApp / call' }).click()
    await page.getByLabel('Search guests').fill(contact.fullName.slice(0, 6))
    await page.locator('.ng-inbox__results').getByRole('button', { name: new RegExp(contact.fullName) }).first().click()
    await page.locator('.ng-inbox__panel').getByRole('textbox', { name: 'Message' }).fill('Guest asked about child prices on WhatsApp')
    await page.getByRole('button', { name: 'Save to the Inbox' }).click()
    await expect(page.locator('.ng-msg').filter({ hasText: 'Guest asked about child prices on WhatsApp' })).toBeVisible()
  })
})
