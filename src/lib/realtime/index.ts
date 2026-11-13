import { env, features } from '@/lib/env'

/**
 * Real-time events behind one small interface. Pusher or Ably when
 * configured; otherwise `none` and clients poll. Channel names:
 *  - private-inbox            all staff (new message / conversation updated)
 *  - private-chat-<convId>    one visitor chat
 */
export type RealtimeEvent = 'message' | 'conversation'

interface RealtimeProvider {
  publish(channel: string, event: RealtimeEvent, data: unknown): Promise<void>
  /** Sign a private-channel subscription (Pusher) or issue a token (Ably). */
  authorize(channel: string, socketId?: string): Promise<unknown>
}

let pusherClient: import('pusher') | null = null
async function pusher() {
  if (!pusherClient) {
    const Pusher = (await import('pusher')).default
    pusherClient = new Pusher({ appId: env.PUSHER_APP_ID!, key: env.PUSHER_KEY!, secret: env.PUSHER_SECRET!, cluster: env.PUSHER_CLUSTER ?? 'eu', useTLS: true })
  }
  return pusherClient
}

const pusherProvider: RealtimeProvider = {
  async publish(channel, event, data) {
    await (await pusher()).trigger(channel, event, data)
  },
  async authorize(channel, socketId) {
    if (!socketId) throw new Error('socket id required')
    return (await pusher()).authorizeChannel(socketId, channel)
  },
}

const ablyAuth = () => 'Basic ' + Buffer.from(env.ABLY_API_KEY!).toString('base64')
const ablyProvider: RealtimeProvider = {
  async publish(channel, event, data) {
    await fetch(`https://rest.ably.io/channels/${encodeURIComponent(channel)}/messages`, {
      method: 'POST',
      headers: { Authorization: ablyAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: event, data: JSON.stringify(data) }),
      signal: AbortSignal.timeout(4000),
    })
  },
  async authorize(channel) {
    const keyName = env.ABLY_API_KEY!.split(':')[0]
    const res = await fetch(`https://rest.ably.io/keys/${encodeURIComponent(keyName)}/requestToken`, {
      method: 'POST',
      headers: { Authorization: ablyAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyName, timestamp: Date.now(), capability: JSON.stringify({ [channel]: ['subscribe'] }), ttl: 60 * 60 * 1000 }),
    })
    if (!res.ok) throw new Error('ably token failed')
    const t = (await res.json()) as { token: string }
    return { token: t.token }
  },
}

const noneProvider: RealtimeProvider = {
  async publish() {},
  async authorize() {
    return null
  },
}

export function realtime(): RealtimeProvider {
  if (features.realtime === 'pusher') return pusherProvider
  if (features.realtime === 'ably') return ablyProvider
  return noneProvider
}

/** Never let a real-time failure break the request that caused it. */
export async function publishSafe(channel: string, event: RealtimeEvent, data: unknown) {
  try {
    await realtime().publish(channel, event, data)
  } catch (e) {
    console.warn('[realtime] publish failed', e)
  }
}

/** Public client config (no secrets). */
export const realtimeClientConfig = () => ({
  provider: features.realtime,
  pusherKey: features.realtime === 'pusher' ? env.PUSHER_KEY : undefined,
  pusherCluster: features.realtime === 'pusher' ? (env.PUSHER_CLUSTER ?? 'eu') : undefined,
})
