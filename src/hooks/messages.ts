import type { CollectionAfterChangeHook } from 'payload'
import { publishSafe } from '@/lib/realtime'

/** Keep the conversation summary current and push the message to listeners. */
export const onMessageCreated: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  const convId = typeof doc.conversation === 'object' ? doc.conversation.id : doc.conversation
  const conv = await req.payload.findByID({ collection: 'conversations', id: convId, depth: 0, req, overrideAccess: true })
  const data: Record<string, unknown> = {}
  if (doc.direction !== 'note') {
    data.lastMessageAt = doc.createdAt
    data.lastMessagePreview = doc.preview
    data.lastDirection = doc.direction
  }
  if (doc.direction === 'in') {
    data.unread = (conv.unread ?? 0) + 1
    data.status = 'open'
  } else if (doc.direction === 'out') {
    data.unread = 0
    data.status = conv.status === 'closed' ? 'closed' : 'pending'
  }
  if (Object.keys(data).length) {
    await req.payload.update({ collection: 'conversations', id: convId, data, req, overrideAccess: true, context: { fromMessage: true } })
  }
  const payload = {
    id: doc.id, conversation: convId, direction: doc.direction, channel: doc.channel,
    body: doc.direction === 'note' ? undefined : doc.body, preview: doc.preview, createdAt: doc.createdAt, fromName: doc.fromName,
  }
  await publishSafe('private-inbox', 'message', { ...payload, body: doc.body })
  if (doc.direction !== 'note' && doc.channel === 'chat') await publishSafe(`private-chat-${convId}`, 'message', payload)
  return doc
}
