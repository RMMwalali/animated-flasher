import { getConfig, type RuntimeConfig } from '@/lib/config'
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
  send(e: OutgoingEmail & { html: string; text: string }, c: RuntimeConfig['postmark']): Promise<SendResult>
}

const postmarkProvider: EmailProvider = {
  async send(e, c) {
    const { ServerClient } = await import('postmark')
    const client = new ServerClient(c.serverToken!)
    try {
      const res = await client.sendEmail({
        From: c.fromEmail!,
        To: e.to,
        Subject: e.subject,
        HtmlBody: e.html,
        TextBody: e.text,
        ReplyTo: e.replyTo,
        Tag: e.tag,
        MessageStream: c.messageStream,
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
  const c = (await getConfig()).postmark
  const provider = c.serverToken && c.fromEmail ? postmarkProvider : logProvider
  return provider.send({ ...e, html, text }, c)
}

/** Reply-to address that threads guest replies back into a conversation. */
export async function threadReplyTo(threadKey: string): Promise<string | undefined> {
  const inbound = (await getConfig()).postmark.inboundAddress
  if (!inbound || !inbound.includes('@')) return undefined
  const [local, domain] = inbound.split('@')
  return `${local}+${threadKey}@${domain}`
}
