import { describe, expect, it } from 'vitest'
import { stripQuoted } from '@/lib/inbox'
import { htmlToText, inboundBody } from '@/lib/inbox/inbound'

describe('stripQuoted', () => {
  it('keeps the reply and drops the quoted history', () => {
    const t = 'Yes please, the 12th works.\n\nThanks,\nAnna\n\nOn Mon, 3 Nov 2026 at 10:00, Ngina Trails and Safaris <hello@x.com> wrote:\n> Here is your plan\n> Day 1'
    expect(stripQuoted(t)).toBe('Yes please, the 12th works.\n\nThanks,\nAnna')
  })
  it('handles Outlook-style separators and quote markers', () => {
    expect(stripQuoted('Sounds good\n-----Original Message-----\nFrom: us')).toBe('Sounds good')
    expect(stripQuoted('Great\n> old line\nP.S. two kids')).toBe('Great\nP.S. two kids')
  })
})

describe('inbound email body', () => {
  it('prefers Postmark\'s stripped reply and lists attachments', () => {
    expect(inboundBody({ StrippedTextReply: 'See attached passports', TextBody: 'See attached passports\n> quoted', Attachments: [{ Name: 'passport.pdf' }] }))
      .toBe('See attached passports\n\n[Attachments: passport.pdf. Open the original email to download them.]')
  })
  it('falls back to HTML when there is no text part', () => {
    expect(htmlToText('<p>Hello&nbsp;there</p><p>Two adults <b>&amp;</b> one child</p><style>p{}</style>')).toBe('Hello there\nTwo adults & one child')
    expect(inboundBody({ HtmlBody: '<div>Hi!</div>' })).toBe('Hi!')
    expect(inboundBody({})).toBe('(no text)')
  })
})
