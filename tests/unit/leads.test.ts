import { describe, expect, it } from 'vitest'
import { advanceLeadStatus, PIPELINE } from '@/lib/crm/stages'
import { normalizeSource, pickAgent, splitName } from '@/lib/crm/source'
import { enquirySchema } from '@/lib/forms/schemas'
import { spamSignals } from '@/lib/security/spam'
import { windowStep } from '@/lib/security/rate-limit'
import { localizeUrl } from '@/lib/media-url'

describe('pipeline', () => {
  it('has the agreed stage order', () => {
    expect(PIPELINE).toEqual(['new', 'contacted', 'quoted', 'deposit_paid', 'confirmed', 'travelled', 'review_requested'])
  })
  it('only moves forward', () => {
    expect(advanceLeadStatus('new', 'quoted')).toBe('quoted')
    expect(advanceLeadStatus('confirmed', 'quoted')).toBe('confirmed')
  })
  it('never revives lost leads, except on payment', () => {
    expect(advanceLeadStatus('lost', 'quoted')).toBe('lost')
    expect(advanceLeadStatus('lost', 'deposit_paid', { evidence: 'payment' })).toBe('deposit_paid')
    expect(advanceLeadStatus('new', 'lost')).toBe('new')
  })
})

describe('attribution', () => {
  it('fills UTM from the landing page and strips query from page', () => {
    const s = normalizeSource({ channel: 'form', page: '/safaris?x=1', landingPage: '/?utm_source=google&utm_medium=cpc&utm_campaign=tsavo' }, 'https://ngina.example')
    expect(s).toMatchObject({ utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'tsavo', page: '/safaris' })
  })
  it('keeps explicit UTM values over landing-page ones', () => {
    expect(normalizeSource({ utmSource: 'newsletter', landingPage: '/?utm_source=google' }).utmSource).toBe('newsletter')
  })
  it('drops same-site referrers', () => {
    expect(normalizeSource({ referrer: 'https://ngina.example/safaris' }, 'https://ngina.example').referrer).toBeUndefined()
    expect(normalizeSource({ referrer: 'https://www.google.com/search?q=x' }, 'https://ngina.example').referrer).toBe('https://www.google.com/search')
  })
})

describe('contacts and assignment', () => {
  it('splits names', () => {
    expect(splitName('Wanjiru')).toEqual({ firstName: 'Wanjiru' })
    expect(splitName('  Mary  Ann  Otieno ')).toEqual({ firstName: 'Mary Ann', lastName: 'Otieno' })
  })
  it('assigns the least busy agent, ties to lowest id', () => {
    const agents = [{ id: 3 }, { id: 1 }, { id: 2 }]
    expect(pickAgent(agents, new Map([[1, 4], [2, 1], [3, 1]]))?.id).toBe(2)
    expect(pickAgent<{ id: number }>([], new Map())).toBeUndefined()
  })
})

describe('enquiry validation and spam', () => {
  const ok = { name: 'Test Guest', email: 'guest@example.com', source: {} }
  it('accepts a minimal enquiry', () => {
    expect(enquirySchema.safeParse(ok).success).toBe(true)
  })
  it('rejects bad email and filled honeypot', () => {
    expect(enquirySchema.safeParse({ ...ok, email: 'nope' }).success).toBe(false)
    expect(enquirySchema.safeParse({ ...ok, website: 'http://spam' }).success).toBe(false)
  })
  it('flags bots that are too fast or link-heavy', () => {
    const now = 1_000_000
    expect(spamSignals({ startedAt: now - 500 }, now)).toContain('too-fast')
    expect(spamSignals({ startedAt: now - 10_000 }, now)).toEqual([])
    expect(spamSignals({ message: 'http:// http:// http:// http://' })).toContain('links')
  })
  it('rate-limits in fixed windows', () => {
    let st: { count: number; resetAt: number } | undefined
    const results = Array.from({ length: 4 }, () => {
      const r = windowStep(st, 0, 3, 1000)
      st = r.state
      return r.result.ok
    })
    expect(results).toEqual([true, true, true, false])
    expect(windowStep(st, 1001, 3, 1000).result.ok).toBe(true)
  })
})

describe('media URLs', () => {
  it('turns our own media URLs into relative paths', () => {
    expect(localizeUrl('http://localhost:3000/api/media/file/a.webp')).toBe('/api/media/file/a.webp')
    expect(localizeUrl('https://animated-flasher.vercel.app/api/media/file/a.webp?x=1')).toBe('/api/media/file/a.webp?x=1')
    expect(localizeUrl('/sample/a.webp')).toBe('/sample/a.webp')
  })
  it('leaves external storage URLs absolute', () => {
    expect(localizeUrl('https://media.example.com/media/a.webp')).toBe('https://media.example.com/media/a.webp')
  })
})
