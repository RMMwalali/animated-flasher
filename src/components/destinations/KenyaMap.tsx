import { brandPaths } from '@/components/brand/paths'
import type { DestinationVM } from '@/lib/content'
import { KENYA, project } from './kenya'

const [ax, ay, aw, ah] = brandPaths.acacia.box
/** Which side each label sits on, to keep the coast cluster readable. */
const LEFT = new Set(['tsavo-west', 'amboseli', 'maasai-mara', 'lake-nakuru', 'shimba-hills', 'wasini-kisite'])

/**
 * Kenya with every destination pinned at its real coordinates. Dashed
 * routes run from Diani (home) to each place and draw in on reveal.
 * Each pin is a link with an accessible name.
 */
export function KenyaMap({ destinations, className = '' }: { destinations: DestinationVM[]; className?: string }) {
  const pins = destinations.filter((d) => d.lat != null && d.lng != null)
  const home = pins.find((d) => d.slug === 'diani')
  const h = home ? project(home.lat!, home.lng!) : null
  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${KENYA.width} ${KENYA.height}`} className="h-auto w-full" role="group" aria-label="Map of Kenya showing our destinations">
        <defs>
          <pattern id="sea" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M0 12 q6 -5 12 0 t12 0" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-teal/30" />
          </pattern>
        </defs>
        {/* Indian Ocean hint to the south-east */}
        <rect x="560" y="700" width="440" height="502" fill="url(#sea)" opacity="0.8" />
        <path d={KENYA.d} className="fill-paper stroke-deep" strokeWidth="2.5" strokeLinejoin="round" />
        {h && (
          <g className="brush" data-draw="" aria-hidden="true">
            {pins
              .filter((d) => d.slug !== 'diani')
              .map((d) => {
                const p = project(d.lat!, d.lng!)
                const mx = (h.x + p.x) / 2 + (p.y - h.y) * 0.18
                const my = (h.y + p.y) / 2 - (p.x - h.x) * 0.18
                return <path key={d.slug} d={`M${h.x} ${h.y} Q${mx} ${my} ${p.x} ${p.y}`} pathLength={1} fill="none" stroke="currentColor" strokeWidth="2" className="text-orange/70" />
              })}
          </g>
        )}
        {pins.map((d) => {
          const p = project(d.lat!, d.lng!)
          const isHome = d.slug === 'diani'
          const right = !LEFT.has(d.slug)
          return (
            <a key={d.slug} href={`/destinations/${d.slug}`} className="map-pin group" aria-label={`${d.name}${isHome ? ' (our home)' : ''}`}>
              {d.region === 'coast' || isHome ? (
                <circle cx={p.x} cy={p.y} r={isHome ? 13 : 9} className={isHome ? 'fill-orange-600 stroke-cream' : 'fill-teal-ink stroke-cream'} strokeWidth="3" />
              ) : (
                <svg x={p.x - 22} y={p.y - 22} width="44" height="26" viewBox={`${ax} ${ay} ${aw} ${ah}`} className="text-green transition-colors group-hover:text-orange-600">
                  <path d={brandPaths.acacia.d} fill="currentColor" fillRule="evenodd" />
                </svg>
              )}
              <text x={right ? p.x + 18 : p.x - 18} y={p.y + 6} textAnchor={right ? 'start' : 'end'} className="fill-deep font-sans text-[22px] font-semibold group-hover:fill-orange-600 group-focus-visible:fill-orange-600">
                {d.slug === 'wasini-kisite' ? 'Wasini & Kisite' : d.name}
              </text>
              {isHome && (
                <text x={p.x + 18} y={p.y + 30} className="fill-orange-600 font-mono text-[15px] uppercase tracking-[0.14em]">Our home</text>
              )}
            </a>
          )
        })}
      </svg>
      <figcaption className="mt-3 font-mono text-xs uppercase tracking-[0.12em] opacity-75">Map: Natural Earth. Positions are approximate.</figcaption>
    </figure>
  )
}
