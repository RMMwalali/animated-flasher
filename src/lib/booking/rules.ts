/**
 * Booking rules as pure functions (unit-tested): when a quote can be
 * accepted, and which automatic emails or status changes are due.
 */

const DAY = 864e5

export type QuoteState = 'draft' | 'open' | 'expired' | 'accepted' | 'declined'

/** What the guest can do with a quote right now. */
export function quoteState(q: { status?: string | null; validUntil?: string | null; total?: number | null }, now = new Date()): QuoteState {
  if (q.status === 'accepted') return 'accepted'
  if (q.status === 'declined') return 'declined'
  if (q.status === 'draft' || !q.status) return 'draft'
  if (q.status === 'expired') return 'expired'
  // valid until the end of that day in Kenya (UTC+3)
  if (q.validUntil && endOfDayEAT(q.validUntil) < now.getTime()) return 'expired'
  if (!q.total || q.total <= 0) return 'draft'
  return 'open'
}

/** End of the given calendar day in East Africa Time, as a timestamp. */
export function endOfDayEAT(date: string): number {
  const d = new Date(date)
  // the date picker stores midnight-ish UTC; take its EAT calendar day
  const eat = new Date(d.getTime() + 3 * 3600e3)
  return Date.UTC(eat.getUTCFullYear(), eat.getUTCMonth(), eat.getUTCDate(), 23, 59, 59, 999) - 3 * 3600e3
}

/** Whole days from now until the date (negative once it has passed), in EAT. */
export function daysUntil(date: string, now = new Date()): number {
  const day = (t: number) => Math.floor((t + 3 * 3600e3) / DAY)
  return day(new Date(date).getTime()) - day(now.getTime())
}

export type BookingForRules = {
  status: string
  startDate: string
  endDate?: string | null
  balanceDue?: number | null
  balanceDueDate?: string | null
  emails?: { balanceReminderSentAt?: string | null; etaReminderSentAt?: string | null; detailsReminderSentAt?: string | null } | null
  /** Traveller details still missing (see travellerGaps); omit when unknown. */
  detailsMissing?: number
}

export const BALANCE_REMINDER_DAYS = 7
export const ETA_REMINDER_DAYS = 21
export const DETAILS_REMINDER_DAYS = 30

export type DueActions = { balanceReminder: boolean; etaReminder: boolean; detailsReminder: boolean; nextStatus?: 'travelling' | 'completed' }

/**
 * What the daily job should do for one booking:
 * - balance reminder once, from 7 days before the balance due date, while money is owed
 * - eTA reminder once, from 21 days before travel, for confirmed bookings
 * - traveller details reminder once, from 30 days before travel, while details are missing
 * - "travelling" from the start date (deposit or full payment received)
 * - "completed" the day after the trip ends (this schedules the review request)
 */
export function dueActions(b: BookingForRules, now = new Date()): DueActions {
  const confirmed = b.status === 'deposit_paid' || b.status === 'paid'
  const out: DueActions = { balanceReminder: false, etaReminder: false, detailsReminder: false }
  if (b.status === 'cancelled' || b.status === 'completed') return out
  const toStart = daysUntil(b.startDate, now)
  if (b.status === 'deposit_paid' && (b.balanceDue ?? 0) > 0 && b.balanceDueDate && !b.emails?.balanceReminderSentAt) {
    out.balanceReminder = daysUntil(b.balanceDueDate, now) <= BALANCE_REMINDER_DAYS && toStart >= 0
  }
  if (confirmed && !b.emails?.etaReminderSentAt && toStart >= 0 && toStart <= ETA_REMINDER_DAYS) out.etaReminder = true
  if (confirmed && (b.detailsMissing ?? 0) > 0 && !b.emails?.detailsReminderSentAt && toStart > 0 && toStart <= DETAILS_REMINDER_DAYS) out.detailsReminder = true
  if (confirmed && toStart <= 0) out.nextStatus = 'travelling'
  if (b.status === 'travelling' && daysUntil(b.endDate ?? b.startDate, now) < 0) out.nextStatus = 'completed'
  return out
}

/** Which payment the guest can make next from their trip page. */
export function nextPayment(b: { status: string; depositDue?: number | null; amountPaid?: number | null; total: number }): 'deposit' | 'balance' | null {
  if (b.status === 'cancelled' || b.status === 'completed') return null
  const paid = b.amountPaid ?? 0
  if (paid >= b.total) return null
  if (paid < (b.depositDue ?? 0)) return 'deposit'
  return 'balance'
}

export type TravellerLike = { name?: string | null; nationality?: string | null; dateOfBirth?: string | null; emergencyName?: string | null; emergencyPhone?: string | null }

/**
 * What is still missing before the trip: one entry per gap, in plain words.
 * Needed: a name, nationality and date of birth for every traveller (park
 * fees and the eTA depend on them), one emergency contact, and the arrival
 * flight or pick-up place.
 */
export function travellerGaps(
  b: { pax?: number | null; arrivalFlight?: string | null; pickup?: string | null },
  travellers: TravellerLike[],
): { added: number; expected: number; missing: string[] } {
  const expected = Math.max(1, b.pax ?? 1)
  const missing: string[] = []
  const named = travellers.filter((t) => t.name?.trim())
  if (named.length < expected) missing.push(`${expected - named.length} traveller${expected - named.length === 1 ? '' : 's'} not added yet`)
  named.forEach((t) => {
    const gaps = [!t.nationality?.trim() && 'nationality', !t.dateOfBirth && 'date of birth'].filter(Boolean)
    if (gaps.length) missing.push(`${t.name!.trim()}: ${gaps.join(' and ')}`)
  })
  if (named.length && !named.some((t) => t.emergencyName?.trim() && t.emergencyPhone?.trim())) missing.push('an emergency contact')
  if (!b.arrivalFlight?.trim() && !b.pickup?.trim()) missing.push('arrival flight or pick-up place')
  return { added: named.length, expected, missing }
}

/** Age in whole years on a date (e.g. the first day of the trip). */
export function ageOn(dateOfBirth: string, on: string): number {
  const b = new Date(dateOfBirth)
  const d = new Date(on)
  let age = d.getUTCFullYear() - b.getUTCFullYear()
  if (d.getUTCMonth() < b.getUTCMonth() || (d.getUTCMonth() === b.getUTCMonth() && d.getUTCDate() < b.getUTCDate())) age--
  return age
}
