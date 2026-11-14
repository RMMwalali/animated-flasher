import { Hanken_Grotesk, Newsreader } from 'next/font/google'

/**
 * Two typefaces, fixed roles, used the same way on every page:
 * - serif: headlines only (semibold, italic for the one emphasised word)
 * - sans: everything else (body, menus, labels, buttons, numbers)
 */
export const serif = Newsreader({ subsets: ['latin'], weight: ['500', '600'], style: ['normal', 'italic'], variable: '--font-serif-face', display: 'swap' })
export const body = Hanken_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body-face', display: 'swap' })

export const fontVars = `${serif.variable} ${body.variable}`
