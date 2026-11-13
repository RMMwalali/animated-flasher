import { ImageResponse } from 'next/og'
import { brandPaths } from '@/components/brand/paths'

export const dynamic = 'force-dynamic'

/** Generated share image: cream card, traced acacia + horizon, title in Fredoka. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = (searchParams.get('title') ?? 'Ngina Trails & Safaris').slice(0, 110)
  const font = await fetch('https://fonts.gstatic.com/s/fredoka/v14/X7nP4b87HvSqjb_WIi2yDCRwoQ_k7367_B-i2yQag0-mac3OryLMFuOLlNldbw.ttf')
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .catch(() => null)
  const [ax, ay, aw, ah] = brandPaths.acacia.box
  const [hx, hy, hw, hh] = brandPaths.horizon.box
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#efece5', padding: 72, color: '#0e2b27', fontFamily: 'Fredoka' }}>
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
    { width: 1200, height: 630, fonts: font ? [{ name: 'Fredoka', data: font, weight: 600 }] : undefined },
  )
}
