import { ImageResponse } from 'next/og'
import { brandPaths } from '@/components/brand/paths'

export const dynamic = 'force-dynamic'

/** Newsreader semibold as TTF (the CSS API serves TTF to non-browser clients). */
async function headlineFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch('https://fonts.googleapis.com/css2?family=Newsreader:wght@600', { signal: AbortSignal.timeout(5000) })).text()
    const url = /src: url\((https:[^)]+)\)/.exec(css)?.[1]
    if (!url) return null
    const r = await fetch(url, { signal: AbortSignal.timeout(5000) })
    return r.ok ? r.arrayBuffer() : null
  } catch {
    return null
  }
}

/** Generated share image: cream card, traced acacia + horizon, title in the headline serif. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = (searchParams.get('title') ?? 'Ngina Trails and Safaris').slice(0, 110)
  const font = await headlineFont()
  const [ax, ay, aw, ah] = brandPaths.acacia.box
  const [hx, hy, hw, hh] = brandPaths.horizon.box
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#efece5', padding: 72, color: '#0e2b27', fontFamily: 'Newsreader' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width={150} height={60} viewBox={`${ax} ${ay} ${aw} ${ah}`}><path d={brandPaths.acacia.d} fill="#0f673f" /></svg>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 26, letterSpacing: 4 }}>
            <span style={{ fontSize: 40, letterSpacing: 10, fontWeight: 600 }}>NGINA</span>
            <span>TRAILS &amp; SAFARIS · DIANI BEACH, KENYA</span>
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: title.length > 60 ? 60 : 76, lineHeight: 1.05, fontWeight: 600, maxWidth: 1000 }}>{title}</div>
        <svg width={1056} height={28} viewBox={`${hx} ${hy} ${hw} ${hh}`} preserveAspectRatio="none"><path d={brandPaths.horizon.d} fill="#0e2b27" /></svg>
      </div>
    ),
    { width: 1200, height: 630, fonts: font ? [{ name: 'Newsreader', data: font, weight: 600 }] : undefined },
  )
}
