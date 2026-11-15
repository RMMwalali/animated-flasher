import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadSafe, getSettings } from '@/lib/content'

export const dynamic = 'force-dynamic'

/** Records which review site the guest chose, then sends them there. Only links from Business settings are used. */
export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get('t') ?? ''
  const i = Number(req.nextUrl.searchParams.get('p'))
  const settings = await getSettings()
  const platform = ((settings.reviews?.platforms ?? []) as { name: string; url?: string | null; enabled?: boolean | null }[])[i]
  if (!platform?.enabled || !platform.url || !/^https:\/\//.test(platform.url)) return NextResponse.redirect(new URL('/', req.url))
  const payload = await getPayloadSafe()
  if (payload && t.length >= 16) {
    const r = (await payload.find({ collection: 'review-requests', where: { token: { equals: t } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]
    if (r && r.status !== 'opted_out') {
      await payload.update({ collection: 'review-requests', id: r.id, data: { status: 'clicked', clickedAt: new Date().toISOString(), clickedPlatform: platform.name }, overrideAccess: true }).catch(() => undefined)
    }
  }
  return NextResponse.redirect(platform.url, 302)
}
