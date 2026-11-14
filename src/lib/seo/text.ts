/** Automatic search titles, descriptions and map pins. Pure: unit-tested. */

/** The business name as it must appear everywhere (listings, Google, AI). */
export const SITE_NAME = 'Ngina Trails and Safaris'

/** Google shows roughly this many characters of a title / description. */
export const TITLE_MAX = 60
export const DESCRIPTION_MAX = 155

/** Collapse whitespace and cut at a word boundary, adding "…" when shortened. */
export function clampText(s: string | null | undefined, max = DESCRIPTION_MAX): string {
  const t = (s ?? '').replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  const at = cut.lastIndexOf(' ')
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.\-–·]+$/, '')}…`
}

/**
 * The page title Google sees. The site name is added ("Title · Ngina…")
 * unless the title already contains it or the result would be too long to
 * show in full, in which case the page title stands alone.
 */
export function searchTitle(title: string, siteName: string, sep = ' · '): { text: string; withSiteName: boolean } {
  const t = title.replace(/\s+/g, ' ').trim()
  if (!t) return { text: siteName, withSiteName: false }
  if (t.toLowerCase().includes(siteName.toLowerCase())) return { text: t, withSiteName: false }
  const full = `${t}${sep}${siteName}`
  return full.length <= TITLE_MAX + 5 ? { text: full, withSiteName: true } : { text: t, withSiteName: false }
}

/**
 * Coordinates from a pasted Google Maps link. Prefers the pin of a place
 * (`!3d…!4d…`) over the map centre (`@lat,lng`). Returns null when the link
 * has none (e.g. a maps.app.goo.gl short link before it is expanded).
 */
export function coordsFromMapsUrl(url: string | null | undefined): { lat: number; lng: number } | null {
  if (!url) return null
  const u = decodeURIComponent(url)
  const pick = (a?: string, b?: string) => {
    const lat = Number(a)
    const lng = Number(b)
    return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat: round(lat), lng: round(lng) } : null
  }
  const num = '(-?\\d{1,3}(?:\\.\\d+)?)'
  const place = new RegExp(`!3d${num}!4d${num}`).exec(u)
  if (place) return pick(place[1], place[2])
  const at = new RegExp(`@${num},${num}`).exec(u)
  if (at) return pick(at[1], at[2])
  const q = new RegExp(`[?&](?:q|query|ll|destination)=${num},\\s*${num}`).exec(u)
  if (q) return pick(q[1], q[2])
  const bare = new RegExp(`^\\s*${num},\\s*${num}\\s*$`).exec(u)
  if (bare) return pick(bare[1], bare[2])
  return null
}

const round = (v: number) => Math.round(v * 1e6) / 1e6

/** A link that opens the pin in Google Maps (the owner's own link wins). */
export function mapsLink(a: { googleMapsUrl?: string | null; lat?: number | null; lng?: number | null }): string | null {
  if (a.googleMapsUrl && /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)/.test(a.googleMapsUrl)) return a.googleMapsUrl
  if (a.lat != null && a.lng != null) return `https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}`
  return null
}
