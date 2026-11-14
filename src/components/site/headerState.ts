/**
 * Header visibility with hysteresis (pure, unit-tested).
 * While shown we remember the lowest scroll position; once the page is
 * HIDE_AFTER px further down, the header hides. While hidden we remember the
 * highest position; once the visitor scrolls SHOW_AFTER px back up, it shows.
 * Small jitters from smooth scrolling never cross either threshold.
 */
export type HeaderState = { last: number; anchor: number; hidden: boolean; solid: boolean }

export const HIDE_AFTER = 64
export const SHOW_AFTER = 24
export const TOP_ZONE = 120 // always visible near the top

export const initialHeaderState = (y: number): HeaderState => ({ last: y, anchor: y, hidden: false, solid: false })

export function nextHeaderState(s: HeaderState, y: number, viewport: number): HeaderState {
  let { hidden, anchor } = s
  if (y < TOP_ZONE) {
    hidden = false
    anchor = y
  } else if (!hidden) {
    anchor = Math.min(anchor, y) // lowest point while shown
    if (y - anchor >= HIDE_AFTER) {
      hidden = true
      anchor = y
    }
  } else {
    anchor = Math.max(anchor, y) // highest point while hidden
    if (anchor - y >= SHOW_AFTER) {
      hidden = false
      anchor = y
    }
  }
  // light/dark switch with a 40px band so it cannot flicker at the boundary
  const edge = viewport * 0.6
  const solid = s.solid ? y > edge - 40 : y > edge + 40
  return { last: y, anchor, hidden, solid }
}
