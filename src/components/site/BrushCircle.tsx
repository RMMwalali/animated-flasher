/**
 * Hand-drawn ring (own artwork): two slightly offset loops, like a circle
 * drawn twice with a brush. `progress` (0..1) draws the main loop, used as
 * a loading indicator; omit it for a static ring.
 */
export function BrushCircle({ progress, className = '', strokeWidth = 2.2 }: { progress?: number; className?: string; strokeWidth?: number }) {
  const p = progress == null ? 1 : Math.max(0, Math.min(1, progress))
  return (
    <svg viewBox="0 0 100 100" className={`pointer-events-none ${className}`} aria-hidden="true" focusable="false">
      <path
        d="M52 5 C 77 4, 96 22, 95 49 C 94 76, 74 95, 48 94 C 22 93, 5 74, 6 49 C 7 24, 26 6, 53 7"
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{ strokeDasharray: 1, strokeDashoffset: 1 - p, transition: 'stroke-dashoffset 0.35s ease-out' }}
      />
      <path
        d="M49 9 C 73 9, 91 26, 90 51 C 89 75, 71 91, 47 90 C 25 89, 10 72, 11 50 C 12 29, 27 12, 47 10"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.55}
        strokeLinecap="round"
        opacity={progress == null ? 0.55 : 0.35 * p}
      />
    </svg>
  )
}
