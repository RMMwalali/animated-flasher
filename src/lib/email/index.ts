import { env, features } from '@/lib/env'
import { renderEmail, type EmailContent } from './template'

export type OutgoingEmail = {
  to: string
  subject: string
  content: EmailContent
  replyTo?: string
  tag?: string
  headers?: Record<string, string>
  metadata?: Record<string, string>
}

export type SendResult = { status: 'sent' | 'logged' | 'failed'; messageId?: string; error?: string }

interface EmailProvider {
  send(e: OutgoingEmail & { html: string; text: string }): Promise<SendResult>
}

const postmarkProvider: EmailProvider = {
  async send(e) {
    const { ServerClient } = await import('postmark')
    const client = new ServerClient(env.POSTMARK_SERVER_TOKEN!)
    try {
      const res = await client.sendEmail({
        From: env.POSTMARK_FROM_EMAIL!,
        To: e.to,
        Subject: e.subject,
        HtmlBody: e.html,
        TextBody: e.text,
        ReplyTo: e.replyTo,
        Tag: e.tag,
        MessageStream: env.POSTMARK_MESSAGE_STREAM,
        Headers: e.headers ? Object.entries(e.headers).map(([Name, Value]) => ({ Name, Value })) : undefined,
        Metadata: e.metadata,
        TrackOpens: false,
      })
      return { status: 'sent', messageId: res.MessageID }
    } catch (err) {
      return { status: 'failed', error: err instanceof Error ? err.message : String(err) }
    }
  },
}

/** Used when Postmark is not configured: the email is logged, not sent. */
const logProvider: EmailProvider = {
  async send(e) {
    console.info(`[email:logged] to=${e.to} subject="${e.subject}"\n${e.text.slice(0, 600)}`)
    return { status: 'logged' }
  },
}

export async function sendEmail(e: OutgoingEmail): Promise<SendResult> {
  const { html, text } = renderEmail(e.content)
  const provider = features.email ? postmarkProvider : logProvider
  return provider.send({ ...e, html, text })
}

/** Reply-to address that threads guest replies back into a conversation. */
export function threadReplyTo(threadKey: string): string | undefined {
  const inbound = env.POSTMARK_INBOUND_ADDRESS
  if (!inbound || !inbound.includes('@')) return undefined
  const [local, domain] = inbound.split('@')
  return `${local}+${threadKey}@${domain}`
}
