'use client'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/icons/Icon'

/**
 * Muted background loop that only loads once visible and after the page is
 * idle (never competes with LCP). Includes play/pause and sound toggles.
 */
export function LazyVideo({ src, poster, label, withSound = false }: { src: string; poster?: string; label: string; withSound?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [load, setLoad] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const raf = requestAnimationFrame(() => setPlaying(false))
      return () => cancelAnimationFrame(raf)
    }
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection
    if (conn?.saveData) return
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        const go = () => setLoad(true)
        if ('requestIdleCallback' in window) (window as any).requestIdleCallback(go, { timeout: 2500 })
        else setTimeout(go, 1200)
        io.disconnect()
      }
    })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) {
      void v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        poster={poster}
        muted={muted}
        loop
        playsInline
        autoPlay={playing}
        preload="none"
        aria-label={label}
      >
        {load && <source src={src} />}
      </video>
      <div className="absolute bottom-6 right-4 z-10 flex gap-2 sm:right-8">
        <button type="button" onClick={toggle} className="grid size-11 place-items-center rounded-full border border-cream/60 text-cream backdrop-blur-sm" aria-label={playing ? 'Pause video' : 'Play video'}>
          <Icon name={playing ? 'pause' : 'play'} size={18} />
        </button>
        {withSound && (
          <button type="button" onClick={() => setMuted((m) => !m)} className="grid size-11 place-items-center rounded-full border border-cream/60 text-cream backdrop-blur-sm" aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={!muted}>
            <Icon name={muted ? 'sound-off' : 'sound-on'} size={18} />
          </button>
        )}
      </div>
    </>
  )
}
