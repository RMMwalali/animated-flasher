import Image from 'next/image'
import type { MediaVM } from '@/lib/content'
import { photos, type PhotoKey } from '@/content/photos'

type Props = {
  media?: MediaVM | null
  fallback?: 'coast' | 'safari' | 'night' | 'dawn'
  sizes?: string
  priority?: boolean
  className?: string
  zoom?: boolean
}

/** Used when an item has no photo yet: a real photo that suits it (never an illustration). */
const FALLBACK: Record<NonNullable<Props['fallback']>, PhotoKey> = { coast: 'dianiSunset', safari: 'maraSunset', night: 'maraSunset', dawn: 'kilimanjaro' }

/** Art-directed image with focal point; falls back to a matching stock photo. */
export function Media({ media, fallback = 'safari', sizes = '100vw', priority, className = '', zoom }: Props) {
  if (!media || media.mimeType?.startsWith('video')) {
    const p = photos[FALLBACK[fallback]]
    media = { url: p.url, alt: '', width: p.width, height: p.height }
  }
  const pos = media.focalX != null && media.focalY != null ? `${media.focalX}% ${media.focalY}%` : '50% 50%'
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <Image
        src={media.url}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        fetchPriority={priority ? 'high' : undefined}
        className="object-cover"
        style={{ objectPosition: pos }}
        data-zoom={zoom ? '' : undefined}
      />
    </div>
  )
}
