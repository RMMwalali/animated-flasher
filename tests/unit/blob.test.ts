import { describe, expect, it } from 'vitest'
import { resolveBlobToken } from '@/lib/env'

const tok = (s: string) => ['vercel', 'blob', 'rw', s].join('_')

describe('resolveBlobToken', () => {
  it('uses BLOB_READ_WRITE_TOKEN', () => {
    expect(resolveBlobToken({ BLOB_READ_WRITE_TOKEN: tok('a') })).toBe(tok('a'))
  })
  it('finds a Blob store connected with a name prefix', () => {
    expect(resolveBlobToken({ NGINA_READ_WRITE_TOKEN: tok('b') })).toBe(tok('b'))
  })
  it('ignores other tokens', () => {
    expect(resolveBlobToken({ GITHUB_READ_WRITE_TOKEN: 'ghp_x', BLOB_READ_WRITE_TOKEN: '' })).toBeUndefined()
  })
})
