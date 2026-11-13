import { DM_Mono, DM_Sans, Fredoka, Playfair_Display } from 'next/font/google'

/** Rounded heavy display face, closest Google match to the wordmark. */
export const display = Fredoka({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display-face', display: 'swap' })
/** High-contrast serif for headlines on the public site (italic for the emphasised word). */
export const serif = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-serif-face', display: 'swap' })
export const body = DM_Sans({ subsets: ['latin'], variable: '--font-body-face', display: 'swap' })
export const mono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono-face', display: 'swap' })

export const fontVars = `${display.variable} ${serif.variable} ${body.variable} ${mono.variable}`
