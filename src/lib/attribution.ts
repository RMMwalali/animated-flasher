/** Client-side attribution: first landing page, referrer and UTM tags for this visit. */
const KEY = 'ngina-attr'
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

export type Attribution = {
  landingPage?: string; referrer?: string
  utmSource?: string; utmMedium?: string; utmCampaign?: string; utmTerm?: string; utmContent?: string
}

export function captureAttribution() {
  try {
    const url = new URL(window.location.href)
    const hasUtm = UTM.some((k) => url.searchParams.get(k))
    if (sessionStorage.getItem(KEY) && !hasUtm) return
    const a: Attribution = { landingPage: url.pathname + url.search, referrer: document.referrer || undefined }
    a.utmSource = url.searchParams.get('utm_source') ?? undefined
    a.utmMedium = url.searchParams.get('utm_medium') ?? undefined
    a.utmCampaign = url.searchParams.get('utm_campaign') ?? undefined
    a.utmTerm = url.searchParams.get('utm_term') ?? undefined
    a.utmContent = url.searchParams.get('utm_content') ?? undefined
    sessionStorage.setItem(KEY, JSON.stringify(a))
  } catch {}
}

export function getAttribution(): Attribution {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Attribution
  } catch {
    return {}
  }
}

/** Source payload for any CTA submission. */
export function sourceFor(channel: 'form' | 'plan' | 'chat', ctaId: string) {
  return { ...getAttribution(), channel, ctaId, page: window.location.pathname }
}
