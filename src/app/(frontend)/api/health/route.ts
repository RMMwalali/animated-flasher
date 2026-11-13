import { NextResponse } from 'next/server'
import { getPayloadSafe } from '@/lib/content'

export const dynamic = 'force-dynamic'

/** Liveness + database check for Docker / uptime monitors. */
export async function GET() {
  const payload = await getPayloadSafe()
  let db = false
  if (payload) {
    db = await payload.count({ collection: 'trips', overrideAccess: true }).then(() => true, () => false)
  }
  return NextResponse.json({ ok: true, db }, { status: db ? 200 : 503, headers: { 'Cache-Control': 'no-store' } })
}
