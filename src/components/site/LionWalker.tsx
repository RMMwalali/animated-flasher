'use client'
import { useEffect, useRef } from 'react'
import { brandPaths } from '@/components/brand/paths'

/** Scroll progress: the lion walks along the horizon swoosh. */
export function LionWalker() {
  const lion = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (lion.current) lion.current.style.transform = `translateX(calc(${p} * (var(--w) - 100%)))`
      if (bar.current) bar.current.setAttribute('aria-valuenow', String(Math.round(p * 100)))
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  const [lx, ly, lw, lh] = brandPaths.lion.box
  return (
    <div
      ref={bar}
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      className="pointer-events-none fixed bottom-5 left-5 z-40 hidden w-[150px] rounded-full bg-cream/90 px-4 pb-2.5 pt-1.5 text-deep shadow-[0_6px_24px_-12px_rgb(14_43_39/0.5)] backdrop-blur-sm [--w:118px] md:block"
    >
      <div ref={lion} className="w-[38px] will-change-transform">
        <svg viewBox={`${lx} ${ly} ${lw} ${lh}`} className="block h-auto w-full" aria-hidden="true">
          <path d={brandPaths.lion.d} fill="currentColor" fillRule="evenodd" />
        </svg>
      </div>
      <svg viewBox={brandPaths.horizon.box.join(' ')} preserveAspectRatio="none" className="block h-[5px] w-full" aria-hidden="true">
        <path d={brandPaths.horizon.d} fill="currentColor" />
      </svg>
    </div>
  )
}
