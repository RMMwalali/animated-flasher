'use client'
import { Icon } from '@/components/icons/Icon'

/** Opens the browser's print dialog, where "Save as PDF" makes a PDF copy. */
export function PrintButton({ label = 'Save as PDF or print' }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} data-no-print className="inline-flex min-h-11 items-center gap-2 rounded-full border border-current/30 px-4 text-sm font-semibold hover:border-current">
      <Icon name="receipt" size={16} /> {label}
    </button>
  )
}
