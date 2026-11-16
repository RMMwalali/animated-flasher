'use client'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/icons/Icon'
import { trackEvent } from './Analytics'

const HIDE_KEY = 'ngina-wa-hidden'

/**
 * WhatsApp button, bottom-right on every page (Business settings). The small
 * × hides it for the rest of the visit.
 */
export function WhatsAppButton({ number, message }: { number: string; message: string }) {
  const path = usePathname()
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        if (sessionStorage.getItem(HIDE_KEY)) setHidden(true)
      } catch {}
    })
    return () => cancelAnimationFrame(raf)
  }, [])
  const digits = number.replace(/\D/g, '')
  if (!digits || hidden) return null
  const href = (text: string) => `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
  const hide = () => {
    setHidden(true)
    try {
      sessionStorage.setItem(HIDE_KEY, '1')
    } catch {}
  }
  return (
    <div className="fixed bottom-5 right-5 z-40" data-no-print data-whatsapp>
      <a
        href={href(message)}
        target="_blank"
        rel="noopener noreferrer"
        data-cta="whatsapp-float"
        onClick={(e) => {
          // on a guest's trip page the booking reference is added for the team
          const ref = document.querySelector('[data-booking-ref]')?.getAttribute('data-booking-ref')
          if (ref) e.currentTarget.href = href(`${message} (Booking ${ref})`)
          const token = path.startsWith('/trip/') ? path.split('/')[2] : null
          if (token) navigator.sendBeacon?.('/api/trip/whatsapp', new Blob([JSON.stringify({ token })], { type: 'application/json' }))
          trackEvent('whatsapp_click', { page: path })
        }}
        className="block size-16 transition-transform duration-300 hover:scale-105 focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
        aria-label="Chat with us on WhatsApp (opens WhatsApp)"
        title="Chat on WhatsApp"
      >
        <Image src="/brand/whatsapp-3d.png" alt="" width={128} height={128} className="size-16 drop-shadow-[0_8px_16px_rgb(14_43_39/0.35)]" />
      </a>
      <button
        type="button"
        onClick={hide}
        className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-deep text-cream shadow-md transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        aria-label="Hide the WhatsApp button"
        title="Hide"
      >
        <Icon name="close" size={12} strokeWidth={2.5} />
      </button>
    </div>
  )
}
