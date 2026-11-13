import type { EmailAdapter } from 'payload'
import { env, features } from '@/lib/env'

/** Payload's own emails (password reset, etc.) through Postmark, or the log. */
export const postmarkAdapter: EmailAdapter = () => ({
  name: 'postmark',
  defaultFromAddress: env.POSTMARK_FROM_EMAIL ?? 'no-reply@localhost',
  defaultFromName: 'Ngina Trails & Safaris',
  async sendEmail(message) {
    const to = Array.isArray(message.to) ? message.to.join(',') : String(message.to)
    if (!features.email) {
      console.info(`[email:logged] (payload) to=${to} subject="${message.subject}"`)
      return { logged: true }
    }
    const { ServerClient } = await import('postmark')
    const client = new ServerClient(env.POSTMARK_SERVER_TOKEN!)
    return client.sendEmail({
      From: env.POSTMARK_FROM_EMAIL!,
      To: to,
      Subject: String(message.subject ?? ''),
      HtmlBody: typeof message.html === 'string' ? message.html : undefined,
      TextBody: typeof message.text === 'string' ? message.text : undefined,
      MessageStream: env.POSTMARK_MESSAGE_STREAM,
    })
  },
})
