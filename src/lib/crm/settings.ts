import type { Payload, PayloadRequest } from 'payload'

export async function getSettings(p: { payload: Payload } | PayloadRequest) {
  const payload = 'payload' in p ? p.payload : (p as never)
  return payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true, req: 'user' in p ? (p as PayloadRequest) : undefined })
}
