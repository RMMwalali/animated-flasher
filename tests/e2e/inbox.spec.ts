import { randomBytes } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'
import { adminHeaders } from './admin'

const password = process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD


test.describe('inbox', () => {
  test.skip(!password, 'needs the seeded admin password')
  test.skip(({ isMobile }) => isMobile, 'desktop covers the API flows')

  test('incoming email threads into the right conversation, once', async ({ request }) => {
    const headers = adminHeaders()
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

  // in this file so it runs one after the other with the inbound-email test (both change the same setting)
  test('saving the Integrations page again never destroys a stored key', async ({ request }) => {
    const headers = adminHeaders()
    const user = `keep-${randomBytes(3).toString('hex')}`
    const pass = randomBytes(10).toString('hex')
    const webhook = () => request.post('/api/webhooks/postmark-inbound', {
      headers: { Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}` },
      data: { From: `keep-${randomBytes(3).toString('hex')}@example.com`, TextBody: 'key check', MessageID: `<${randomBytes(6).toString('hex')}@e2e>` },
    })
    await request.post('/api/globals/integrations', { headers, data: { postmark: { inboundUser: user, inboundPassword: pass } } })
    // an unrelated change, then a full save of what the admin screen shows (masked keys)
    await request.post('/api/globals/integrations', { headers, data: { indexNow: { key: '' } } })
    const shown = await (await request.get('/api/globals/integrations', { headers })).json()
    expect(shown.postmark.inboundPassword).toMatch(/^•+/)
    await request.post('/api/globals/integrations', { headers, data: shown })
    // the stored password still works
    await expect.poll(async () => (await webhook()).status(), { timeout: 40_000, intervals: [2000] }).toBe(200)
    await request.post('/api/globals/integrations', { headers, data: { postmark: { inboundUser: '', inboundPassword: '' } } })
  })

  test('agent replies, notes and logs a WhatsApp chat from the Inbox', async ({ page, request }) => {
    // a throwaway agent of its own: parallel tests signing in as the shared admin can retire each other's sessions
    const admin = adminHeaders()
    const agentEmail = `agent-${randomBytes(4).toString('hex')}@example.com`
    const agentPass = randomBytes(12).toString('base64url') // random for each run
    const created = await request.post('/api/users', { headers: admin, data: { email: agentEmail, password: agentPass, name: 'E2E Agent', roles: ['sales'] } })
    expect(created.ok(), await created.text()).toBeTruthy()
    const agentId = (await created.json()).doc.id
    const agentToken = ((await (await request.post('/api/users/login', { data: { email: agentEmail, password: agentPass } })).json()) as { token: string }).token
    const agent = { Authorization: `JWT ${agentToken}` }
    await page.goto('/admin/login')
    await page.getByLabel(/email/i).fill(agentEmail)
    await page.getByLabel(/password/i).fill(agentPass)
    await page.getByRole('button', { name: /log ?in/i }).click()
    await page.waitForURL(/\/admin(?!\/login)/)
    await page.goto('/admin/inbox')
    await page.getByRole('tab', { name: 'All' }).click()
    await page.locator('.ng-inbox__item').first().click()
    await expect(page.locator('.ng-inbox__head h2')).toBeVisible()
    await page.getByRole('tab', { name: 'Internal note' }).click()
    const note = `E2E note ${randomBytes(3).toString('hex')}: guest prefers WhatsApp`
    await page.getByRole('textbox', { name: 'Internal note' }).fill(note)
    await page.getByRole('button', { name: 'Add note' }).click()
    await expect(page.locator('.ng-msg--note').filter({ hasText: note })).toBeVisible()
    await page.getByRole('tab', { name: 'Reply by email' }).click()
    const reply = `Jambo! Here are the dates (${randomBytes(3).toString('hex')}).`
    await page.getByRole('textbox', { name: 'Reply' }).fill(reply)
    await page.getByRole('button', { name: /^(Send|Save)$/ }).click()
    await expect(page.locator('.ng-msg--out').filter({ hasText: reply })).toBeVisible()

    const cr = await request.get('/api/contacts?limit=1&depth=0&sort=createdAt', { headers: agent })
    const cj = await cr.json()
    expect(cr.ok(), `contacts lookup: ${cr.status()} ${JSON.stringify(cj).slice(0, 200)}`).toBeTruthy()
    const contact = cj.docs[0]
    await page.getByRole('button', { name: 'Log WhatsApp / call' }).click()
    await page.getByLabel('Search guests').fill(contact.fullName.slice(0, 6))
    await page.locator('.ng-inbox__results').getByRole('button', { name: new RegExp(contact.fullName) }).first().click()
    const said = `Guest asked about child prices on WhatsApp (${randomBytes(3).toString('hex')})`
    await page.locator('.ng-inbox__panel').getByRole('textbox', { name: 'Message' }).fill(said)
    await page.getByRole('button', { name: 'Save to the Inbox' }).click()
    await expect(page.locator('.ng-msg').filter({ hasText: said })).toBeVisible()
    await request.patch(`/api/users/${agentId}`, { headers: adminHeaders(), data: { active: false } })
  })
})

const openChat = async (page: Page) => {
  await page.getByRole('button', { name: 'Chat with us' }).click()
  const panel = page.getByRole('dialog', { name: /live chat/i })
  await expect(panel).toBeVisible()
  return panel
}

// In this file, after the Inbox tests: an open Inbox marks the team online, so these
// must not run at the same time as the Inbox UI test.
test.describe('live chat (runs after the Inbox tests: they share the "team online" status)', () => {
  test.skip(!password, 'needs the seeded admin password')
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('ngina-consent', JSON.stringify({ analytics: false, at: '' }))
      sessionStorage.setItem('ngina-intro', '1')
    })
  })
  // both tests set the shared "team online" status, so only one browser runs them
  test.skip(({ isMobile }) => isMobile, 'desktop; the phone layout has its own test')

  test('while the team is away, the chat asks for an email, and the message reaches the Inbox', async ({ page, request }) => {
    const headers = adminHeaders()
    await request.post('/api/globals/chat-status', { headers, data: { teamSeenAt: new Date(Date.now() - 10 * 60_000).toISOString() } })
    await page.goto('/destinations')
    const panel = await openChat(page)
    await expect(panel.getByText('Away: we reply by email')).toBeVisible()
    await panel.getByLabel('Message', { exact: true }).fill('Hello, is Amboseli good in April?')
    await panel.getByRole('button', { name: 'Send message' }).click()
    await expect(panel.getByRole('alert')).toContainText(/add your email/i)
    const stamp = Date.now()
    await panel.getByLabel('Your name').fill('Chat Away Guest')
    await panel.getByLabel(/Your email/).fill(`e2e+chat${stamp}@example.com`)
    await panel.getByRole('button', { name: 'Send message' }).click()
    await expect(panel.getByText('Hello, is Amboseli good in April?')).toBeVisible()
    await expect(panel.getByText(/team is away from the chat right now/)).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)

    const conv = (await (await request.get(`/api/conversations?where[channel][equals]=chat&where[subject][equals]=${encodeURIComponent('Live chat: Chat Away Guest')}&sort=-createdAt&depth=1`, { headers })).json()).docs[0]
    expect(conv.status).toBe('open')
    expect(conv.contact.email).toBe(`e2e+chat${stamp}@example.com`)
    expect(conv.source.page).toBe('/destinations')
  })

  test('the team replies from the Inbox and the visitor sees it live', async ({ page, request }) => {
    const headers = adminHeaders()
    // the Inbox is open somewhere: the team is online
    expect((await request.post('/api/admin/inbox', { headers, data: { action: 'presence' } })).ok()).toBeTruthy()
    await page.goto('/')
    const panel = await openChat(page)
    await expect(panel.getByText('We are online')).toBeVisible()
    const text = `Do you do day trips to Wasini? ${Date.now()}`
    await panel.getByLabel('Message', { exact: true }).fill(text)
    await panel.getByLabel('Message', { exact: true }).press('Enter')
    await expect(panel.getByText(text)).toBeVisible()
    await expect(panel.getByText(/team is away/)).toHaveCount(0)

    const find = async () => (await (await request.get(`/api/messages?where[body][equals]=${encodeURIComponent(text)}&depth=0`, { headers })).json()).docs?.[0]
    await expect.poll(find, { timeout: 10_000 }).toBeTruthy()
    const msg = await find()
    expect(msg.channel).toBe('chat')
    const reply = await request.post('/api/admin/inbox', { headers, data: { action: 'reply', conversationId: msg.conversation, body: 'Yes, every day from Shimoni. Karibu!' } })
    const r = (await reply.json()) as { ok: boolean; delivery?: string }
    expect(r.ok).toBe(true)
    expect(r.delivery).toBe('live')
    await expect(panel.getByText('Yes, every day from Shimoni. Karibu!')).toBeVisible({ timeout: 10_000 })

    // the chat continues after a page change (same visitor)
    await page.goto('/contact')
    const again = await openChat(page)
    await expect(again.getByText(text)).toBeVisible()
    await again.getByRole('button', { name: 'Close the chat' }).click()
    await expect(again).toBeHidden()
  })
})

