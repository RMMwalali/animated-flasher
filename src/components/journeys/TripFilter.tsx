'use client'
import Link from 'next/link'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { useMemo, useState } from 'react'
import { Icon } from '@/components/icons/Icon'
import { JourneyCard } from '@/components/home/JourneyCard'
import type { TripVM } from '@/lib/content'

const MONTHS = [['', 'Any month'], ['jan', 'January'], ['feb', 'February'], ['mar', 'March'], ['apr', 'April'], ['may', 'May'], ['jun', 'June'], ['jul', 'July'], ['aug', 'August'], ['sep', 'September'], ['oct', 'October'], ['nov', 'November'], ['dec', 'December']] as const
const LENGTHS = [['', 'Any length'], ['1', 'Day trips'], ['2-4', '2 to 4 days'], ['5+', '5 days or more']] as const

function Select<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: readonly (readonly [T, string])[] }) {
  const current = options.find((o) => o[0] === value)?.[1]
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <ListboxButton className="flex min-h-11 w-full items-center justify-between gap-3 rounded-full border border-deep/30 bg-paper px-5 text-left text-sm data-focus:ring-2 data-focus:ring-orange-600/40 sm:w-56" aria-label={label}>
          <span><span className="eyebrow mr-2 text-teal-ink">{label}</span>{current}</span>
          <Icon name="chevron-down" size={16} />
        </ListboxButton>
        <ListboxOptions anchor="bottom start" className="z-40 mt-2 w-[var(--button-width)] rounded-2xl border border-line bg-paper p-1.5 shadow-xl focus:outline-none">
          {options.map(([v, l]) => (
            <ListboxOption key={v} value={v} className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-2.5 text-sm data-focus:bg-sky-50 data-selected:font-semibold">
              {l}
              <Icon name="check" size={16} className="invisible [[data-selected]_&]:visible" />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}

/** Client-side filters over the journeys on a list page. */
export function TripFilter({ trips, ctaPrefix }: { trips: TripVM[]; ctaPrefix: string }) {
  const [month, setMonth] = useState<string>('')
  const [length, setLength] = useState<string>('')
  const [sort, setSort] = useState<'order' | 'price' | 'days'>('order')
  const shown = useMemo(() => {
    const list = trips.filter((t) => {
      if (month && !t.bestMonths.includes(month)) return false
      if (length === '1' && t.days !== 1) return false
      if (length === '2-4' && (t.days < 2 || t.days > 4)) return false
      if (length === '5+' && t.days < 5) return false
      return true
    })
    if (sort === 'price') return [...list].sort((a, b) => (a.priceFrom ?? 1e9) - (b.priceFrom ?? 1e9))
    if (sort === 'days') return [...list].sort((a, b) => a.days - b.days)
    return list
  }, [trips, month, length, sort])

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Select label="When" value={month} onChange={setMonth} options={MONTHS as unknown as readonly (readonly [string, string])[]} />
        <Select label="Length" value={length} onChange={setLength} options={LENGTHS as unknown as readonly (readonly [string, string])[]} />
        <Select label="Sort" value={sort} onChange={(v) => setSort(v as typeof sort)} options={[['order', 'Recommended'], ['price', 'Price'], ['days', 'Length']] as const} />
        <p className="ml-auto font-semibold tabular-nums text-xs uppercase tracking-[0.06em]" aria-live="polite">{shown.length} {shown.length === 1 ? 'journey' : 'journeys'}</p>
      </div>
      {shown.length ? (
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((t) => <JourneyCard key={t.slug} trip={t} ctaPrefix={ctaPrefix} />)}
        </div>
      ) : (
        <p className="mt-12 text-lg">No journeys match. Try another month, or <Link className="underline" href="/plan-your-trip">tell us what you have in mind</Link> and we will plan one.</p>
      )}
    </div>
  )
}
