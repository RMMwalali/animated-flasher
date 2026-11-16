'use client'
import { useEffect } from 'react'

/**
 * Touch screens have no hover. There:
 * - quiet cards (home page journeys) show their details on the first tap;
 *   the second tap opens the journey. Tapping elsewhere hides them again.
 * - other photo cards show their details when they reach the middle of the
 *   screen as you scroll.
 */
export function CardReveal() {
  useEffect(() => {
    if (!window.matchMedia('(hover: none)').matches) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-active', e.isIntersecting)),
      { rootMargin: '-38% 0px -38% 0px' },
    )
    const seen = new WeakSet<Element>()
    const scan = () =>
      document.querySelectorAll('.photo-card:not(.photo-card--quiet)').forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        io.observe(el)
      })
    scan()
    let t = 0
    const mo = new MutationObserver(() => {
      window.clearTimeout(t)
      t = window.setTimeout(scan, 100)
    })
    mo.observe(document.body, { childList: true, subtree: true })

    const onClick = (e: MouseEvent) => {
      const card = (e.target as Element | null)?.closest?.('.photo-card--quiet')
      document.querySelectorAll('.photo-card--quiet.is-active').forEach((c) => c !== card && c.classList.remove('is-active'))
      if (!card || card.classList.contains('is-active')) return
      // first tap: show the details; the next tap follows the link
      e.preventDefault()
      card.classList.add('is-active')
    }
    document.addEventListener('click', onClick, true)
    return () => {
      io.disconnect()
      mo.disconnect()
      window.clearTimeout(t)
      document.removeEventListener('click', onClick, true)
    }
  }, [])
  return null
}
