import { Icon } from '@/components/icons/Icon'

/** A link to one of the guest's PDF documents (quote, invoice or receipt). */
export function PdfLink({ href, label, small = false }: { href: string; label: string; small?: boolean }) {
  return small ? (
    <a href={href} target="_blank" rel="noopener" data-no-print className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline underline-offset-4">
      <Icon name="receipt" size={14} /> {label}
    </a>
  ) : (
    <a href={href} target="_blank" rel="noopener" data-no-print className="inline-flex min-h-11 items-center gap-2 rounded-full border border-current/30 px-4 text-sm font-semibold hover:border-current">
      <Icon name="receipt" size={16} /> {label}
    </a>
  )
}
