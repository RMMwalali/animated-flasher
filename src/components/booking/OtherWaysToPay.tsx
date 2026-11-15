import type { SettingsVM } from '@/lib/content'

/** Bank and M-Pesa details from Business settings → Payments. Nothing renders if none are set. */
export function OtherWaysToPay({ settings, reference }: { settings: Pick<SettingsVM, 'bankAccounts' | 'mpesa' | 'paymentNote'>; reference: string }) {
  const banks = settings.bankAccounts ?? []
  const m = settings.mpesa
  if (!banks.length && !m?.paybill && !m?.till) return null
  return (
    <details className="group rounded-3xl border border-line bg-paper p-6" data-other-pay>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-2xl">
        Other ways to pay
        <span aria-hidden="true" className="text-base transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-sm">Please use your booking reference <strong>{reference}</strong> so we can match your payment.</p>
      {m?.paybill && <p className="mt-4 text-sm"><span className="font-semibold">M-Pesa Paybill:</span> {m.paybill} · Account: {reference}</p>}
      {m?.till && <p className="mt-2 text-sm"><span className="font-semibold">M-Pesa Till (Buy Goods):</span> {m.till}</p>}
      {banks.map((b) => (
        <dl key={`${b.label}-${b.accountNumber}`} className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-line pt-4 text-sm">
          <dt className="col-span-2 font-semibold">{b.label} ({b.currency})</dt>
          <dt className="text-deep/75">Bank</dt><dd>{b.bankName}{b.branch ? `, ${b.branch}` : ''}</dd>
          <dt className="text-deep/75">Account name</dt><dd>{b.accountName}</dd>
          <dt className="text-deep/75">Account no.</dt><dd className="tabular-nums">{b.accountNumber}</dd>
          {b.swift && <><dt className="text-deep/75">SWIFT</dt><dd>{b.swift}</dd></>}
          {b.bankCode && <><dt className="text-deep/75">Bank code</dt><dd>{b.bankCode}</dd></>}
          <dt className="text-deep/75">Reference</dt><dd className="font-semibold">{reference}</dd>
        </dl>
      ))}
      {settings.paymentNote && <p className="mt-4 whitespace-pre-line text-sm">{settings.paymentNote}</p>}
    </details>
  )
}

/** The same details as plain lines, for emails. */
export function otherWaysToPayLines(settings: { bankAccounts?: any[] | null; mpesa?: { paybill?: string | null; till?: string | null } | null; paymentNote?: string | null }, reference: string): string[] {
  const out: string[] = []
  if (settings.mpesa?.paybill) out.push(`M-Pesa Paybill ${settings.mpesa.paybill}, account ${reference}.`)
  if (settings.mpesa?.till) out.push(`M-Pesa Till (Buy Goods) ${settings.mpesa.till}.`)
  for (const b of settings.bankAccounts ?? []) {
    out.push(`${b.label} (${b.currency}): ${b.bankName}${b.branch ? `, ${b.branch}` : ''} · ${b.accountName} · Acc. ${b.accountNumber}${b.swift ? ` · SWIFT ${b.swift}` : ''}${b.bankCode ? ` · Code ${b.bankCode}` : ''} · Reference ${reference}`)
  }
  if (out.length && settings.paymentNote) out.push(settings.paymentNote)
  return out.length ? ['Other ways to pay:', ...out] : []
}
