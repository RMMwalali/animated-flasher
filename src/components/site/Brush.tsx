/**
 * Hand-drawn brush underlines (own artwork), several variants chosen
 * deterministically from the word so server and client agree.
 */
const PATHS = [
  'M2 14 C 40 6, 90 4, 140 8 S 230 16, 298 7',
  'M3 10 C 60 16, 120 3, 180 9 S 260 15, 297 6',
  'M2 12 C 50 4, 110 14, 170 8 C 220 4, 260 12, 298 9',
  'M4 9 C 70 13, 140 5, 200 10 S 270 8, 296 13',
]

export const brushVariant = (seed: string) => {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h % PATHS.length
}

export function Brush({ seed, className = '', draw = true }: { seed: string; className?: string; draw?: boolean }) {
  const d = PATHS[brushVariant(seed)]
  return (
    <svg className={`brush pointer-events-none ${className}`} data-draw={draw ? '' : undefined} viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={d} pathLength={1} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
