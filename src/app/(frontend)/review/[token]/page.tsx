import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadSafe, getSettings } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'How was your trip?', robots: { index: false, follow: false } }

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ optout?: string }> }

/**
 * Landing page of the review email. Every guest sees the same choices; we
 * never filter who is asked or offer anything in return.
 */
export default async function ReviewPage({ params, searchParams }: Props) {
  const { token } = await params
  const { optout } = await searchParams
  const payload = await getPayloadSafe()
  if (!payload || !token || token.length < 16) notFound()
  const { docs } = await payload.find({ collection: 'review-requests', where: { token: { equals: token } }, limit: 1, depth: 1, overrideAccess: true })
  const r = docs[0]
  if (!r) notFound()
  const contact = r.contact as { firstName?: string } | null
  if (optout === '1') {
    if (r.status !== 'opted_out') await payload.update({ collection: 'review-requests', id: r.id, data: { status: 'opted_out' }, overrideAccess: true })
    return (
      <section data-tone="cream" className="min-h-[70svh] pb-24 pt-40">
        <div className="gutter mx-auto max-w-2xl">
          <h1 className="font-display text-5xl font-medium">Of course.</h1>
          <p className="mt-5 text-lg">We will not ask again. Thank you for travelling with us{contact?.firstName ? `, ${contact.firstName}` : ''}.</p>
        </div>
      </section>
    )
  }
  const settings = await getSettings()
  const platforms = ((settings.reviews?.platforms ?? []) as { name: string; url?: string | null; enabled?: boolean | null }[]).map((p, i) => ({ ...p, i })).filter((p) => p.enabled && p.url)
  return (
    <section data-tone="cream" className="min-h-[70svh] pb-24 pt-40">
      <div className="gutter mx-auto max-w-2xl">
        <p className="eyebrow text-teal-ink">Your review</p>
        <h1 className="mt-3 font-display text-5xl font-medium leading-tight">Asante sana{contact?.firstName ? `, ${contact.firstName}` : ''}.</h1>
        <p className="mt-5 text-lg">An honest review, good or bad, helps other travellers choose and helps us improve. It takes about two minutes. Choose where you would like to post it:</p>
        {platforms.length ? (
          <ul className="mt-8 grid gap-3">
            {platforms.map((p) => (
              <li key={p.i}>
                <a href={`/api/review/go?t=${encodeURIComponent(token)}&p=${p.i}`} className="btn btn-primary w-full justify-center sm:w-auto" rel="nofollow">Review us on {p.name}</a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 rounded-2xl bg-paper p-5">Our review links are being set up. You are welcome to simply reply to our email with your thoughts.</p>
        )}
        <p className="mt-10 text-sm text-deep/75">Prefer not to? <a className="underline underline-offset-4" href={`?optout=1`}>Don&apos;t ask me again</a>.</p>
      </div>
    </section>
  )
}
