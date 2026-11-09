import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
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
import { SiteSettings } from './globals/SiteSettings'
import { withAudit } from './hooks/audit'
import { env, features } from './lib/env'
import { migrations } from './migrations'

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
  globals: [SiteSettings, Home],
  editor: lexicalEditor(),
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URL || 'postgres://ngina:ngina@localhost:5432/ngina', max: env.NODE_ENV === 'production' ? 5 : 10 },
    migrationDir: path.resolve(dirname, 'migrations'),
    // dev: schema auto-syncs; production: committed migrations run on start
    push: env.NODE_ENV !== 'production' && process.env.PAYLOAD_PUSH !== 'false',
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    s3Storage({
      enabled: features.storage,
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
