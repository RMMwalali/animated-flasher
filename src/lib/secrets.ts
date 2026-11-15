/**
 * Encryption for API keys entered in the admin (Integrations). AES-256-GCM
 * with a key derived from PAYLOAD_SECRET, so the database alone never
 * reveals a key. Server-only.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { env } from '@/lib/env'

const PREFIX = 'enc:v1:'
export const MASK = '••••••••'

function keyFor(secret = env.PAYLOAD_SECRET): Buffer {
  if (!secret) throw new Error('PAYLOAD_SECRET (or a database) is needed to store keys securely.')
  return createHash('sha256').update(`ngina-integrations:${secret}`).digest()
}

export function encryptSecret(plain: string, secret?: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', keyFor(secret), iv)
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  return PREFIX + Buffer.concat([iv, cipher.getAuthTag(), ct]).toString('base64')
}

/** Returns null when the value cannot be decrypted (e.g. PAYLOAD_SECRET changed). */
export function decryptSecret(stored: string | null | undefined, secret?: string): string | null {
  if (!stored) return null
  if (!stored.startsWith(PREFIX)) return stored
  try {
    const raw = Buffer.from(stored.slice(PREFIX.length), 'base64')
    const decipher = createDecipheriv('aes-256-gcm', keyFor(secret), raw.subarray(0, 12))
    decipher.setAuthTag(raw.subarray(12, 28))
    return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}

export const isEncrypted = (v: unknown): v is string => typeof v === 'string' && v.startsWith(PREFIX)

/** What the admin shows for a saved key: dots and the last 4 characters. */
export function maskSecret(plain: string | null): string {
  if (!plain) return ''
  return `${MASK}${plain.slice(-4)}`
}

export const isMasked = (v: unknown) => typeof v === 'string' && v.startsWith(MASK)
