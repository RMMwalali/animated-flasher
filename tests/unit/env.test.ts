import { describe, expect, it } from 'vitest'
import { resolveDatabaseUrl } from '@/lib/env'

const url = (db: string) => ['postgres', `//u:${db}@h/${db}`].join(':')

describe('resolveDatabaseUrl', () => {
  it('uses DATABASE_URL, then POSTGRES_URL', () => {
    expect(resolveDatabaseUrl({ DATABASE_URL: url('a'), POSTGRES_URL: url('b') })).toBe(url('a'))
    expect(resolveDatabaseUrl({ POSTGRES_URL: url('b') })).toBe(url('b'))
  })
  it('finds a Neon connection added with a name prefix', () => {
    expect(resolveDatabaseUrl({ NEON_SKY_DATABASE_URL: url('c') })).toBe(url('c'))
    expect(resolveDatabaseUrl({ STORAGE_POSTGRES_URL: url('d'), STORAGE_DATABASE_URL_UNPOOLED: url('e') })).toBe(url('d'))
  })
  it('falls back to the direct (unpooled) URL', () => {
    expect(resolveDatabaseUrl({ X_DATABASE_URL_UNPOOLED: url('f') })).toBe(url('f'))
  })
  it('ignores empty or non-Postgres values', () => {
    expect(resolveDatabaseUrl({ DATABASE_URL: '', OTHER_DATABASE_URL: 'mysql://x' })).toBeUndefined()
  })
})
