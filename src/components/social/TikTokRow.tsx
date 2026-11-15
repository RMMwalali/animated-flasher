'use client'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import { Icon } from '@/components/icons/Icon'
import type { TikTokVideo } from '@/lib/social/tiktok'
import { trackEvent } from '@/components/site/Analytics'

/** Horizontal row of TikTok thumbnails; the player loads only when one is tapped. */
export function TikTokRow({ videos }: { videos: TikTokVideo[] }) {
  const [open, setOpen] = useState<TikTokVideo | null>(null)
  return (
    <>
      <ul className="gutter flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
        {videos.map((v) => (
          <li key={v.id} className="w-[44vw] max-w-[230px] shrink-0 snap-start sm:w-[30vw] lg:w-[17vw]">
            <button
              type="button"
              onClick={() => {
                setOpen(v)
                trackEvent('tiktok_play', { video: v.id })
              }}
              className="group relative block aspect-[9/16] w-full overflow-hidden rounded-2xl bg-night text-left"
              aria-label={`Play TikTok video${v.title ? `: ${v.title}` : ''}`}
            >
              {v.thumbnail ? (
                // TikTok thumbnails are signed, short-lived URLs: load them directly
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.thumbnail} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
              ) : (
                <span className="absolute inset-0 grid place-items-center text-cream/60"><Icon name="tiktok" size={40} /></span>
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
              <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream/90 text-deep transition-transform group-hover:scale-110"><Icon name="play" size={22} /></span>
              {v.title && <span className="absolute inset-x-3 bottom-3 line-clamp-3 text-sm text-cream">{v.title}</span>}
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={Boolean(open)} onClose={() => setOpen(null)} className="relative z-[80]">
        <div className="fixed inset-0 bg-night/80" aria-hidden="true" />
        <div className="fixed inset-0 grid place-items-center p-4">
          <DialogPanel className="relative w-full max-w-[380px]">
            <DialogTitle className="sr-only">{open?.title || 'TikTok video'}</DialogTitle>
            <button type="button" onClick={() => setOpen(null)} className="absolute -top-12 right-0 grid size-11 place-items-center rounded-full bg-cream text-deep" aria-label="Close video"><Icon name="close" size={20} /></button>
            {open && (
              <iframe
                title={open.title || 'TikTok video'}
                src={`https://www.tiktok.com/player/v1/${open.id}?autoplay=1&rel=0`}
                className="aspect-[9/16] w-full rounded-2xl border-0 bg-night"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            )}
            {open && <a href={open.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-cream underline underline-offset-4">Watch on TikTok <Icon name="arrow-up-right" size={14} /></a>}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
