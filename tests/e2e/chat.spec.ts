import { expect, test, type Page } from '@playwright/test'

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
