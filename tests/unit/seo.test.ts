import { describe, expect, it } from 'vitest'
import { SITE_NAME, clampText, coordsFromMapsUrl, mapsLink, searchTitle } from '@/lib/seo/text'

describe('clampText', () => {
  it('keeps short text and collapses spaces', () => {
    expect(clampText('  Tsavo   East  ')).toBe('Tsavo East')
  })
  it('cuts long text at a word boundary with an ellipsis', () => {
    const long = 'Tsavo East is the closest major national park to Diani Beach, which makes it the natural first safari for most coastal visitors who want elephants.'.repeat(2)
    const out = clampText(long)
    expect(out.length).toBeLessThanOrEqual(155)
    expect(out.endsWith('…')).toBe(true)
    expect(out).not.toMatch(/\s…$/)
  })
})

describe('searchTitle', () => {
  it('adds the site name when it fits', () => {
    expect(searchTitle('Tsavo East from Diani', SITE_NAME)).toEqual({ text: `Tsavo East from Diani · ${SITE_NAME}`, withSiteName: true })
  })
  it('leaves long titles alone so Google shows them in full', () => {
    const t = 'What to pack for a Kenya safari (and a few days on the coast)'
    expect(searchTitle(t, SITE_NAME)).toEqual({ text: t, withSiteName: false })
  })
  it('never repeats the site name', () => {
    expect(searchTitle(`About ${SITE_NAME}`, SITE_NAME).withSiteName).toBe(false)
  })
})

describe('coordsFromMapsUrl', () => {
  it('prefers the place pin over the map centre', () => {
    const url = 'https://www.google.com/maps/place/Diani+Beach/@-4.2800,39.5900,15z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d-4.3167123!4d39.5833456'
    expect(coordsFromMapsUrl(url)).toEqual({ lat: -4.316712, lng: 39.583346 })
  })
  it('reads @lat,lng, query links and pasted numbers', () => {
    expect(coordsFromMapsUrl('https://www.google.com/maps/@-4.31,39.58,17z')).toEqual({ lat: -4.31, lng: 39.58 })
    expect(coordsFromMapsUrl('https://maps.google.com/?q=-4.3167,39.5833')).toEqual({ lat: -4.3167, lng: 39.5833 })
    expect(coordsFromMapsUrl('-4.3167, 39.5833')).toEqual({ lat: -4.3167, lng: 39.5833 })
  })
  it('returns null for short links and nonsense', () => {
    expect(coordsFromMapsUrl('https://maps.app.goo.gl/abc123')).toBeNull()
    expect(coordsFromMapsUrl('hello')).toBeNull()
    expect(coordsFromMapsUrl('https://www.google.com/maps/@-95,39.58,17z')).toBeNull()
  })
})

describe('mapsLink', () => {
  it('uses the owner\'s Google Maps link, else the pin', () => {
    expect(mapsLink({ googleMapsUrl: 'https://maps.app.goo.gl/abc123', lat: 1, lng: 2 })).toBe('https://maps.app.goo.gl/abc123')
    expect(mapsLink({ googleMapsUrl: 'https://evil.example/maps', lat: -4.3, lng: 39.5 })).toBe('https://www.google.com/maps/search/?api=1&query=-4.3,39.5')
    expect(mapsLink({})).toBeNull()
  })
})
