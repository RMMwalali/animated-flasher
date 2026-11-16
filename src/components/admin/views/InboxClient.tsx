'use client'
import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@/components/icons/Icon'

type Ref = { id: number; name?: string; fullName?: string; firstName?: string; email?: string; phone?: string; country?: string } | number | null | undefined
type Conversation = {
  id: number; subject: string; channel: 'email' | 'chat' | 'whatsapp' | 'phone'; status: 'open' | 'pending' | 'closed'
  unread?: number; lastMessageAt?: string; lastMessagePreview?: string; lastDirection?: 'in' | 'out'
  contact?: Ref; assignedTo?: Ref; lead?: Ref
}
type Message = {
  id: number; direction: 'in' | 'out' | 'note'; channel: string; body: string; createdAt: string; automated?: boolean
  fromName?: string; fromEmail?: string; author?: Ref; deliveryStatus?: string
}
type Canned = { id: number; title: string; body: string }
type Filter = 'open' | 'pending' | 'closed' | 'mine' | 'unassigned' | 'all'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'open', label: 'Needs reply' }, { key: 'pending', label: 'Waiting on guest' }, { key: 'mine', label: 'Mine' },
  { key: 'unassigned', label: 'Unassigned' }, { key: 'closed', label: 'Closed' }, { key: 'all', label: 'All' },
]
const CHANNEL: Record<string, string> = { email: 'Email', chat: 'Chat', whatsapp: 'WhatsApp', phone: 'Phone' }
const obj = <T extends object>(r: unknown) => (r && typeof r === 'object' ? (r as T) : null)
const nameOf = (r: Ref) => { const o = obj<{ fullName?: string; firstName?: string; name?: string; email?: string }>(r); return o?.fullName || o?.name || o?.firstName || o?.email || '' }
const when = (d?: string) => {
  if (!d) return ''
  const t = new Date(d)
  const today = new Date().toDateString() === t.toDateString()
  return today ? t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } })
  const j = await res.json().catch(() => ({}))
  if (!res.ok || (j as { ok?: boolean }).ok === false) throw new Error((j as { error?: string; errors?: { message: string }[] }).error || (j as { errors?: { message: string }[] }).errors?.[0]?.message || `Error ${res.status}`)
  return j as T
}
const act = (body: Record<string, unknown>) => api<{ ok: boolean; status?: string; delivery?: string; conversationId?: number }>('/api/admin/inbox', { method: 'POST', body: JSON.stringify(body) })

function listQuery(filter: Filter, q: string, me?: number) {
  const p = new URLSearchParams({ depth: '1', limit: '60', sort: '-lastMessageAt' })
  let i = 0
  const and = (k: string, v: string) => p.set(`where[and][${i++}]${k}`, v)
  if (filter === 'open' || filter === 'pending' || filter === 'closed') and('[status][equals]', filter)
  if (filter === 'mine' && me) and('[assignedTo][equals]', String(me))
  if (filter === 'unassigned') and('[assignedTo][exists]', 'false')
  if (filter === 'mine' || filter === 'unassigned') and('[status][not_equals]', 'closed')
  if (q.trim()) {
    p.set(`where[and][${i}][or][0][subject][like]`, q.trim())
    p.set(`where[and][${i}][or][1][lastMessagePreview][like]`, q.trim())
  }
  return `/api/conversations?${p}`
}

/** The Inbox: every email, chat, WhatsApp and phone conversation with guests. */
export function InboxClient() {
  const { user } = useAuth()
  const me = (user as { id?: number } | null)?.id
  const [filter, setFilter] = useState<Filter>('open')
  const [q, setQ] = useState('')
  const [list, setList] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [conv, setConv] = useState<Conversation | null>(null)
  const [canned, setCanned] = useState<Canned[]>([])
  const [team, setTeam] = useState<{ id: number; name: string }[]>([])
  const [mode, setMode] = useState<'reply' | 'note'>('reply')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [panel, setPanel] = useState<null | 'log' | 'new'>(null)
  const threadEnd = useRef<HTMLDivElement>(null)

  const loadList = useCallback(async () => {
    try {
      const r = await api<{ docs: Conversation[] }>(listQuery(filter, q, me))
      setList(r.docs)
    } catch (e) {
      setNotice({ tone: 'error', text: (e as Error).message })
    } finally {
      setLoading(false)
    }
  }, [filter, q, me])

  const loadThread = useCallback(async (id: number) => {
    const [c, m] = await Promise.all([
      api<Conversation>(`/api/conversations/${id}?depth=1`),
      api<{ docs: Message[] }>(`/api/messages?where[conversation][equals]=${id}&sort=createdAt&limit=300&depth=1`),
    ])
    setConv(c)
    setMessages(m.docs)
    if (c.unread) act({ action: 'update', conversationId: id, read: true }).catch(() => {})
  }, [])

  // first load: saved replies, team, and ?c= from notification links
  useEffect(() => {
    api<{ docs: Canned[] }>('/api/canned-replies?limit=100&sort=title').then((r) => setCanned(r.docs)).catch(() => {})
    api<{ docs: { id: number; name: string }[] }>('/api/users?limit=100&depth=0&where[active][not_equals]=false').then((r) => setTeam(r.docs)).catch(() => {})
    const c = Number(new URLSearchParams(window.location.search).get('c'))
    if (c) {
      const raf = requestAnimationFrame(() => setSelected(c))
      return () => cancelAnimationFrame(raf)
    }
  }, [])

  // refresh every few seconds (instant updates arrive with live chat)
  useEffect(() => {
    let alive = true
    const tick = () => {
      if (!alive || document.hidden) return
      // while the Inbox is open, website visitors see the team as online in the chat
      act({ action: 'presence' }).catch(() => {})
      loadList()
      if (selected) loadThread(selected).catch(() => {})
    }
    const raf = requestAnimationFrame(tick)
    const t = setInterval(tick, 8000)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      clearInterval(t)
    }
  }, [loadList, loadThread, selected])

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, selected])

  const contact = obj<{ id: number; fullName?: string; firstName?: string; email?: string; phone?: string; country?: string }>(conv?.contact)
  const agentName = (user as { name?: string } | null)?.name ?? ''
  const insertCanned = (id: string) => {
    const c = canned.find((x) => String(x.id) === id)
    if (!c) return
    const filled = c.body.replaceAll('{firstName}', contact?.firstName ?? '').replaceAll('{agentName}', agentName)
    setText((t) => (t ? `${t}\n\n${filled}` : filled))
  }

  const send = async () => {
    if (!conv || !text.trim()) return
    setBusy(true)
    setNotice(null)
    try {
      const r = await act({ action: mode === 'note' ? 'note' : 'reply', conversationId: conv.id, body: text })
      setText('')
      const chatNote = { live: 'Sent to the chat.', emailed: 'Sent to the chat and by email (the visitor had left).', 'no-email': 'Sent to the chat. The visitor has left and gave no email, so they see it when they come back.', 'email-failed': 'Sent to the chat, but the email copy failed.' } as Record<string, string>
      setNotice({ tone: 'ok', text: mode === 'note' ? 'Note added (only the team sees it).' : conv.channel === 'chat' ? (chatNote[r.delivery ?? 'live'] ?? 'Sent.') : r.status === 'logged' ? (conv.channel === 'email' ? 'Saved, but email is not set up yet, so it was not sent. Connect Postmark on the Integrations page.' : 'Logged.') : 'Sent.' })
      await loadThread(conv.id)
      loadList()
    } catch (e) {
      setNotice({ tone: 'error', text: (e as Error).message })
    }
    setBusy(false)
  }

  const update = async (data: Record<string, unknown>) => {
    if (!conv) return
    await act({ action: 'update', conversationId: conv.id, ...data }).catch((e) => setNotice({ tone: 'error', text: (e as Error).message }))
    await loadThread(conv.id)
    loadList()
  }

  const counts = useMemo(() => list.reduce((a, c) => a + (c.unread ?? 0), 0), [list])

  return (
    <div className="ng-inbox">
      <div className="ng-inbox__bar">
        <div className="ng-inbox__filters" role="tablist" aria-label="Show">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" role="tab" aria-selected={filter === f.key} className={`ng-chip${filter === f.key ? ' is-on' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
        <div className="ng-inbox__tools">
          <input className="ng-input" type="search" placeholder="Search subject or message" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search conversations" />
          <button type="button" className="ng-btn ng-btn--ghost" onClick={() => setPanel(panel === 'log' ? null : 'log')}>Log WhatsApp / call</button>
          <button type="button" className="ng-btn ng-btn--primary" onClick={() => setPanel(panel === 'new' ? null : 'new')}>New email</button>
        </div>
      </div>
      {panel && <ComposePanel kind={panel} onDone={(id) => { setPanel(null); if (id) setSelected(id); loadList() }} />}
      {notice && <p role="status" className={notice.tone === 'error' ? 'ng-notice ng-notice--ochre' : 'ng-notice'}>{notice.text}</p>}

      <div className={`ng-inbox__grid${selected ? ' has-thread' : ''}`}>
        <ul className="ng-inbox__list" aria-label={`Conversations${counts ? `, ${counts} unread messages` : ''}`}>
          {loading && <li className="ng-empty">Loading…</li>}
          {!loading && list.length === 0 && <li className="ng-empty">Nothing here. {filter === 'open' ? 'Every guest has had a reply.' : ''}</li>}
          {list.map((c) => (
            <li key={c.id}>
              <button type="button" className={`ng-inbox__item${selected === c.id ? ' is-on' : ''}${c.unread ? ' is-unread' : ''}`} onClick={() => setSelected(c.id)} aria-current={selected === c.id ? 'true' : undefined}>
                <span className="ng-inbox__row">
                  <strong>{nameOf(c.contact) || 'Unknown guest'}</strong>
                  <time>{when(c.lastMessageAt)}</time>
                </span>
                <span className="ng-inbox__subject">{c.subject}</span>
                <span className="ng-inbox__preview">{c.lastDirection === 'out' ? 'You: ' : ''}{c.lastMessagePreview}</span>
                <span className="ng-inbox__row">
                  <span className="ng-pill ng-pill--neutral">{CHANNEL[c.channel]}</span>
                  {c.unread ? <span className="ng-pill ng-pill--alert">{c.unread} new</span> : null}
                  {c.assignedTo ? <span className="ng-inbox__agent">{nameOf(c.assignedTo)}</span> : <span className="ng-inbox__agent">Unassigned</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <section className="ng-inbox__thread" aria-label="Conversation">
          {!conv || conv.id !== selected ? (
            <p className="ng-empty">{selected ? 'Loading…' : 'Choose a conversation.'}</p>
          ) : (
            <>
              <header className="ng-inbox__head">
                <button type="button" className="ng-btn ng-btn--ghost ng-inbox__back" onClick={() => setSelected(null)}><Icon name="arrow-left" size={16} /> All</button>
                <div>
                  <h2 className="ng-h2">{conv.subject}</h2>
                  <p className="ng-intro">{nameOf(conv.contact)}{contact?.email ? ` · ${contact.email}` : ''} · {CHANNEL[conv.channel]}</p>
                </div>
                <div className="ng-inbox__controls">
                  <label>Status
                    <select className="ng-input" value={conv.status} onChange={(e) => update({ status: e.target.value })}>
                      <option value="open">Needs reply</option><option value="pending">Waiting on guest</option><option value="closed">Closed</option>
                    </select>
                  </label>
                  <label>Assigned to
                    <select className="ng-input" value={String(obj<{ id: number }>(conv.assignedTo)?.id ?? conv.assignedTo ?? '')} onChange={(e) => update({ assignedTo: e.target.value || null })}>
                      <option value="">Nobody</option>
                      {team.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </label>
                </div>
              </header>

              <ol className="ng-inbox__messages">
                {messages.map((m) => (
                  <li key={m.id} className={`ng-msg ng-msg--${m.direction}${m.automated ? ' is-auto' : ''}`}>
                    <p className="ng-msg__meta">
                      <strong>{m.direction === 'in' ? (m.fromName || m.fromEmail || nameOf(conv.contact)) : m.direction === 'note' ? `Note · ${nameOf(m.author)}` : m.automated ? 'Sent automatically' : nameOf(m.author) || 'Team'}</strong>
                      {' · '}{new Date(m.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {m.channel !== conv.channel && <> · {CHANNEL[m.channel] ?? m.channel}</>}
                      {m.deliveryStatus === 'logged' && <span className="ng-pill ng-pill--ochre">Not sent: email not set up</span>}
                      {m.deliveryStatus === 'failed' && <span className="ng-pill ng-pill--alert">Failed to send</span>}
                    </p>
                    <div className="ng-msg__body">{m.body}</div>
                  </li>
                ))}
                <div ref={threadEnd} />
              </ol>

              <div className="ng-inbox__composer">
                <div className="ng-inbox__row">
                  <div role="tablist" aria-label="Write">
                    <button type="button" role="tab" aria-selected={mode === 'reply'} className={`ng-chip${mode === 'reply' ? ' is-on' : ''}`} onClick={() => setMode('reply')}>{conv.channel === 'email' ? 'Reply by email' : conv.channel === 'chat' ? 'Reply in chat' : 'Log our reply'}</button>
                    <button type="button" role="tab" aria-selected={mode === 'note'} className={`ng-chip${mode === 'note' ? ' is-on' : ''}`} onClick={() => setMode('note')}>Internal note</button>
                  </div>
                  {mode === 'reply' && canned.length > 0 && (
                    <select className="ng-input" value="" onChange={(e) => insertCanned(e.target.value)} aria-label="Insert a saved reply">
                      <option value="">Insert saved reply…</option>
                      {canned.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  )}
                </div>
                <textarea className="ng-input ng-inbox__text" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={mode === 'note' ? 'Only the team sees notes.' : conv.channel === 'email' ? `Write to ${contact?.firstName ?? 'the guest'}… Your signature is added automatically.` : 'What did we reply?'} aria-label={mode === 'note' ? 'Internal note' : 'Reply'} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') send() }} />
                <div className="ng-inbox__row">
                  <span className="ng-tools__ok">{mode === 'reply' && conv.channel === 'email' ? 'The guest\'s reply comes back to this conversation.' : ''}</span>
                  <button type="button" className="ng-btn ng-btn--primary" disabled={busy || !text.trim()} onClick={send}>{busy ? 'Sending…' : mode === 'note' ? 'Add note' : conv.channel === 'email' ? 'Send' : 'Save'}</button>
                </div>
              </div>
            </>
          )}
        </section>

        {conv && conv.id === selected && contact && (
          <aside className="ng-inbox__side" aria-label="Guest">
            <p className="ng-eyebrow">Guest</p>
            <p className="ng-inbox__name">{contact.fullName ?? contact.firstName}</p>
            <ul className="ng-inbox__facts">
              {contact.email && <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
              {contact.phone && <li>{contact.phone} · <a href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>}
              {contact.country && <li>{contact.country}</li>}
            </ul>
            <ul className="ng-inbox__links">
              <li><Link href={`/admin/collections/contacts/${contact.id}`}>Contact record</Link></li>
              <li><Link href={`/admin/collections/contacts/${contact.id}/timeline`}>Timeline</Link></li>
              {conv.lead ? <li><Link href={`/admin/collections/leads/${obj<{ id: number }>(conv.lead)?.id ?? conv.lead}`}>Lead</Link></li> : null}
              <li><Link href="/admin/collections/quotes/create">New quote</Link></li>
            </ul>
          </aside>
        )}
      </div>
    </div>
  )
}

/** Small forms: start a new email, or log a WhatsApp chat / phone call. */
function ComposePanel({ kind, onDone }: { kind: 'log' | 'new'; onDone: (conversationId?: number) => void }) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<{ id: number; fullName?: string; email?: string }[]>([])
  const [contact, setContact] = useState<{ id: number; fullName?: string; email?: string } | null>(null)
  const [channel, setChannel] = useState<'whatsapp' | 'phone'>('whatsapp')
  const [direction, setDirection] = useState<'in' | 'out'>('in')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (term.trim().length < 2) return
    const t = setTimeout(() => {
      const p = new URLSearchParams({ limit: '8', depth: '0', 'where[or][0][fullName][like]': term.trim(), 'where[or][1][email][like]': term.trim() })
      api<{ docs: { id: number; fullName?: string; email?: string }[] }>(`/api/contacts?${p}`).then((r) => setResults(r.docs)).catch(() => {})
    }, 250)
    return () => clearTimeout(t)
  }, [term])
  const submit = async () => {
    if (!contact) return setErr('Choose the guest first.')
    setBusy(true)
    setErr('')
    try {
      const r = await act(kind === 'log' ? { action: 'log', contactId: contact.id, channel, direction, body } : { action: 'new', contactId: contact.id, subject, body })
      onDone(r.conversationId)
    } catch (e) {
      setErr((e as Error).message)
    }
    setBusy(false)
  }
  return (
    <div className="ng-inbox__panel">
      <p className="ng-h2">{kind === 'log' ? 'Log a WhatsApp chat or phone call' : 'New email to a guest'}</p>
      {kind === 'log' && <p className="ng-intro">Type or paste what was said, so the conversation is on the guest&apos;s record.</p>}
      {contact ? (
        <p>Guest: <strong>{contact.fullName}</strong> {contact.email && `(${contact.email})`} <button type="button" className="ng-link" onClick={() => setContact(null)}>Change</button></p>
      ) : (
        <div>
          <input className="ng-input" placeholder="Search guests by name or email" value={term} onChange={(e) => setTerm(e.target.value)} aria-label="Search guests" />
          {results.length > 0 && <ul className="ng-inbox__results">{results.map((c) => <li key={c.id}><button type="button" className="ng-link" onClick={() => setContact(c)}>{c.fullName} {c.email && `· ${c.email}`}</button></li>)}</ul>}
          <p className="ng-tools__ok">New guest? Add them in <Link href="/admin/collections/contacts/create">Contacts</Link> first.</p>
        </div>
      )}
      {kind === 'log' ? (
        <div className="ng-inbox__row">
          <select className="ng-input" value={channel} onChange={(e) => setChannel(e.target.value as 'whatsapp' | 'phone')} aria-label="Channel"><option value="whatsapp">WhatsApp</option><option value="phone">Phone call</option></select>
          <select className="ng-input" value={direction} onChange={(e) => setDirection(e.target.value as 'in' | 'out')} aria-label="Who wrote"><option value="in">From the guest</option><option value="out">From us</option></select>
        </div>
      ) : (
        <input className="ng-input" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject" />
      )}
      <textarea className="ng-input ng-inbox__text" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder={kind === 'log' ? 'What was said' : 'Your message. Your signature is added automatically.'} aria-label="Message" />
      {err && <p role="alert" className="ng-notice ng-notice--ochre">{err}</p>}
      <div className="ng-inbox__row">
        <button type="button" className="ng-btn ng-btn--ghost" onClick={() => onDone()}>Cancel</button>
        <button type="button" className="ng-btn ng-btn--primary" disabled={busy} onClick={submit}>{busy ? 'Saving…' : kind === 'log' ? 'Save to the Inbox' : 'Send email'}</button>
      </div>
    </div>
  )
}
