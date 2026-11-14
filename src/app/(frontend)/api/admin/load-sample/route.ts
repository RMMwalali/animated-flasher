import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin } from '@/access'
import { getPayloadSafe } from '@/lib/content'
import { seedContent } from '@/lib/seed/content'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Admin-only: load the sample content (photos, journeys, destinations,
 * pages…) into the database from the back office. Never overwrites the
 * owner's Home page or Business settings, never creates logins or demo guests.
 */
export async function POST(req: NextRequest) {
  const payload = await getPayloadSafe()
  if (!payload) return NextResponse.json({ ok: false, error: 'No database connected.' }, { status: 503 })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user || !isAdmin(user as never)) return NextResponse.json({ ok: false, error: 'Admins only.' }, { status: 403 })

  const origin = req.nextUrl.origin
  try {
    const res = await seedContent(payload, {
      overwriteGlobals: false,
      log: (m) => payload.logger.info(`[load-sample] ${m}`),
      loadPhoto: async (url, name) => {
        const r = await fetch(new URL(url, origin), { signal: AbortSignal.timeout(30_000) })
        if (!r.ok) throw new Error(`could not fetch ${url} (${r.status})`)
        const data = Buffer.from(await r.arrayBuffer())
        return { file: { data, mimetype: r.headers.get('content-type') || 'image/webp', name, size: data.length } }
      },
    })
    try {
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/', 'layout')
    } catch {}
    return NextResponse.json({ ok: true, ...{ photos: res.photos, created: res.created, skipped: res.skipped } })
  } catch (e) {
    payload.logger.error(`load-sample failed: ${(e as Error).message}`)
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
