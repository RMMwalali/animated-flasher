const SHORT: Record<string, string> = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' }
const ORDER = Object.keys(SHORT)

/** "Mon–Fri 08:00–18:00" style lines. */
export function formatHours(hours: { days: string[]; opens: string; closes: string }[]): string[] {
  return hours.map((h) => {
    const idx = h.days.map((d) => ORDER.indexOf(d)).sort((a, b) => a - b)
    const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1]! + 1)
    const label = idx.length > 2 && contiguous ? `${SHORT[ORDER[idx[0]!]!]}–${SHORT[ORDER[idx.at(-1)!]!]}` : idx.map((i) => SHORT[ORDER[i]!]).join(', ')
    return `${label} ${h.opens}–${h.closes}`
  })
}
