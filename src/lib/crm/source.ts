/** Attribution helpers (pure). */
export type Source = {
  channel?: 'form' | 'plan' | 'chat' | 'email' | 'phone' | 'referral' | 'other'; ctaId?: string; page?: string; landingPage?: string; referrer?: string
  utmSource?: string; utmMedium?: string; utmCampaign?: string; utmTerm?: string; utmContent?: string
}

const UTM_KEYS = { utm_source: 'utmSource', utm_medium: 'utmMedium', utm_campaign: 'utmCampaign', utm_term: 'utmTerm', utm_content: 'utmContent' } as const

/** Fill missing UTM values from the landing page URL; strip junk. */
export function normalizeSource(s: Source, siteUrl = 'https://example.com'): Source {
  const out: Source = {}
  for (const [k, v] of Object.entries(s)) if (typeof v === 'string' && v.trim()) (out as any)[k] = v.trim().slice(0, 500)
  if (out.landingPage) {
    try {
      const u = new URL(out.landingPage, siteUrl)
      for (const [param, key] of Object.entries(UTM_KEYS)) {
        const v = u.searchParams.get(param)
        if (v && !out[key]) out[key] = v.slice(0, 120)
      }
    } catch {
      /* ignore bad URLs */
    }
  }
  // the page is a path, never a full URL with query strings that might hold personal data
  if (out.page) out.page = out.page.split('?')[0]!.slice(0, 300)
  if (out.referrer) {
    try {
      const r = new URL(out.referrer)
      out.referrer = r.origin === new URL(siteUrl).origin ? undefined : r.origin + r.pathname
    } catch {
      out.referrer = undefined
    }
  }
  return out
}

export function splitName(full: string): { firstName: string; lastName?: string } {
  const parts = full.trim().replace(/\s+/g, ' ').split(' ')
  if (parts.length === 1) return { firstName: parts[0]! }
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts.at(-1) }
}

/** Least-busy agent who takes new leads; ties go to the lowest id (stable). */
export function pickAgent<T extends { id: number | string }>(agents: T[], openLeads: Map<T['id'], number>): T | undefined {
  return [...agents].sort((a, b) => (openLeads.get(a.id) ?? 0) - (openLeads.get(b.id) ?? 0) || String(a.id).localeCompare(String(b.id), undefined, { numeric: true }))[0]
}
