import { env } from '@/lib/env'

/** IndexNow key file (keyLocation used when pinging on publish). */
export function GET() {
  if (!env.INDEXNOW_KEY) return new Response('Not found', { status: 404 })
  return new Response(env.INDEXNOW_KEY, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
