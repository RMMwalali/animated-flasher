import { describe, expect, it } from 'vitest'
import { contrast } from '@/lib/brand/contrast'
import { colors, logo, textPairs } from '@/lib/brand/tokens'

describe('brand colours', () => {
  it('keeps the sampled logo colours unchanged', () => {
    expect(logo).toEqual({ cream: '#EFECE5', deep: '#0E2B27', teal: '#0B99AF', green: '#0F673F', greenLight: '#06764E', greenDark: '#075C35', ochre: '#D1974E' })
  })
  it.each(textPairs)('$fg on $bg meets WCAG AA', ({ fg, bg, large }) => {
    expect(contrast(colors[fg], colors[bg])).toBeGreaterThanOrEqual(large ? 3 : 4.5)
  })
})
