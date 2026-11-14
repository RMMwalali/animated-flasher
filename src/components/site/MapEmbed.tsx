'use client'
import { useState } from 'react'
import { Icon } from '@/components/icons/Icon'

/**
 * Google Map of the business pin. Nothing loads from Google (and no cookies
 * are set) until the visitor presses "Show map".
 */
export function MapEmbed({ lat, lng, label, link }: { lat: number; lng: number; label: string; link: string }) {
  const [on, setOn] = useState(false)
  return (
    <figure className="overflow-hidden rounded-3xl border border-line bg-paper" data-map>
      <div className="relative aspect-[4/3] w-full">
        {on ? (
          <iframe
            title={`Map: ${label}`}
            src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            className="absolute inset-0 size-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setOn(true)} className="absolute inset-0 grid place-items-center gap-3 bg-[radial-gradient(circle_at_50%_45%,var(--color-sky-100),var(--color-paper))] p-6 text-center" data-cta="contact-show-map">
            <span className="grid justify-items-center gap-3">
              <Icon name="map-pin" size={36} className="text-orange-600" />
              <span className="font-semibold">Show map</span>
              <span className="max-w-[30ch] text-sm text-deep/75">Loads Google Maps, which may set cookies.</span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
        <span>{label}</span>
        <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4" data-cta="contact-open-maps">
          Open in Google Maps <Icon name="arrow-up-right" size={14} />
        </a>
      </figcaption>
    </figure>
  )
}
