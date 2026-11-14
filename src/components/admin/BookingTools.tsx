'use client'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useState, type ReactNode } from 'react'

type Result = { ok: boolean; error?: string; url?: string | null; email?: string; status?: string }

export async function bookingAction(body: Record<string, unknown>): Promise<Result> {
  const res = await fetch('/api/admin/booking', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return (await res.json().catch(() => ({ ok: false, error: `Error ${res.status}` }))) as Result
}

/** A row of buttons above a document, with one shared status line. */
export function ToolBar({ children, message }: { children: ReactNode; message?: { text: string; tone: 'ok' | 'error' } | null }) {
  return (
    <div className="ng-tools">
      <div className="ng-tools__row">{children}</div>
      {message && <p role="status" className={message.tone === 'error' ? 'ng-notice ng-notice--ochre' : 'ng-tools__ok'}>{message.text}</p>}
    </div>
  )
}

export function useAction() {
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null)
  const run = async (key: string, body: Record<string, unknown>, ok: (r: Result) => string) => {
    setBusy(key)
    setMessage(null)
    const r = await bookingAction(body).catch((e) => ({ ok: false, error: String(e) }) as Result)
    setBusy(null)
    setMessage(r.ok ? { text: ok(r), tone: 'ok' } : { text: r.error || 'Something went wrong.', tone: 'error' })
    return r
  }
  return { busy, message, run, setMessage }
}

export const emailNote = (r: Result) => (r.email === 'logged' ? ' (email is not set up yet, so it was only logged: copy the link and send it yourself)' : '')

export async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    window.prompt('Copy this link', text)
    return false
  }
}

export function useDocId() {
  const { id } = useDocumentInfo()
  return id
}

export function useFieldValue<T = unknown>(path: string): T | undefined {
  return useFormFields(([fields]) => fields[path]?.value as T | undefined)
}
