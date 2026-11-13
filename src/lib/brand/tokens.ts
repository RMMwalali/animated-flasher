/**
 * Ngina design tokens. Logo colours were sampled from public/brand/ngina-logo.jpg
 * by scripts/brand/sample-colours.py; never alter them. Text-safe tints
 * ("ink" variants) were chosen to meet WCAG AA, enforced by tests/unit/contrast.test.ts.
 */
export const logo = {
  cream: '#EFECE5',
  deep: '#0E2B27',
  teal: '#0B99AF',
  green: '#0F673F',
  greenLight: '#06764E',
  greenDark: '#075C35',
  ochre: '#D1974E',
} as const

export const colors = {
  ...logo,
  paper: '#F7F5F0', // lighter cream surface
  night: '#0A1D19', // footer / night sections
  ink: logo.deep,
  // burnt orange: brand accent; text on it must use the 600 shade
  orange: '#C2621F',
  orange600: '#A3501A', // CTA background with cream text (4.79:1)
  orange700: '#8A4415', // CTA hover
  orange300: '#E8935A', // orange text on deep/night
  tealInk: '#086B7C', // teal text on cream (5.23:1)
  teal300: '#5FB8C8', // teal text on deep (6.59:1)
  ochreInk: '#7F531A', // ochre text on cream (5.64:1)
  sky50: '#E6F3F5', // coastal section tints (deep text)
  sky100: '#CDE9EE',
  sky200: '#B5DFE6',
  line: '#D9D4C8', // hairlines on cream
} as const

/** Every text/background pair the UI uses. Tested for AA. */
export const textPairs: Array<{ fg: keyof typeof colors; bg: keyof typeof colors; large?: boolean }> = [
  { fg: 'deep', bg: 'cream' },
  { fg: 'deep', bg: 'paper' },
  { fg: 'cream', bg: 'deep' },
  { fg: 'cream', bg: 'night' },
  { fg: 'cream', bg: 'orange600' },
  { fg: 'cream', bg: 'orange700' },
  { fg: 'cream', bg: 'green' },
  { fg: 'cream', bg: 'tealInk' },
  { fg: 'tealInk', bg: 'cream' },
  { fg: 'tealInk', bg: 'paper' },
  { fg: 'teal300', bg: 'deep' },
  { fg: 'teal300', bg: 'night' },
  { fg: 'ochre', bg: 'deep' },
  { fg: 'ochre', bg: 'night' },
  { fg: 'ochreInk', bg: 'cream' },
  { fg: 'orange300', bg: 'deep' },
  { fg: 'orange300', bg: 'night' },
  { fg: 'green', bg: 'cream' },
  { fg: 'green', bg: 'sky50' },
  { fg: 'deep', bg: 'sky50' },
  { fg: 'deep', bg: 'sky100' },
  { fg: 'deep', bg: 'sky200' },
  { fg: 'deep', bg: 'ochre' },
  { fg: 'tealInk', bg: 'sky50' },
  { fg: 'orange600', bg: 'cream' },
]
