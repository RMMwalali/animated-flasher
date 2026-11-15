import type { EmailAdapter } from 'payload'
import { getConfig } from '@/lib/config'

/** Payload's own emails (password reset, etc.) through Postmark, or the log. */
export const postmarkAdapter: EmailAdapter = () => ({
  name: 'postmark',
  defaultFromAddress: process.env.POSTMARK_FROM_EMAIL ?? 'no-reply@localhost',
  defaultFromName: 'Ngina Trails and Safaris',
  async sendEmail(message) {
    const to = Array.isArray(message.to) ? message.to.join(',') : String(message.to)
    const c = (await getConfig()).postmark
    if (!c.serverToken || !c.fromEmail) {
      console.info(`[email:logged] (payload) to=${to} subject="${message.subject}"`)
      return { logged: true }
    }
    const { ServerClient } = await import('postmark')
    const client = new ServerClient(c.serverToken)
    return client.sendEmail({
      From: c.fromEmail,
      To: to,
      Subject: String(message.subject ?? ''),
      HtmlBody: typeof message.html === 'string' ? message.html : undefined,
      TextBody: typeof message.text === 'string' ? message.text : undefined,
      MessageStream: c.messageStream,
    })
  },
})
