import { createHash, randomBytes } from 'node:crypto'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I

export function shortCode(len = 6): string {
  const bytes = randomBytes(len)
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}

export const token = (bytes = 24) => randomBytes(bytes).toString('base64url')
export const sha256 = (v: string) => createHash('sha256').update(v).digest('hex')

export const quoteNumber = () => `Q-${new Date().getFullYear()}-${shortCode(5)}`
export const bookingReference = () => `NG-${shortCode(6)}`
export const paymentReference = () => `PAY-${shortCode(8)}`
