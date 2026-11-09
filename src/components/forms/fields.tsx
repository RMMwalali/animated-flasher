'use client'
import { Description, Field, Input, Label, Textarea } from '@headlessui/react'
import type { ComponentProps, ReactNode } from 'react'

const base =
  'mt-2 block w-full rounded-xl border border-deep/25 bg-cream px-4 py-3 text-base text-deep placeholder:text-deep/55 outline-none transition data-focus:border-deep data-focus:ring-2 data-focus:ring-orange-600/40 data-invalid:border-[#9e2a1a]'

export function TextField({ label, hint, error, className = '', ...p }: Omit<ComponentProps<'input'>, 'ref'> & { label: string; hint?: ReactNode; error?: string }) {
  return (
    <Field className={className}>
      <Label className="text-sm font-semibold">{label}{p.required && <span aria-hidden="true"> *</span>}</Label>
      {hint && <Description className="text-sm text-deep/75">{hint}</Description>}
      <Input {...p} invalid={Boolean(error)} className={base} />
      {error && <p className="mt-1 text-sm text-[#9e2a1a]" role="alert">{error}</p>}
    </Field>
  )
}

export function TextAreaField({ label, error, className = '', ...p }: Omit<ComponentProps<'textarea'>, 'ref'> & { label: string; error?: string }) {
  return (
    <Field className={className}>
      <Label className="text-sm font-semibold">{label}</Label>
      <Textarea {...p} invalid={Boolean(error)} className={`${base} min-h-32`} />
      {error && <p className="mt-1 text-sm text-[#9e2a1a]" role="alert">{error}</p>}
    </Field>
  )
}

/** Visually hidden honeypot. Bots fill it; people never see it. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this empty
        <input tabIndex={-1} autoComplete="off" name="website" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  )
}
