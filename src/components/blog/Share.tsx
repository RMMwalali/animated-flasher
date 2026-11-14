'use client'
import { useState, useSyncExternalStore } from 'react'
import { Icon } from '@/components/icons/Icon'

const noop = () => () => {}

/**
 * Share links with no third-party scripts or tracking: WhatsApp, email,
 * the phone's own share sheet when available, and copy link.
 */
export function Share({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)
  // false on the server, real value after hydration (no mismatch)
  const canNative = useSyncExternalStore(noop, () => typeof navigator.share === 'function', () => false)
  const text = `${title} ${url}`
  const pill = 'inline-flex min-h-11 items-center gap-2 rounded-full border border-current/30 px-4 text-sm font-semibold transition-colors hover:border-current'
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Copy this link', url)
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-2" data-share>
      <span className="eyebrow mr-2">Share</span>
      <a className={pill} href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" data-cta="share-whatsapp">
        <Icon name="chat" size={16} /> WhatsApp
      </a>
      <a className={pill} href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`} data-cta="share-email">
        <Icon name="mail" size={16} /> Email
      </a>
      {canNative && (
        <button type="button" className={pill} onClick={() => navigator.share({ title, url }).catch(() => {})} data-cta="share-native">
          <Icon name="arrow-up-right" size={16} /> More
        </button>
      )}
      <button type="button" className={pill} onClick={copy} data-cta="share-copy">
        <Icon name={copied ? 'check' : 'plus'} size={16} /> {copied ? 'Link copied' : 'Copy link'}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? 'Link copied to clipboard' : ''}</span>
    </div>
  )
}
