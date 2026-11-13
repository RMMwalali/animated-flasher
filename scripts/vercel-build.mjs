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

if (process.env.DATABASE_URL) {
  console.log('[vercel-build] applying database migrations')
  // No stdin: if Payload would ask an interactive question, fail fast instead of hanging the build.
  run('pnpm', ['exec', 'payload', 'migrate'], {
    stdio: ['ignore', 'inherit', 'inherit'],
    timeout: 90 * 1000, // real migrations take seconds; a prompt would wait forever
    onFail:
      '[vercel-build] Migrations did not complete. If the log above asks about "dev mode", this database was changed by a dev server or seed with schema push. Point DATABASE_URL at a fresh database (or a new Neon branch) and redeploy.',
  })
} else {
  console.warn('[vercel-build] DATABASE_URL is not set: skipping migrations. The site will show sample content and the admin will not work until a database is connected.')
}
run('pnpm', ['exec', 'next', 'build'])
