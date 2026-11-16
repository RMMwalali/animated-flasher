// Vercel build: apply database migrations when a database is configured,
// then build. Without DATABASE_URL the site still builds and serves the
// sample content, so a first deploy works before Neon is connected.
import { spawnSync } from 'node:child_process'

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, NODE_OPTIONS: '--no-deprecation' }, ...opts })
  if (r.status !== 0) {
    if (opts.onFail) console.error(opts.onFail)
    process.exit(r.status ?? 1)
  }
}

// Same rules as resolveDatabaseUrl in src/lib/env.ts: Neon may be connected
// with a name prefix (e.g. NEON_DATABASE_URL).
function databaseUrl(e) {
  const pg = (v) => (v && /^postgres(ql)?:\/\//.test(v.trim()) ? v.trim() : undefined)
  const named = pg(e.DATABASE_URL) || pg(e.POSTGRES_URL)
  if (named) return named
  const keys = Object.keys(e).sort()
  const prefixed = (re) => keys.filter((k) => re.test(k)).map((k) => pg(e[k])).find(Boolean)
  return prefixed(/_(DATABASE_URL|POSTGRES_URL)$/) || pg(e.DATABASE_URL_UNPOOLED) || pg(e.POSTGRES_URL_NON_POOLING) || prefixed(/_(DATABASE_URL_UNPOOLED|POSTGRES_URL_NON_POOLING)$/)
}
const dbUrl = databaseUrl(process.env)
if (dbUrl) process.env.DATABASE_URL = dbUrl

if (dbUrl) {
  console.log('[vercel-build] applying database migrations')
  // No stdin: if Payload would ask an interactive question, fail fast instead of hanging the build.
  run('pnpm', ['exec', 'payload', 'migrate'], {
    stdio: ['ignore', 'inherit', 'inherit'],
    timeout: 90 * 1000, // real migrations take seconds; a prompt would wait forever
    onFail:
      '[vercel-build] Migrations did not complete. If the log above asks about "dev mode", this database was changed by a dev server or seed with schema push. Point DATABASE_URL at a fresh database (or a new Neon branch) and redeploy.',
  })
} else {
  console.warn('[vercel-build] No database URL found (DATABASE_URL, POSTGRES_URL or a prefixed version): skipping migrations. The site will show sample content and the admin will not work until a database is connected.')
}
run('pnpm', ['exec', 'next', 'build'])
