'use client'
import { useState, type FormEvent } from 'react'
import { Icon } from '@/components/icons/Icon'
import { TextAreaField, TextField } from '@/components/forms/fields'

export type TravellerRow = {
  id?: number
  name: string
  nationality: string
  dateOfBirth: string
  dietary: string
  emergencyName: string
  emergencyPhone: string
  /** health notes are never sent back to the page; this only says some are saved */
  hasMedical?: boolean
}

export type Flights = { arrivalFlight: string; arrivalAt: string; pickup: string; departureFlight: string; departureAt: string; dropoff: string; guestNotes: string }

/** Flight times are typed in Kenya time (UTC+3). */
const kenyaTime = (v: string) => (v ? `${v.slice(0, 16)}:00+03:00` : '')

const blank = (): TravellerRow => ({ name: '', nationality: '', dateOfBirth: '', dietary: '', emergencyName: '', emergencyPhone: '' })

/** "Who's travelling" on the guest's trip page. */
export function TravellerDetailsForm({ token, pax, initial, flights: initialFlights, missing: initialMissing }: { token: string; pax: number; initial: TravellerRow[]; flights: Flights; missing: string[] }) {
  const [rows, setRows] = useState<TravellerRow[]>(() => {
    const r = initial.length ? initial : []
    while (r.length < Math.max(1, pax)) r.push(blank())
    return r
  })
  const [flights, setFlights] = useState<Flights>(initialFlights)
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [missing, setMissing] = useState(initialMissing)

  const set = (i: number, k: keyof TravellerRow, v: string) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)))
  const setF = (k: keyof Flights, v: string) => setFlights((f) => ({ ...f, [k]: v }))

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const travellers = rows
      .map((r, i) => ({ ...r, medicalNotes: String(form.get(`medical-${i}`) ?? '') }))
      .filter((r) => r.name.trim())
      .map(({ hasMedical: _h, ...r }) => r)
    if (!travellers.length) {
      setState('error')
      setMessage('Please add at least one traveller\'s name.')
      return
    }
    setState('saving')
    setMessage('')
    try {
      const res = await fetch('/api/trip/details', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, travellers, ...flights, arrivalAt: kenyaTime(flights.arrivalAt), departureAt: kenyaTime(flights.departureAt) }) })
      const json = (await res.json()) as { ok: boolean; error?: string; missing?: string[] }
      if (!json.ok) throw new Error(json.error || 'Your details could not be saved.')
      setMissing(json.missing ?? [])
      setState('saved')
      setMessage('Asante! Your details are saved and your planner has them.')
      // so new travellers get their ids for the next save
      window.setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      setState('error')
      setMessage((err as Error).message)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 grid gap-6" data-no-print>
      {missing.length > 0 ? (
        <p className="rounded-2xl bg-ochre/20 px-5 py-4 text-[0.97rem]"><strong>Still needed:</strong> {missing.join('; ')}.</p>
      ) : (
        <p className="flex items-center gap-2 rounded-2xl bg-teal/10 px-5 py-4 text-[0.97rem]"><Icon name="check" size={18} className="text-teal" /> All details are in. You can still change them here.</p>
      )}

      {rows.map((r, i) => (
        <fieldset key={r.id ?? `new-${i}`} className="grid gap-4 rounded-3xl border border-line bg-paper p-5 sm:p-6">
          <legend className="flex w-full items-center justify-between gap-3 px-1 font-display text-2xl">
            <span>Traveller {i + 1}{r.name ? `: ${r.name}` : ''}</span>
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Full name, as on passport" value={r.name} onChange={(e) => set(i, 'name', e.target.value)} autoComplete={i === 0 ? 'name' : 'off'} required />
            <TextField label="Nationality" value={r.nationality} onChange={(e) => set(i, 'nationality', e.target.value)} hint="Park fees depend on it." autoComplete={i === 0 ? 'country-name' : 'off'} />
            <TextField label="Date of birth" type="date" value={r.dateOfBirth} onChange={(e) => set(i, 'dateOfBirth', e.target.value)} max={new Date().toISOString().slice(0, 10)} />
            <TextField label="Food needs or allergies" value={r.dietary} onChange={(e) => set(i, 'dietary', e.target.value)} placeholder="e.g. vegetarian, no nuts" />
            <TextField label="Emergency contact name" value={r.emergencyName} onChange={(e) => set(i, 'emergencyName', e.target.value)} hint="Someone not on the trip." />
            <TextField label="Emergency contact phone" type="tel" value={r.emergencyPhone} onChange={(e) => set(i, 'emergencyPhone', e.target.value)} />
          </div>
          <TextAreaField
            label={r.hasMedical ? 'Health or mobility notes (saved; type here to replace them)' : 'Health or mobility notes (optional, private)'}
            name={`medical-${i}`}
            placeholder="Anything that helps us look after you. Only your planner can see this."
            className="[&_textarea]:min-h-20"
          />
          {rows.length > 1 && (
            <button type="button" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-semibold underline underline-offset-4">
              <Icon name="trash" size={16} /> Remove this traveller
            </button>
          )}
        </fieldset>
      ))}
      <button type="button" onClick={() => setRows((rs) => [...rs, blank()])} className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-semibold underline underline-offset-4">
        <Icon name="plus" size={16} /> Add a traveller
      </button>

      <fieldset className="grid gap-4 rounded-3xl border border-line bg-paper p-5 sm:p-6">
        <legend className="px-1 font-display text-2xl">Flights and transfers</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Arrival flight" value={flights.arrivalFlight} onChange={(e) => setF('arrivalFlight', e.target.value)} placeholder="e.g. KQ 604" />
          <TextField label="Arrives (Kenya time)" type="datetime-local" value={flights.arrivalAt} onChange={(e) => setF('arrivalAt', e.target.value)} />
          <TextField label="Pick-up from" value={flights.pickup} onChange={(e) => setF('pickup', e.target.value)} placeholder="Airport or hotel" />
          <TextField label="Departure flight" value={flights.departureFlight} onChange={(e) => setF('departureFlight', e.target.value)} />
          <TextField label="Departs (Kenya time)" type="datetime-local" value={flights.departureAt} onChange={(e) => setF('departureAt', e.target.value)} />
          <TextField label="Drop-off at" value={flights.dropoff} onChange={(e) => setF('dropoff', e.target.value)} />
        </div>
        <TextAreaField label="Anything else we should know?" value={flights.guestNotes} onChange={(e) => setF('guestNotes', e.target.value)} placeholder="A birthday or honeymoon, room set-up, a quiet room…" className="[&_textarea]:min-h-20" />
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={state === 'saving'} data-cta="trip-details-save">
          {state === 'saving' ? 'Saving…' : 'Save traveller details'}
        </button>
        {message && <p role={state === 'error' ? 'alert' : 'status'} className={`text-sm font-semibold ${state === 'error' ? 'text-[#9e2a1a]' : 'text-deep'}`}>{message}</p>}
      </div>
    </form>
  )
}
