import type { FullConfig } from '@playwright/test'

/**
 * Signs in as the seeded admin once for the whole run. Tests share this one
 * session: Payload records each login on the user, and logins made at the
 * same moment (parallel tests) can overwrite each other's session.
 */
export default async function globalSetup(config: FullConfig) {
  const password = process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD
  if (!password || process.env.E2E_ADMIN_TOKEN) return
  const baseURL = config.projects[0]?.use.baseURL ?? 'http://localhost:3100'
  const res = await fetch(new URL('/api/users/login', baseURL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.E2E_ADMIN_EMAIL ?? 'admin@ngina.local', password }),
  })
  if (!res.ok) throw new Error(`E2E admin login failed: ${res.status} ${await res.text()}`)
  process.env.E2E_ADMIN_TOKEN = ((await res.json()) as { token: string }).token
}
