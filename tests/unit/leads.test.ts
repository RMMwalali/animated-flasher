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

describe('site URL', async () => {
  const { resolveSiteUrl } = await import('@/lib/env')
  it('prefers SITE_URL and trims the trailing slash', () => {
    expect(resolveSiteUrl({ SITE_URL: 'https://nginatrails.com/', VERCEL_PROJECT_PRODUCTION_URL: 'x.vercel.app' })).toBe('https://nginatrails.com')
  })
  it('falls back to the Vercel production domain, never localhost', () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'animated-flasher.vercel.app', VERCEL_URL: 'abc.vercel.app' })).toBe('https://animated-flasher.vercel.app')
    expect(resolveSiteUrl({ VERCEL_URL: 'abc.vercel.app' })).toBe('https://abc.vercel.app')
    expect(resolveSiteUrl({})).toBeUndefined()
  })
})

describe('header scroll behaviour', async () => {
  const { nextHeaderState } = await import('@/components/site/headerState')
  const run = (ys: number[]) => {
    let s = { last: 0, anchor: 0, hidden: false, solid: false }
    const out: boolean[] = []
    for (const y of ys) {
      s = nextHeaderState(s, y, 900)
      out.push(s.hidden)
    }
    return out
  }
  it('does not flicker on tiny back-and-forth deltas while scrolling down', () => {
    const ys: number[] = []
    for (let y = 0; y < 900; y += 6) ys.push(y, Math.max(0, y - 2)) // jittery smooth-scroll from the top
    const states = run(ys)
    const flips = states.filter((h, i) => i > 0 && h !== states[i - 1]).length
    expect(flips).toBe(1) // hides once, stays hidden
  })
  it('shows again after a clear scroll up, and always near the top', () => {
    const states = run([400, 500, 600, 590, 575, 560, 100])
    expect(states[2]).toBe(true)
    expect(states[3]).toBe(true) // 10px up: still hidden
    expect(states[5]).toBe(false) // 40px up: shown
    expect(states[6]).toBe(false)
  })
})
