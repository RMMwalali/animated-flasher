import { getConfig, type RuntimeConfig } from '@/lib/config'

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

let pusherClient: { sig: string; client: import('pusher') } | null = null
async function pusher() {
  const c = (await getConfig()).realtime
  const sig = `${c.pusherAppId}:${c.pusherKey}:${c.pusherCluster}:${c.pusherSecret?.slice(-4)}`
  if (!pusherClient || pusherClient.sig !== sig) {
    const Pusher = (await import('pusher')).default
    pusherClient = { sig, client: new Pusher({ appId: c.pusherAppId!, key: c.pusherKey!, secret: c.pusherSecret!, cluster: c.pusherCluster, useTLS: true }) }
  }
  return pusherClient.client
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

const ablyKey = async () => (await getConfig()).realtime.ablyApiKey!
const ablyAuth = async () => 'Basic ' + Buffer.from(await ablyKey()).toString('base64')
const ablyProvider: RealtimeProvider = {
  async publish(channel, event, data) {
    await fetch(`https://rest.ably.io/channels/${encodeURIComponent(channel)}/messages`, {
      method: 'POST',
      headers: { Authorization: await ablyAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: event, data: JSON.stringify(data) }),
      signal: AbortSignal.timeout(4000),
    })
  },
  async authorize(channel) {
    const keyName = (await ablyKey()).split(':')[0]
    const res = await fetch(`https://rest.ably.io/keys/${encodeURIComponent(keyName)}/requestToken`, {
      method: 'POST',
      headers: { Authorization: await ablyAuth(), 'Content-Type': 'application/json' },
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

export async function realtime(): Promise<RealtimeProvider> {
  const kind = (await getConfig()).realtime.provider
  if (kind === 'pusher') return pusherProvider
  if (kind === 'ably') return ablyProvider
  return noneProvider
}

/** Never let a real-time failure break the request that caused it. */
export async function publishSafe(channel: string, event: RealtimeEvent, data: unknown) {
  try {
    await (await realtime()).publish(channel, event, data)
  } catch (e) {
    console.warn('[realtime] publish failed', e)
  }
}

/** Public client config (no secrets). */
export const realtimeClientConfig = async () => {
  const c: RuntimeConfig['realtime'] = (await getConfig()).realtime
  return {
    provider: c.provider,
    pusherKey: c.provider === 'pusher' ? c.pusherKey : undefined,
    pusherCluster: c.provider === 'pusher' ? c.pusherCluster : undefined,
  }
}
