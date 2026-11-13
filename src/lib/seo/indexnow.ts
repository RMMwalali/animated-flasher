import { env } from '@/lib/env'

/** Notify IndexNow-compatible search engines that URLs changed. No-op without a key. */
export async function pingIndexNow(paths: string[]): Promise<void> {
  const key = env.INDEXNOW_KEY
  if (!key || !paths.length || process.env.NODE_ENV !== 'production') return
  const host = new URL(env.SITE_URL).host
  const urlList = paths.map((p) => new URL(p, env.SITE_URL).toString())
  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation: `${env.SITE_URL}/indexnow-key.txt`, urlList }),
    signal: AbortSignal.timeout(5000),
  })
}
