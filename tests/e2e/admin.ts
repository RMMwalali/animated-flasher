/** Headers for API calls as the seeded admin (one shared session, see global-setup.ts). */
export function adminHeaders(): Record<string, string> {
  const token = process.env.E2E_ADMIN_TOKEN
  if (!token) throw new Error('No admin session: set E2E_ADMIN_PASSWORD (or SEED_ADMIN_PASSWORD).')
  return { Authorization: `JWT ${token}` }
}
