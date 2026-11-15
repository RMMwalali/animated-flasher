import type { NextRequest } from 'next/server'
import { isAdmin } from '@/access'
import { json, sameOrigin } from '@/lib/booking/http'
import { getConfig, invalidateConfig } from '@/lib/config'
import { getPayloadSafe } from '@/lib/content'
import { testService } from '@/lib/integrations/test'

export const dynamic = 'force-dynamic'

/** Admin-only: check that a saved key works. Never returns the key. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ ok: false, message: 'Bad origin.' }, 403)
  const payload = await getPayloadSafe()
  if (!payload) return json({ ok: false, message: 'No database connected.' }, 503)
  const { user } = await payload.auth({ headers: req.headers })
  if (!user || !isAdmin(user as never)) return json({ ok: false, message: 'Admins only.' }, 403)
  const { service } = (await req.json().catch(() => ({}))) as { service?: string }
  invalidateConfig()
  try {
    return json(await testService(String(service), await getConfig(payload)))
  } catch (e) {
    return json({ ok: false, message: `Could not reach the service: ${(e as Error).message}` })
  }
}
