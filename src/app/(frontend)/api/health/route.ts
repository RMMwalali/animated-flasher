import { NextResponse } from 'next/server'
import { features } from '@/lib/env'
import { getPayloadSafe } from '@/lib/content'

export const dynamic = 'force-dynamic'

/**
 * Liveness + database check for uptime monitors. `problem` says in plain
 * words what is wrong (never any connection details).
 */
export async function GET() {
  let db = false
  let problem: string | undefined
  if (!features.database) {
    problem = 'No database is connected. In Vercel: Storage, connect Neon to this project (Production), then redeploy.'
  } else {
    const payload = await getPayloadSafe()
    if (!payload) problem = 'A database is set but the site could not open it. Check the Neon database is running, then redeploy.'
    else {
      const err = await payload.count({ collection: 'trips', overrideAccess: true }).then(() => null, (e: unknown) => e)
      db = !err
      if (err) {
        const msg = String((err as { message?: string })?.message ?? err)
        problem = /does not exist|relation/i.test(msg)
          ? 'The database is connected but empty: the tables were not created. Redeploy so the setup step runs.'
          : 'The database is connected but did not answer. Check the Neon database is running.'
      }
    }
  }
  return NextResponse.json({ ok: true, db, ...(problem ? { problem } : {}) }, { status: db ? 200 : 503, headers: { 'Cache-Control': 'no-store' } })
}
