import type { SettingsVM } from '@/lib/content'

export type TrustItem = {
  name: string; kind?: 'licence' | 'membership' | 'certification' | null; issuer?: string | null; number?: string | null
  validUntil?: string | null; description?: string | null; url?: string | null; sample?: boolean | null
  certificate?: { url: string; alt: string; mimeType?: string } | null
}

/**
 * Licences & memberships that may be shown: sample placeholders only while
 * the sample banner is on (previews), never anything past its expiry date.
 */
export function visibleTrust(s: Pick<SettingsVM, 'trust' | 'showSampleBanner'>, now = new Date()): TrustItem[] {
  return ((s.trust ?? []) as TrustItem[]).filter((t) => {
    if (t.sample && !s.showSampleBanner) return false
    if (t.validUntil && new Date(t.validUntil) < now) return false
    return true
  })
}

export const KIND_LABEL = { licence: 'Licence', membership: 'Membership', certification: 'Certification' } as const
