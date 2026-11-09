import Image from 'next/image'
import type { MediaVM } from '@/lib/content'
import { Scene } from './Scene'

type Props = {
  media?: MediaVM | null
  fallback?: 'coast' | 'safari' | 'night' | 'dawn'
  sizes?: string
  priority?: boolean
  className?: string
  zoom?: boolean
}

/** Art-directed image with focal point; falls back to an illustrated scene. */
export function Media({ media, fallback = 'safari', sizes = '100vw', priority, className = '', zoom }: Props) {
  if (!media || media.mimeType?.startsWith('video')) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`} data-zoom={zoom ? '' : undefined}>
        <Scene kind={fallback} />
      </div>
    )
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
