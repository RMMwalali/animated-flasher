import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { AttributionCapture } from '@/components/site/Attribution'
import { ConsentBanner } from '@/components/site/Consent'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { introScript } from '@/components/site/IntroGate'
import { LionWalker } from '@/components/site/LionWalker'
import { Motion } from '@/components/site/Motion'
import { SampleBanner } from '@/components/site/SampleBanner'
import { getSettings } from '@/lib/content'
import { env } from '@/lib/env'
import { fontVars } from '@/lib/fonts'
import { JsonLd, travelAgency, website } from '@/lib/seo/jsonld'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: { default: 'Ngina Trails & Safaris · Safaris and coastal tours from Diani Beach, Kenya', template: '%s · Ngina Trails & Safaris' },
  description: 'Diani Beach based tour company: Tsavo, Amboseli and Maasai Mara safaris, Kisite-Mpunguti dhow days, Lamu, Mombasa and Mount Kenya treks.',
  applicationName: 'Ngina Trails & Safaris',
  manifest: '/manifest.webmanifest',
  formatDetection: { telephone: true, email: true },
}

export const viewport: Viewport = {
  themeColor: [{ color: '#0e2b27' }],
  width: 'device-width',
  initialScale: 1,
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings()
  const contact = { email: settings.email, phone: settings.phone, whatsapp: settings.whatsapp, hours: settings.hours, social: settings.social }
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <JsonLd data={[travelAgency(settings), website(settings)]} />
      </head>
      <body className="min-h-screen">
        <a href="#main" className="sr-only z-[100] rounded-full bg-deep px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
          Skip to content
        </a>
        <Header contact={contact} banner={settings.showSampleBanner ? <SampleBanner /> : undefined} />
        <main id="main">{children}</main>
        <Footer settings={settings} />
        <LionWalker />
        <ConsentBanner />
        <Motion />
        <AttributionCapture />
      </body>
    </html>
  )
}
