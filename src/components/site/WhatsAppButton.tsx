'use client'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/icons/Icon'
import { trackEvent } from './Analytics'

/** Round WhatsApp button, bottom-right on every page (Business settings). */
export function WhatsAppButton({ number, message }: { number: string; message: string }) {
  const path = usePathname()
  const digits = number.replace(/\D/g, '')
  if (!digits) return null
  const href = (text: string) => `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
  return (
    <a
      href={href(message)}
      target="_blank"
      rel="noopener noreferrer"
      data-cta="whatsapp-float"
      data-no-print
      onClick={(e) => {
        // on a guest's trip page the booking reference is added for the team
        const ref = document.querySelector('[data-booking-ref]')?.getAttribute('data-booking-ref')
        if (ref) e.currentTarget.href = href(`${message} (Booking ${ref})`)
        trackEvent('whatsapp_click', { page: path })
      }}
      className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#1f7a4d] text-white shadow-[0_10px_30px_-10px_rgb(14_43_39/0.6)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
      aria-label="Chat with us on WhatsApp (opens WhatsApp)"
      title="Chat on WhatsApp"
    >
      <Icon name="whatsapp" size={28} />
    </a>
  )
}
