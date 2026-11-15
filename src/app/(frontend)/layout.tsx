import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { AttributionCapture } from '@/components/site/Attribution'
import { ConsentBanner } from '@/components/site/Consent'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { welcomeScript } from '@/components/site/WelcomeGate'
import { LionWalker } from '@/components/site/LionWalker'
import { Motion } from '@/components/site/Motion'
import { SampleBanner } from '@/components/site/SampleBanner'
import { Analytics } from '@/components/site/Analytics'
import { PublicConfigProvider } from '@/components/site/PublicConfig'
import { WhatsAppButton } from '@/components/site/WhatsAppButton'
import { getConfig } from '@/lib/config'
import { getSettings } from '@/lib/content'
import { env } from '@/lib/env'
import { fontVars } from '@/lib/fonts'
import { clampText } from '@/lib/seo/text'
import { JsonLd, travelAgency, website } from '@/lib/seo/jsonld'
import './globals.css'

/** Site-wide search settings, all editable in Business settings → Search & Google. */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const name = s.search.siteName || s.businessName
  const icon = s.search.siteIcon?.url
  return {
    metadataBase: new URL(env.SITE_URL),
    title: { default: `${name} · Safaris and coastal tours from Diani Beach, Kenya`, template: `%s · ${name}` },
    description: clampText(s.search.defaultDescription || s.tagline),
    applicationName: name,
    manifest: '/manifest.webmanifest',
    formatDetection: { telephone: true, email: true },
    // an uploaded icon replaces the default elephant (browser tabs and Google results)
    icons: icon ? { icon: [{ url: icon }], apple: [{ url: icon }] } : undefined,
    verification: {
      google: s.search.googleVerification || undefined,
      other: s.search.bingVerification ? { 'msvalidate.01': s.search.bingVerification } : undefined,
    },
    robots: s.search.hideFromSearch ? { index: false, follow: false } : undefined,
    openGraph: { siteName: name, locale: 'en_KE', images: s.search.shareImage?.url ? [{ url: s.search.shareImage.url, width: 1200, height: 630 }] : undefined },
  }
}

export const viewport: Viewport = {
  themeColor: [{ color: '#0e2b27' }],
  width: 'device-width',
  initialScale: 1,
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, config] = await Promise.all([getSettings(), getConfig()])
  const contact = { email: settings.email, phone: settings.phone, whatsapp: settings.whatsapp, hours: settings.hours, social: settings.social }
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: welcomeScript }} />
        <noscript>
          <style>{'.intro-gate{display:none!important}'}</style>
        </noscript>
        <JsonLd data={[travelAgency(settings), website(settings)]} />
      </head>
      <body className="min-h-screen">
        <a href="#main" className="sr-only z-[100] rounded-full bg-deep px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
          Skip to content
        </a>
        <PublicConfigProvider value={{ turnstileSiteKey: config.turnstile.siteKey, whatsapp: settings.whatsapp || undefined, businessName: settings.businessName }}>
          <Header contact={contact} banner={settings.showSampleBanner ? <SampleBanner /> : undefined} />
          <main id="main">{children}</main>
          <Footer settings={settings} />
        </PublicConfigProvider>
        <LionWalker />
        {settings.whatsappButton !== false && settings.whatsapp && <WhatsAppButton number={settings.whatsapp} message={settings.whatsappMessage || 'Jambo!'} />}
        <ConsentBanner />
        <Motion />
        <AttributionCapture />
        <Analytics ids={config.analytics} />
      </body>
    </html>
  )
}
