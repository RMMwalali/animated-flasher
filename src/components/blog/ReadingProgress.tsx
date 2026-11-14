'use client'
import { useEffect, useRef } from 'react'

/** Thin bar at the very top showing how far through the article you are. */
export function ReadingProgress({ target }: { target: string }) {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(target)
    if (!el || !bar.current) return
    let raf = 0
    const update = () => {
      const r = el.getBoundingClientRect()
      const total = Math.max(1, r.height - window.innerHeight * 0.6)
      const p = Math.min(1, Math.max(0, -r.top / total))
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [target])
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden="true">
      <div ref={bar} data-reading-progress className="h-full origin-left scale-x-0 bg-orange" />
    </div>
  )
}
