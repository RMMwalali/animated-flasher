import type { Metadata } from 'next'
import { Chapter } from '@/components/home/Chapter'
import { Closing } from '@/components/home/Closing'
import { Stage } from '@/components/home/Stage'
import { Journeys } from '@/components/home/Journeys'
import { Story } from '@/components/home/Story'
import { Trust } from '@/components/home/Trust'
import { WhenToGo } from '@/components/home/WhenToGo'
import { WelcomeGate } from '@/components/site/WelcomeGate'
import { getHome, getSettings, getTrips } from '@/lib/content'
import { pageMeta } from '@/lib/seo/meta'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHome()
  return pageMeta({
    title: 'Ngina Trails & Safaris · Safaris and coastal tours from Diani Beach, Kenya',
    description: home.heroIntro || 'Safaris and coastal journeys from Diani Beach, Kenya.',
    path: '/',
    ogTitle: home.heroStatement,
  })
}

export default async function HomePage() {
  const [home, settings, featured] = await Promise.all([getHome(), getSettings(), getTrips({ featured: true })])
  const trips = featured.length ? featured : (await getTrips()).slice(0, 6)
  return (
    <>
      {home.playIntro && (
        <WelcomeGate soundNote={home.welcome.soundNote} enterLabel={home.welcome.enterLabel} quietLabel={home.welcome.quietLabel} audioUrl={home.welcome.ambientAudio?.url} />
      )}
      <Stage slides={home.stage} seconds={home.slideSeconds} film={home.film} title={`${settings.businessName}: safaris and coastal tours from Diani Beach, Kenya`} />
      <Story home={home} />
      <Chapter chapter={home.coast} tone="coast" n={2} />
      <Chapter chapter={home.safari} tone="safari" n={3} flip />
      {trips.length > 0 && <Journeys trips={trips} />}
      <WhenToGo home={home} />
      <Trust settings={settings} />
      <Closing home={home} />
    </>
  )
}
