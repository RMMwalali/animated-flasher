'use client'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/icons/Icon'
import { ambient } from '@/lib/ambient'
import { BrushCircle } from './BrushCircle'

/** Round sound on/off button with a hand-drawn ring. */
export function SoundToggle({ className = '' }: { className?: string }) {
  const [on, setOn] = useState(false)
  useEffect(() => ambient.subscribe(setOn), [])
  return (
    <button
      type="button"
      onClick={() => void ambient.toggle()}
      className={`relative grid size-12 place-items-center rounded-full ${className}`}
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
    >
      <BrushCircle className="absolute inset-0 size-full text-orange" />
      <Icon name={on ? 'sound-on' : 'sound-off'} size={20} />
    </button>
  )
}
