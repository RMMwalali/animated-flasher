'use client'
import Link from 'next/link'
import { Checkbox, Field, Label } from '@headlessui/react'
import { useCallback, useState } from 'react'
import { Icon } from '@/components/icons/Icon'
import { sourceFor } from '@/lib/attribution'
import { Honeypot, TextAreaField, TextField } from './fields'
import { Turnstile } from './Turnstile'

const INTERESTS = [
  ['safari', 'Safari'], ['coast', 'Coast & beach'], ['marine', 'Snorkel & dhow'], ['walking', 'Walking'],
  ['culture', 'Culture & history'], ['family', 'Family'], ['honeymoon', 'Honeymoon'],
] as const

type Errors = Partial<Record<string, string>>

/** Short enquiry form used on the home page, journey pages and contact page. */
export function EnquiryForm({ ctaId, tripSlug, compact = false }: { ctaId: string; tripSlug?: string; compact?: boolean }) {
  const [startedAt] = useState(() => Date.now())
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState('')
  const [honey, setHoney] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [consent, setConsent] = useState(false)
  const [token, setToken] = useState<string>()
  const onToken = useCallback((t: string) => setToken(t), [])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const body = {
      name: String(f.get('name') ?? ''),
      email: String(f.get('email') ?? ''),
      phone: String(f.get('phone') ?? ''),
      travelStart: String(f.get('travelStart') ?? ''),
      adults: f.get('adults') ? Number(f.get('adults')) : undefined,
      children: f.get('children') ? Number(f.get('children')) : undefined,
      message,
      interests,
      tripSlug,
      consentMarketing: consent,
      website: honey,
      startedAt,
      turnstileToken: token,
      source: sourceFor('form', ctaId),
    }
    setState('sending')
    setErrors({})
    try {
      const res = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: Errors; error?: string }
      if (res.ok && json.ok) {
        setState('sent')
        return
      }
      setErrors(json.errors ?? { form: json.error ?? 'Something went wrong. Please try again or email us.' })
      setState('error')
    } catch {
      setErrors({ form: 'We could not reach our server. Please check your connection and try again.' })
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div role="status" className="grid gap-4 py-6">
        <Icon name="check" size={40} className="text-green" />
        <p className="font-display text-3xl font-medium">Asante! We have your enquiry.</p>
        <p className="text-lg">A member of our Diani team will reply personally. We have sent a confirmation to your email.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="relative grid gap-5" aria-describedby="enq-note">
      <Honeypot value={honey} onChange={setHoney} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Your name" name="name" autoComplete="name" required error={errors.name} />
        <TextField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
      </div>
      {!compact && (
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField label="Arriving around" name="travelStart" type="date" error={errors.travelStart} />
          <TextField label="Adults" name="adults" type="number" min={0} max={50} defaultValue={2} inputMode="numeric" />
          <TextField label="Children" name="children" type="number" min={0} max={50} defaultValue={0} inputMode="numeric" />
        </div>
      )}
      {!compact && (
        <fieldset>
          <legend className="text-sm font-semibold">I am interested in</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTERESTS.map(([v, l]) => {
              const on = interests.includes(v)
              return (
                <Field key={v} className="flex">
                  <Checkbox
                    checked={on}
                    onChange={(c) => setInterests((xs) => (c ? [...xs, v] : xs.filter((x) => x !== v)))}
                    className="group flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-deep/30 px-4 text-sm data-checked:border-deep data-checked:bg-deep data-checked:text-cream data-focus:ring-2 data-focus:ring-orange-600/50"
                  >
                    <Icon name="check" size={16} className="hidden group-data-checked:block" />
                    <Label className="cursor-pointer">{l}</Label>
                  </Checkbox>
                </Field>
              )
            })}
          </div>
        </fieldset>
      )}
      <TextAreaField label="Tell us about your trip" name="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Dates, who is travelling, what you would love to see…" error={errors.message} />
      {!compact && <TextField label="Phone or WhatsApp (optional)" name="phone" type="tel" autoComplete="tel" />}
      <Field className="flex items-start gap-3">
        <Checkbox checked={consent} onChange={setConsent} className="group mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-deep/40 data-checked:bg-deep data-focus:ring-2 data-focus:ring-orange-600/50">
          <Icon name="check" size={16} className="hidden text-cream group-data-checked:block" />
        </Checkbox>
        <Label className="text-sm">Send me occasional news and seasonal ideas (optional).</Label>
      </Field>
      <Turnstile onToken={onToken} />
      {errors.form && <p role="alert" className="rounded-xl bg-[#f8e4df] px-4 py-3 text-sm text-[#7a2114]">{errors.form}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={state === 'sending'} data-cta={ctaId}>
          {state === 'sending' ? 'Sending…' : 'Send enquiry'} <Icon name="send" size={18} />
        </button>
        <p id="enq-note" className="text-sm text-deep/80">We reply personally. <Link href="/privacy" className="underline">Privacy</Link></p>
      </div>
    </form>
  )
}
