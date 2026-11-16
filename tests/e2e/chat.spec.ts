import { expect, test, type Page } from '@playwright/test'
import { adminHeaders } from './admin'

const hasAdmin = Boolean(process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD)

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ngina-consent', JSON.stringify({ analytics: false, at: '' }))
    sessionStorage.setItem('ngina-intro', '1')
  })
})

const openChat = async (page: Page) => {
  await page.getByRole('button', { name: 'Chat with us' }).click()
  const panel = page.getByRole('dialog', { name: /live chat/i })
  await expect(panel).toBeVisible()
  return panel
}

// these change the shared "team online" status, so they run one after the other
test.describe.configure({ mode: 'serial' })

test.describe('live chat', () => {
  test.skip(!hasAdmin, 'needs the seeded admin password')
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

test('the chat button can be hidden for the visit', async ({ page }) => {
  await page.goto('/')
  const launcher = page.getByRole('button', { name: 'Chat with us' })
  test.skip((await launcher.count()) === 0, 'chat needs a database')
  await page.getByRole('button', { name: 'Hide the chat button' }).click()
  await expect(launcher).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Chat with us' })).toHaveCount(0)
  // WhatsApp stays
  await expect(page.locator('[data-whatsapp]')).toBeVisible()
})

test('chat refuses other sites and empty messages', async ({ request }) => {
  expect((await request.post('/api/chat', { headers: { Origin: 'https://evil.example' }, data: { action: 'start', message: 'hi' } })).status()).toBe(403)
  expect((await request.post('/api/chat', { data: { action: 'start', message: '' } })).status()).toBe(400)
  expect((await request.post('/api/chat', { data: { action: 'send', message: 'hi' } })).status()).toBe(404)
})

test('on a phone the chat fills the screen and closes again', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone layout')
  await page.goto('/')
  const launcher = page.getByRole('button', { name: 'Chat with us' })
  test.skip((await launcher.count()) === 0, 'chat needs a database')
  const panel = await openChat(page)
  const box = (await panel.boundingBox())!
  const vw = page.viewportSize()!.width
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(vw)
  await expect(panel.getByLabel('Message', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
})
