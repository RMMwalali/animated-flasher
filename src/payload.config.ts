import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Authors } from './collections/Authors'
import { Destinations } from './collections/Destinations'
import { Experiences } from './collections/Experiences'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Trips } from './collections/Trips'
import { Users } from './collections/Users'
import { Wildlife } from './collections/Wildlife'
import { Activities, CannedReplies, Companies, Contacts, Conversations, Leads, Messages, Tasks } from './collections/crm'
import { AuditLogs, Bookings, Departures, Payments, Quotes, RateLimits, ReviewRequests, Suppliers, Travellers } from './collections/ops'
import { Home } from './globals/Home'
import { Integrations } from './globals/Integrations'
import { SiteSettings } from './globals/SiteSettings'
import { withAudit } from './hooks/audit'
import { postmarkAdapter } from './lib/email/payloadAdapter'
import { env, features } from './lib/env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const collections = [
  // Sales
  Leads, Contacts, Companies, Conversations, Messages, Activities, Tasks, CannedReplies, ReviewRequests,
  // Operations
  Quotes, Bookings, Travellers, Departures, Suppliers,
  // Money
  Payments,
  // Website
  Pages, Trips, Destinations, Experiences, Wildlife, Posts, Authors, Media,
  // Team
  Users, AuditLogs, RateLimits,
].map(withAudit)

const view = (p: string) => `/components/admin/views/${p}`

export default buildConfig({
  serverURL: env.SITE_URL,
  secret: env.PAYLOAD_SECRET || (env.NODE_ENV === 'production' ? '' : 'dev-only-insecure-secret-change-me'),
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    meta: { titleSuffix: ' · Ngina back office', icons: [{ rel: 'icon', url: '/favicon.ico' }] },
    theme: 'light',
    avatar: 'default',
    dateFormat: 'd MMM yyyy',
    components: {
      graphics: { Logo: '/components/admin/Brand#AdminLogo', Icon: '/components/admin/Brand#AdminIcon' },
      beforeNavLinks: ['/components/admin/NavLinks#NavLinks'],
      providers: ['/components/admin/Provider#AdminProvider'],
      views: {
        dashboard: { Component: view('Overview#OverviewView') },
        inbox: { Component: view('Inbox#InboxView'), path: '/inbox', meta: { title: 'Inbox' } },
        pipeline: { Component: view('Pipeline#PipelineView'), path: '/pipeline', meta: { title: 'Leads pipeline' } },
        calendar: { Component: view('Calendar#CalendarView'), path: '/calendar', meta: { title: 'Departures calendar' } },
        setup: { Component: view('Setup#SetupView'), path: '/setup', meta: { title: 'Go-live setup' } },
      },
    },
  },
  collections,
  globals: [SiteSettings, Home, Integrations],
  editor: lexicalEditor(),
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URL || 'postgres://ngina:ngina@localhost:5432/ngina', max: env.NODE_ENV === 'production' ? 5 : 10 },
    migrationDir: path.resolve(dirname, 'migrations'),
    // dev: schema auto-syncs. Production: committed migrations are applied by
    // `pnpm migrate` (vercel-build script / Docker entrypoint), never during build.
    push: env.NODE_ENV !== 'production' && process.env.PAYLOAD_PUSH !== 'false',
  }),
  sharp,
  email: postmarkAdapter,
  plugins: [
    // Photo storage: Cloudflare R2 (S3) if configured, else Vercel Blob, else local disk.
    vercelBlobStorage({
      enabled: features.storageProvider === 'vercel-blob',
      // serve files straight from Vercel's CDN (media is public anyway)
      collections: { media: { prefix: 'media', disablePayloadAccessControl: true } },
      token: env.BLOB_READ_WRITE_TOKEN ?? '',
      clientUploads: true,
    }),
    s3Storage({
      enabled: features.storageProvider === 's3',
      collections: { media: { prefix: 'media', generateFileURL: env.S3_PUBLIC_URL ? ({ filename, prefix }) => `${env.S3_PUBLIC_URL}/${prefix}/${filename}` : undefined } },
      bucket: env.S3_BUCKET ?? '',
      config: {
        endpoint: env.S3_ENDPOINT,
        region: env.S3_REGION,
        credentials: { accessKeyId: env.S3_ACCESS_KEY_ID ?? '', secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? '' },
        forcePathStyle: true,
      },
    }),
  ],
  upload: { limits: { fileSize: 50 * 1024 * 1024 } },
  graphQL: { disable: true },
  telemetry: false,
})
