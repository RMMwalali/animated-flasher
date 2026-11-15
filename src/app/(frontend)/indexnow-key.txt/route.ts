import { getConfig } from '@/lib/config'

export const dynamic = 'force-dynamic'

/** IndexNow key file (keyLocation used when pinging on publish). */
export async function GET() {
  const key = (await getConfig()).indexNowKey
  if (!key) return new Response('Not found', { status: 404 })
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
