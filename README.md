# Ngina Trails and Safaris: website + back office

Public marketing site and admin/CRM for **Ngina Trails and Safaris, Diani Beach, Kenya**, in one Next.js app with Payload CMS.

- **Public site** (`/`): cinematic, mobile-first, SEO/GEO ready. Next.js App Router, Tailwind CSS v4, Headless UI, GSAP + ScrollTrigger, Lenis.
- **Admin** (`/admin`): Payload CMS 3 with a custom text-and-icon theme and custom views: Overview, Inbox, Leads pipeline, Departures calendar, Go-live setup.
- **Data**: Postgres (Neon in production). Media in Cloudflare R2 (S3 API), or local disk in dev.
- **Integrations** (all optional, behind small interfaces): Postmark email (send + inbound), Pusher/Ably real-time chat, Paystack payments (M-Pesa + card), Cloudflare Turnstile, IndexNow.

The owner-facing guide is in [`docs/OWNER-GUIDE.md`](docs/OWNER-GUIDE.md).

## Quick start (local)

Requirements: Node 22, pnpm 10, Postgres 16 (or Docker).

```bash
pnpm install
```

```bash
cp .env.example .env   # then set DATABASE_URL and PAYLOAD_SECRET
```

```bash
pnpm migrate            # create the tables
```

```bash
pnpm seed               # sample content + demo CRM data + admin user
```

```bash
pnpm dev                # http://localhost:3000 and http://localhost:3000/admin
```

The seed creates `admin@ngina.local`, a sample sales agent and a content editor. Passwords come from `SEED_ADMIN_PASSWORD` / `SEED_SALES_PASSWORD` / `SEED_EDITOR_PASSWORD`; any you leave blank are generated randomly and printed once in the seed output. No login is hardcoded.

### With Docker Compose (single VPS)

Set `PAYLOAD_SECRET` and `POSTGRES_PASSWORD` in `.env` first (Compose refuses to start without them), then:

```bash
docker compose up -d --build
```

This starts Postgres and the app, applies migrations, seeds sample content (`SEED_ON_START=true` by default; set it to `false` after the first run) and serves on port 3000. Media uploads persist in the `media` volume. Put a reverse proxy with TLS (Caddy, nginx) in front for production.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Dev server (schema auto-syncs to the database: never point it at production) |
| `pnpm build` / `pnpm start` | Production build / server |
| `pnpm vercel-build` | Used by Vercel (`vercel.json`): runs `migrate` when `DATABASE_URL` is set, then `build` |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript |
| `pnpm test` | Vitest unit tests (pricing, leads, payments, colour contrast) |
| `pnpm test:e2e` | Playwright smoke tests (starts `pnpm start` on port 3100) |
| `pnpm migrate` / `pnpm migrate:create <name>` | Apply / create Payload migrations (committed in `src/migrations`) |
| `pnpm seed` | Idempotent sample content + demo data (`--reset` to wipe sample data first). Never changes the schema; run `migrate` first |
| `pnpm generate:types` / `pnpm generate:importmap` | Payload types / admin import map |
| `pnpm brand` | Re-sample logo colours and re-trace all logo parts from `public/brand/ngina-logo.jpg` (needs Python 3 with Pillow, numpy, scipy) |

## Architecture

```
src/
  app/(frontend)/        public site: layout, pages, API routes (/api/enquiry, /api/health, /og)
  app/(payload)/         Payload admin + REST API, admin theme (custom.scss)
  collections/           content (Trips, Destinations, Pages, Posts…) and CRM (crm.ts, ops.ts)
  globals/               Business settings, Home page
  hooks/                 pipeline automation, audit log, revalidation + IndexNow
  lib/                   pure logic (pricing, payments/math, crm/stages, crm/source) + services
    email/ realtime/ payments/   provider interfaces (Postmark, Pusher/Ably, Paystack)
  components/site|home|forms|admin|icons|brand
  content/sample.ts      sample content (seed + fallback when the DB is unreachable)
scripts/brand/           logo colour sampling + segmentation + potrace tracing
```

**Content fallback.** `src/lib/content.ts` reads Payload; if the database is unreachable (e.g. CI build) it serves `content/sample.ts`, so the site always builds. Pages use ISR; publishing in the admin revalidates affected paths and pings IndexNow.

**Website → admin wiring.** Every CTA posts to `/api/enquiry` with attribution (UTM, landing page, referrer, page, CTA id captured client-side in `lib/attribution.ts`). The route validates (zod), rate-limits (DB-backed, per IP), checks the honeypot + fill time (+ Turnstile if configured), then `captureEnquiry()` upserts the contact, picks the least-busy agent, creates the lead and an inbox conversation, emails an acknowledgement (Reply-To threads back via Postmark inbound) and notifies the agent (lead hook).

**Pipeline automation.** `lib/crm/stages.ts` defines New → Contacted → Quoted → Deposit paid → Confirmed → Travelled → Review requested (+ Lost). Hooks only move leads forward: quote sent → Quoted; deposit paid → Deposit paid; paid in full → Confirmed; booking completed → Travelled (+ review request scheduled); review email sent → Review requested.

**Access control.** Roles `admin`, `sales`, `editor` (`src/access`). CRM collections are sales/admin only; content is editor/admin; drafts are never public; the audit log is admin read-only and written by hooks on every collection.

**Brand.** Colours were sampled from the logo (`scripts/brand/sample-colours.py`) and live in `src/lib/brand/tokens.ts`; every text/background pair is AA-tested. All logo parts in `public/brand/*.svg` are traced from the raster with potrace (never redrawn). Icons are a custom 24px / 1.5px line set in `src/components/icons`.

## Deploying to Vercel

1. Import the repo in Vercel. `vercel.json` pins the framework to Next.js and the build to `pnpm vercel-build`, which applies migrations (when `DATABASE_URL` is set) and then builds. The production URL serves the `main` branch, so nothing appears there until this work is merged.
2. Add the environment variables from `.env.example` (at least `SITE_URL`, `DATABASE_URL`, `PAYLOAD_SECRET`, `CRON_SECRET`, plus R2 for media; local disk does not persist on Vercel). Without `DATABASE_URL` the site still deploys with sample content, but the admin and enquiry form need the database.
3. After the first successful deploy (tables now exist), run `pnpm seed` once against the production database from your machine if you want the sample content, then replace it. Never run `pnpm dev` against the production database: its schema push makes later migrations stop at an interactive prompt.

See `docs/OWNER-GUIDE.md` for the full go-live checklist.
