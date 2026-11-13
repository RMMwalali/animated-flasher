'use client'
import { Checkbox, Field, Label, Radio, RadioGroup } from '@headlessui/react'
import Link from 'next/link'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Icon } from '@/components/icons/Icon'
import { sourceFor } from '@/lib/attribution'
import { Honeypot, TextAreaField, TextField } from './fields'
import { Turnstile } from './Turnstile'

type Trip = { slug: string; title: string; days: number }
type Errors = Partial<Record<string, string>>

const INTERESTS = [
  ['safari', 'Safari', 'binoculars'], ['coast', 'Beach & coast', 'wave'], ['marine', 'Snorkel & dhow', 'dhow'], ['walking', 'Walking & trekking', 'footprints'],
  ['culture', 'Culture & history', 'globe'], ['family', 'Family trip', 'users'], ['honeymoon', 'Honeymoon', 'star'], ['birding', 'Birding', 'bird'],
] as const
const STYLES = [
  ['comfort', 'Comfortable', 'Good lodges and tented camps, great value'],
  ['boutique', 'Boutique', 'Smaller, characterful camps and hotels'],
  ['luxury', 'Luxury', 'The very best camps and private experiences'],
] as const
const BUDGETS = ['Under US$1,500 pp', 'US$1,500 to 3,000 pp', 'US$3,000 to 6,000 pp', 'Over US$6,000 pp', 'Not sure yet'] as const
const STEPS = ['What', 'When', 'Who', 'Style', 'You'] as const

/**
 * Multi-step trip request. With a journey selected it is a booking request
 * (request-to-book: nothing is charged until we confirm).
 */
export function PlanForm({ trips, initialTrip }: { trips: Trip[]; initialTrip?: Trip | null }) {
  const [step, setStep] = useState(0)
  const [startedAt] = useState(() => Date.now())
  const [tripSlug, setTripSlug] = useState(initialTrip?.slug ?? '')
  const [interests, setInterests] = useState<string[]>([])
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [flexible, setFlexible] = useState(false)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [ages, setAges] = useState('')
  const [nationalities, setNationalities] = useState('')
  const [style, setStyle] = useState<string>('comfort')
  const [budget, setBudget] = useState<string>('Not sure yet')
  const [occasion, setOccasion] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [honey, setHoney] = useState('')
  const [token, setToken] = useState<string>()
  const [errors, setErrors] = useState<Errors>({})
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const panel = useRef<HTMLDivElement>(null)
  const onToken = useCallback((t: string) => setToken(t), [])
  const trip = useMemo(() => trips.find((t) => t.slug === tripSlug), [trips, tripSlug])
  const booking = Boolean(trip)

  const validate = (s: number): Errors => {
    const e: Errors = {}
    if (s === 0 && !trip && interests.length === 0) e.interests = 'Choose at least one, or pick a journey.'
    if (s === 1 && booking && !start) e.travelStart = 'Choose a start date for your booking request.'
    if (s === 1 && start && end && end < start) e.travelEnd = 'The end date is before the start date.'
    if (s === 2 && adults + children < 1) e.adults = 'At least one traveller.'
    if (s === 4) {
      if (name.trim().length < 2) e.name = 'Please tell us your name'
      if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Please enter a valid email'
    }
    return e
  }
  const go = (to: number) => {
    if (to > step) {
      const e = validate(step)
      setErrors(e)
      if (Object.keys(e).length) return
    }
    setErrors({})
    setStep(to)
    requestAnimationFrame(() => panel.current?.focus())
  }

  async function submit() {
    const e = validate(4)
    setErrors(e)
    if (Object.keys(e).length) return
    setState('sending')
    const body = {
      name, email, phone, message, interests: trip ? interests : interests,
      tripSlug: tripSlug || undefined, travelStart: start || undefined, travelEnd: end || undefined, datesFlexible: flexible,
      adults, children, budget, consentMarketing: consent, website: honey, startedAt, turnstileToken: token,
      extra: {
        requestType: booking ? 'booking request' : 'trip plan',
        style: STYLES.find((x) => x[0] === style)?.[1] ?? style,
        ...(ages ? { childrenAges: ages } : {}),
        ...(nationalities ? { nationalities } : {}),
        ...(occasion ? { occasion } : {}),
      },
      source: sourceFor('plan', booking ? `request-to-book-${tripSlug}` : 'plan-your-trip'),
    }
    try {
      const res = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: Errors; error?: string }
      if (res.ok && json.ok) return setState('sent')
      setErrors(json.errors ?? { form: json.error ?? 'Something went wrong. Please try again or email us.' })
    } catch {
      setErrors({ form: 'We could not reach our server. Please check your connection and try again.' })
    }
    setState('idle')
  }

  if (state === 'sent') {
    return (
      <div role="status" className="grid gap-4 py-10">
        <Icon name="check" size={44} className="text-green" />
        <p className="font-display text-4xl">Asante, {name.split(' ')[0]}.</p>
        <p className="max-w-xl text-lg">
          {booking
            ? `We have your booking request for ${trip!.title}. We will check availability and send your confirmed price, usually within one working day. Nothing is charged until you accept.`
            : 'We have your trip plan. A member of our Diani team will reply personally with ideas and a clear price.'}
        </p>
        <p className="max-w-xl text-deep/85">A confirmation is on its way to {email}. Travelling from abroad? Read our <Link href="/kenya-eta" className="underline underline-offset-4">Kenya eTA guide</Link>.</p>
      </div>
    )
  }

  const chip = 'group flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-deep/25 bg-cream px-4 text-left data-checked:border-deep data-checked:bg-deep data-checked:text-cream data-focus:ring-2 data-focus:ring-orange-600/50'
  return (
    <div className="relative">
      <Honeypot value={honey} onChange={setHoney} />
      {/* progress */}
      <ol className="mb-10 grid grid-cols-5 gap-2" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => i < step && go(i)} disabled={i > step} className="grid w-full gap-2 text-left disabled:cursor-default" aria-current={i === step ? 'step' : undefined}>
              <span className={`h-1 rounded-full ${i <= step ? 'bg-orange-600' : 'bg-deep/15'}`} />
              <span className={`font-mono text-[11px] uppercase tracking-[0.14em] ${i === step ? 'text-deep' : 'text-deep/80'}`}>{String(i + 1).padStart(2, '0')} {s}</span>
            </button>
          </li>
        ))}
      </ol>

      <div ref={panel} tabIndex={-1} className="outline-none" aria-live="polite">
        {step === 0 && (
          <fieldset className="grid gap-8">
            <legend className="font-display text-3xl">{booking ? 'Your journey' : 'What would you love to do?'}</legend>
            <Field>
              <Label className="text-sm font-semibold">Journey (optional)</Label>
              <select value={tripSlug} onChange={(e) => setTripSlug(e.target.value)} className="mt-2 block min-h-12 w-full rounded-xl border border-deep/25 bg-cream px-4 text-base">
                <option value="">No particular journey: plan something for me</option>
                {trips.map((t) => <option key={t.slug} value={t.slug}>{t.title} ({t.days} {t.days === 1 ? 'day' : 'days'})</option>)}
              </select>
            </Field>
            <div>
              <p className="text-sm font-semibold">{booking ? 'Anything to add?' : 'Interests'}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {INTERESTS.map(([v, l, icon]) => (
                  <Field key={v}>
                    <Checkbox checked={interests.includes(v)} onChange={(c) => setInterests((xs) => (c ? [...xs, v] : xs.filter((x) => x !== v)))} className={chip}>
                      <Icon name={icon} size={20} />
                      <Label className="cursor-pointer">{l}</Label>
                    </Checkbox>
                  </Field>
                ))}
              </div>
              {errors.interests && <p className="mt-2 text-sm text-[#9e2a1a]" role="alert">{errors.interests}</p>}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="grid gap-6">
            <legend className="font-display text-3xl">When?</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label={booking ? 'Start date' : 'Arriving around'} type="date" value={start} onChange={(e) => setStart(e.target.value)} required={booking} error={errors.travelStart} />
              <TextField label="Leaving around (optional)" type="date" value={end} onChange={(e) => setEnd(e.target.value)} error={errors.travelEnd} />
            </div>
            <Field className="flex items-center gap-3">
              <Checkbox checked={flexible} onChange={setFlexible} className="group grid size-6 place-items-center rounded-md border border-deep/40 data-checked:bg-deep data-focus:ring-2 data-focus:ring-orange-600/50">
                <Icon name="check" size={16} className="hidden text-cream group-data-checked:block" />
              </Checkbox>
              <Label>My dates are flexible</Label>
            </Field>
            <p className="text-sm text-deep/85">Not sure when to go? See <Link href="/when-to-go" className="underline underline-offset-4">when to go, month by month</Link>.</p>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="grid gap-6">
            <legend className="font-display text-3xl">Who is travelling?</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Adults" type="number" min={0} max={50} inputMode="numeric" value={adults} onChange={(e) => setAdults(Math.max(0, Number(e.target.value)))} error={errors.adults} />
              <TextField label="Children" type="number" min={0} max={50} inputMode="numeric" value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))} />
            </div>
            {children > 0 && <TextField label="Children's ages" value={ages} onChange={(e) => setAges(e.target.value)} placeholder="e.g. 6 and 11" hint="Some camps have minimum ages; park fees vary by age." />}
            <TextField label="Nationalities (optional)" value={nationalities} onChange={(e) => setNationalities(e.target.value)} placeholder="e.g. British, Kenyan" hint={<>Helps us advise on the <Link href="/kenya-eta" className="underline">Kenya eTA</Link> and resident park rates.</>} />
            <TextField label="Special occasion? (optional)" value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="Honeymoon, birthday, anniversary…" />
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="grid gap-8">
            <legend className="font-display text-3xl">Your style</legend>
            <RadioGroup value={style} onChange={setStyle} aria-label="Accommodation style" className="grid gap-3 sm:grid-cols-3">
              {STYLES.map(([v, l, d]) => (
                <Radio key={v} value={v} className="group cursor-pointer rounded-2xl border border-deep/25 bg-cream p-5 data-checked:border-deep data-checked:bg-deep data-checked:text-cream data-focus:ring-2 data-focus:ring-orange-600/50">
                  <span className="font-display text-xl">{l}</span>
                  <span className="mt-1 block text-sm opacity-85">{d}</span>
                </Radio>
              ))}
            </RadioGroup>
            <div>
              <p className="text-sm font-semibold">Budget per person (excluding international flights)</p>
              <RadioGroup value={budget} onChange={setBudget} aria-label="Budget per person" className="mt-3 flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <Radio key={b} value={b} className="min-h-11 cursor-pointer rounded-full border border-deep/25 px-4 py-2.5 text-sm data-checked:border-deep data-checked:bg-deep data-checked:text-cream data-focus:ring-2 data-focus:ring-orange-600/50">{b}</Radio>
                ))}
              </RadioGroup>
            </div>
          </fieldset>
        )}

        {step === 4 && (
          <fieldset className="grid gap-5">
            <legend className="font-display text-3xl">Your details</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required error={errors.name} />
              <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required error={errors.email} />
            </div>
            <TextField label="Phone or WhatsApp (optional)" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <TextAreaField label="Anything else we should know?" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Must-sees, mobility needs, dietary requirements…" />
            <Field className="flex items-start gap-3">
              <Checkbox checked={consent} onChange={setConsent} className="group mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-deep/40 data-checked:bg-deep data-focus:ring-2 data-focus:ring-orange-600/50">
                <Icon name="check" size={16} className="hidden text-cream group-data-checked:block" />
              </Checkbox>
              <Label className="text-sm">Send me occasional news and seasonal ideas (optional).</Label>
            </Field>
            <Turnstile onToken={onToken} />
            {booking && (
              <p className="rounded-2xl bg-sky-50 p-4 text-sm">
                <strong>Request to book: {trip!.title}.</strong> No payment now. We confirm availability and your price first; then you can pay a deposit by M-Pesa or card.
              </p>
            )}
            {errors.form && <p role="alert" className="rounded-xl bg-[#f8e4df] px-4 py-3 text-sm text-[#7a2114]">{errors.form}</p>}
          </fieldset>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="btn btn-ghost disabled:invisible">
          <Icon name="arrow-left" size={18} /> <span>Back</span>
        </button>
        {step < 4 ? (
          <button type="button" onClick={() => go(step + 1)} className="btn btn-primary">
            Next: {STEPS[step + 1]} <Icon name="arrow-right" size={18} />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={state === 'sending'} className="btn btn-primary" data-cta={booking ? `request-to-book-${tripSlug}` : 'plan-your-trip-submit'}>
            {state === 'sending' ? 'Sending…' : booking ? 'Send booking request' : 'Send my trip plan'} <Icon name="send" size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
