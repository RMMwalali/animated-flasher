import { Icon } from '@/components/icons/Icon'
import { socialOf } from '@/components/site/social'
import type { SettingsVM } from '@/lib/content'
import { googleReviews } from '@/lib/reviews/google'

function Stars({ value, label }: { value: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-ochre" role="img" aria-label={label ?? `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="size-4" aria-hidden="true"><path fill={i <= Math.round(value) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" /></svg>
      ))}
    </span>
  )
}

/**
 * Real reviews only: Google reviews (when connected in Integrations) shown
 * exactly as Google returns them, plus links to read reviews on TripAdvisor,
 * SafariBookings and Google. Renders nothing until there is something real.
 */
export async function Reviews({ settings }: { settings: SettingsVM }) {
  const g = await googleReviews()
  const links = settings.social.filter((s) => ['google', 'tripadvisor', 'safaribookings'].includes(s.platform) && s.url)
  if (!g && !links.length) return null
  return (
    <section data-tone="cream" aria-labelledby="reviews-title" className="py-20">
      <div className="gutter mx-auto max-w-7xl">
        <p className="eyebrow text-teal-ink">Reviews</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <h2 id="reviews-title" className="statement max-w-[16ch]">What our guests say.</h2>
          {g && (
            <p className="flex items-center gap-3 text-lg">
              <span className="font-display text-4xl">{g.rating.toFixed(1)}</span>
              <span className="grid">
                <Stars value={g.rating} label={`Rated ${g.rating.toFixed(1)} out of 5 on Google`} />
                <span className="text-sm text-deep/80">{g.count} Google reviews</span>
              </span>
            </p>
          )}
        </div>
        {g && g.reviews.length > 0 && (
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {g.reviews.slice(0, 6).map((r) => (
              <li key={`${r.author}-${r.publishTime}`} className="grid content-start gap-3 rounded-3xl bg-paper p-6">
                <Stars value={r.rating} />
                <p className="line-clamp-6 leading-relaxed">{r.text}</p>
                <p className="mt-auto flex items-center gap-3 text-sm">
                  {r.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.photo} alt="" width={32} height={32} className="size-8 rounded-full" referrerPolicy="no-referrer" loading="lazy" />
                  )}
                  <span>
                    {r.authorUrl ? <a href={r.authorUrl} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold underline-offset-4 hover:underline">{r.author}</a> : <span className="font-semibold">{r.author}</span>}
                    {r.when && <span className="text-deep/70"> · {r.when}</span>}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
          {g && <span className="text-deep/75">Reviews from Google.</span>}
          {g?.url && <a href={g.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">All reviews on Google <Icon name="arrow-up-right" size={16} /></a>}
          {links.filter((l) => !(g?.url && l.platform === 'google')).map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" data-cta={`reviews-${l.platform}`}>
              Read our reviews on {socialOf(l.platform).label} <Icon name="arrow-up-right" size={16} />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
