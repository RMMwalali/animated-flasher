/** Lead pipeline. Order matters: automation only ever moves a lead forward. */
export const LEAD_STAGES = [
  { value: 'new', label: 'New', short: 'New' },
  { value: 'contacted', label: 'Contacted', short: 'Contacted' },
  { value: 'quoted', label: 'Quoted', short: 'Quoted' },
  { value: 'deposit_paid', label: 'Deposit paid', short: 'Deposit' },
  { value: 'confirmed', label: 'Confirmed', short: 'Confirmed' },
  { value: 'travelled', label: 'Travelled', short: 'Travelled' },
  { value: 'review_requested', label: 'Review requested', short: 'Review' },
  { value: 'lost', label: 'Lost', short: 'Lost' },
] as const

export type LeadStatus = (typeof LEAD_STAGES)[number]['value']
export const PIPELINE: LeadStatus[] = LEAD_STAGES.filter((s) => s.value !== 'lost').map((s) => s.value)

export const stageIndex = (s: LeadStatus | string | null | undefined) => PIPELINE.indexOf(s as LeadStatus)

/**
 * Status an automatic event should move a lead to. Never moves backwards and
 * never revives a lost lead (a person decided that), except a payment, which
 * is hard evidence the guest is going ahead.
 */
export function advanceLeadStatus(current: LeadStatus, target: LeadStatus, opts: { evidence?: 'payment' } = {}): LeadStatus {
  if (current === 'lost') return opts.evidence === 'payment' ? target : current
  if (target === 'lost') return current
  return stageIndex(target) > stageIndex(current) ? target : current
}

export const stageLabel = (s: string | null | undefined) => LEAD_STAGES.find((x) => x.value === s)?.label ?? String(s ?? '')
