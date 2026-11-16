'use client'
import { useEffect } from 'react'

/**
 * Touch screens have no hover: there, the photo card closest to the middle
 * of the screen shows its details as you scroll past.
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
      document.querySelectorAll('.photo-card').forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        io.observe(el)
      })
    scan()
    // cards added later (filters, page changes)
    let t = 0
    const mo = new MutationObserver(() => {
      window.clearTimeout(t)
      t = window.setTimeout(scan, 100)
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
      window.clearTimeout(t)
    }
  }, [])
  return null
}
