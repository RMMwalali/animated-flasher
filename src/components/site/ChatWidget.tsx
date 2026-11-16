'use client'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Icon } from '@/components/icons/Icon'
import { trackEvent } from './Analytics'

type Msg = { id: number; from: 'you' | 'team'; name?: string; body: string; at: string }
type Thread = { hasEmail: boolean; status: string; messages: Msg[] }

const HIDE_KEY = 'ngina-chat-hidden'
const ACTIVE_KEY = 'ngina-chat-active'
const READ_KEY = 'ngina-chat-read'
const store = {
  get: (s: Storage | undefined, k: string) => {
    try {
      return s?.getItem(k) ?? null
    } catch {
      return null
    }
  },
  set: (s: Storage | undefined, k: string, v: string) => {
    try {
      s?.setItem(k, v)
    } catch {}
  },
}
const time = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

/**
 * Live chat, bottom-right above the WhatsApp button. Messages go to the
 * team's Inbox. Shows whether someone is online; when nobody is, it asks
 * for an email so the reply can go there too. The × hides it for the visit.
 */
export function ChatWidget({ greeting }: { greeting: string }) {
  const path = usePathname()
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(false)
  const [online, setOnline] = useState<boolean | null>(null)
  const [thread, setThread] = useState<Thread | null>(null)
  const [unread, setUnread] = useState(0)
  const [draft, setDraft] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [honey, setHoney] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (store.get(globalThis.sessionStorage, HIDE_KEY)) setHidden(true)
      if (store.get(globalThis.localStorage, ACTIVE_KEY)) setActive(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const load = useCallback(async () => {
    const res = await fetch('/api/chat', { cache: 'no-store' }).catch(() => null)
    if (!res?.ok) return
    const j = (await res.json()) as { ok: boolean; online?: boolean; conversation?: Thread | null }
    if (!j.ok) return
    setOnline(Boolean(j.online))
    setThread(j.conversation ?? null)
    if (!j.conversation) return
    const read = Number(store.get(globalThis.localStorage, READ_KEY) ?? 0)
    setUnread(j.conversation.messages.filter((m) => m.from === 'team' && new Date(m.at).getTime() > read).length)
  }, [])

  // check for replies: often while open, now and then while a chat is going
  useEffect(() => {
    if (hidden || (!open && !active)) return
    let alive = true
    const tick = () => alive && !document.hidden && load()
    const first = requestAnimationFrame(tick)
    const t = setInterval(tick, open ? 4000 : 30000)
    return () => {
      alive = false
      cancelAnimationFrame(first)
      clearInterval(t)
    }
  }, [open, active, hidden, load])

  useEffect(() => {
    if (!open) return
    store.set(globalThis.localStorage, READ_KEY, String(Date.now()))
    const raf = requestAnimationFrame(() => {
      setUnread(0)
      endRef.current?.scrollIntoView({ block: 'end' })
    })
    return () => cancelAnimationFrame(raf)
  }, [open, thread?.messages.length])

  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => inputRef.current?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        launcherRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (hidden) return null

  const post = async (body: Record<string, unknown>) => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, page: path }) })
      const j = (await res.json()) as { ok: boolean; error?: string }
      if (!j.ok) throw new Error(j.error || 'Your message could not be sent. Please try again.')
      await load()
      return true
    } catch (e) {
      setError((e as Error).message)
      return false
    } finally {
      setBusy(false)
    }
  }

  const send = async (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || busy) return
    if (!thread) {
      if (online === false && !email.trim()) {
        setError('Our team is away right now. Please add your email so we can reply.')
        return
      }
      if (await post({ action: 'start', name, email, message: text, website: honey })) {
        setDraft('')
        setActive(true)
        store.set(globalThis.localStorage, ACTIVE_KEY, '1')
        trackEvent('chat_start', { page: path, online: String(online) })
      }
    } else if (await post({ action: 'send', message: text })) setDraft('')
  }

  const saveEmail = async (e: FormEvent) => {
    e.preventDefault()
    if (email.trim()) await post({ action: 'email', email, name })
  }

  const hide = () => {
    setHidden(true)
    setOpen(false)
    store.set(globalThis.sessionStorage, HIDE_KEY, '1')
  }

  const status = online === null ? null : online ? 'We are online' : 'Away: we reply by email'
  const needsEmail = thread && !thread.hasEmail && online === false

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Live chat with Ngina Trails and Safaris"
          data-chat-panel
          data-no-print
          className="fixed inset-x-3 bottom-3 z-50 flex max-h-[calc(100svh-1.5rem)] flex-col overflow-hidden rounded-3xl bg-cream text-deep shadow-[0_24px_60px_rgb(14_43_39/0.35)] sm:inset-x-auto sm:bottom-24 sm:right-5 sm:h-[min(34rem,calc(100svh-8rem))] sm:w-[23rem]"
        >
          <div className="flex items-center justify-between gap-3 bg-deep px-5 py-4 text-cream">
            <div>
              <p className="font-display text-xl leading-tight">Chat with us</p>
              {status && (
                <p className="mt-0.5 flex items-center gap-2 text-sm text-cream/85">
                  <span className={`size-2 rounded-full ${online ? 'bg-teal' : 'bg-ochre'}`} aria-hidden="true" /> {status}
                </p>
              )}
            </div>
            <button type="button" onClick={() => { setOpen(false); launcherRef.current?.focus() }} className="grid size-11 place-items-center rounded-full hover:bg-cream/10" aria-label="Close the chat">
              <Icon name="close" size={20} />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-paper px-4 py-3 text-[0.95rem]">{greeting}</p>
            {thread?.messages.map((m) => (
              <div key={m.id} className={m.from === 'you' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.95rem] ${m.from === 'you' ? 'rounded-tr-sm bg-deep text-cream' : 'rounded-tl-sm bg-paper'}`}>
                  {m.from === 'team' && m.name && <p className="text-xs font-semibold text-orange-700">{m.name}</p>}
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`mt-1 text-right text-[0.7rem] ${m.from === 'you' ? 'text-cream/70' : 'text-deep/60'}`}>{time(m.at)}</p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {needsEmail && (
            <form onSubmit={saveEmail} className="flex gap-2 border-t border-line px-4 py-3">
              <label className="sr-only" htmlFor="chat-email-late">Your email</label>
              <input id="chat-email-late" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email for our reply" className="min-h-11 min-w-0 flex-1 rounded-xl border border-deep/25 bg-paper px-3 text-[0.95rem] outline-none focus:border-deep" />
              <button type="submit" disabled={busy} className="btn btn-primary !min-h-11 !px-4 text-sm">Save</button>
            </form>
          )}

          <form onSubmit={send} className="grid gap-2 border-t border-line px-4 py-3">
            {!thread && (
              <div className="grid grid-cols-2 gap-2">
                <label className="sr-only" htmlFor="chat-name">Your name</label>
                <input id="chat-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="min-h-11 min-w-0 rounded-xl border border-deep/25 bg-paper px-3 text-[0.95rem] outline-none focus:border-deep" />
                <label className="sr-only" htmlFor="chat-email">Your email{online === false ? '' : ' (optional)'}</label>
                <input id="chat-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={online === false ? 'Email (for our reply)' : 'Email (optional)'} className="min-h-11 min-w-0 rounded-xl border border-deep/25 bg-paper px-3 text-[0.95rem] outline-none focus:border-deep" />
                <input type="text" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} className="absolute -left-[9999px] size-px opacity-0" aria-hidden="true" name="website" />
              </div>
            )}
            <div className="flex items-end gap-2">
              <label className="sr-only" htmlFor="chat-message">Message</label>
              <textarea
                id="chat-message" ref={inputRef} rows={1} value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e) } }}
                placeholder="Type a message" maxLength={2000}
                className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-deep/25 bg-paper px-3 py-2.5 text-[0.95rem] outline-none focus:border-deep"
              />
              <button type="submit" disabled={busy || !draft.trim()} className="grid size-11 shrink-0 place-items-center rounded-full bg-orange text-cream disabled:opacity-50" aria-label="Send message">
                <Icon name="send" size={18} />
              </button>
            </div>
            {error && <p role="alert" className="text-sm font-semibold text-[#9e2a1a]">{error}</p>}
            <p className="text-[0.7rem] text-deep/65">Messages go to our team in Diani Beach and are kept with your enquiry.</p>
          </form>
        </div>
      )}

      <div className="relative" data-no-print data-chat-launcher>
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Close the chat' : unread ? `Open the chat (${unread} new)` : 'Chat with us'}
          title="Chat with us"
          data-cta="chat-open"
          className="grid size-14 place-items-center rounded-full bg-deep text-cream shadow-[0_8px_20px_rgb(14_43_39/0.35)] transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
        >
          <Icon name={open ? 'close' : 'chat'} size={24} />
        </button>
        {unread > 0 && !open && <span className="pointer-events-none absolute -left-1 -top-1 grid min-w-5 place-items-center rounded-full bg-orange px-1 text-xs font-bold text-cream">{unread}</span>}
        {!open && (
          <button type="button" onClick={hide} className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-cream text-deep shadow-md transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange" aria-label="Hide the chat button" title="Hide">
            <Icon name="close" size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </>
  )
}
