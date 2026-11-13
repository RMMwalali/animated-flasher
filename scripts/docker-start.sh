#!/bin/sh
# Apply committed database migrations, then start the server.
# Binaries are called directly (no package manager needed at runtime).
set -e
export NODE_OPTIONS=--no-deprecation
BIN=/app/node_modules/.bin
echo "[start] applying migrations"
"$BIN/payload" migrate
if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "[start] seeding sample content (skips anything that exists)"
  "$BIN/tsx" scripts/seed.ts
fi
exec "$BIN/next" start -p "${PORT:-3000}"
