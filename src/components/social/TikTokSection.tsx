import { Icon } from '@/components/icons/Icon'
import { tiktokVideos } from '@/lib/social/tiktok'
import { TikTokRow } from './TikTokRow'

/** Home page row of TikTok videos (Home page → TikTok videos). Hidden when empty. */
export async function TikTokSection({ title, urls, profileUrl }: { title?: string | null; urls: string[]; profileUrl?: string }) {
  if (!urls.length) return null
  const videos = await tiktokVideos(urls)
  if (!videos.length) return null
  return (
    <section data-tone="night" aria-labelledby="tiktok-title" className="bg-night py-20 text-cream">
      <div className="gutter mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-ochre">On TikTok</p>
          <h2 id="tiktok-title" className="statement mt-3 max-w-[18ch]">{title || 'Fresh from the field'}</h2>
        </div>
        {profileUrl && (
          <a href={profileUrl} target="_blank" rel="noopener me" className="btn btn-ghost" data-cta="tiktok-follow">
            <Icon name="tiktok" size={18} /> Follow us
          </a>
        )}
      </div>
      <TikTokRow videos={videos} />
    </section>
  )
}
