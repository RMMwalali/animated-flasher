import { describe, expect, it } from 'vitest'
import { daysUntil, dueActions, endOfDayEAT, nextPayment, quoteState } from '@/lib/booking/rules'

const at = (iso: string) => new Date(iso)

describe('quoteState', () => {
  const now = at('2026-11-14T09:00:00Z')
  it('is open while sent or viewed, priced and in date', () => {
    expect(quoteState({ status: 'sent', validUntil: '2026-11-20T00:00:00Z', total: 100 }, now)).toBe('open')
    expect(quoteState({ status: 'viewed', validUntil: null, total: 100 }, now)).toBe('open')
  })
  it('stays valid until the end of the last day in Kenya', () => {
    const q = { status: 'sent', validUntil: '2026-11-14T00:00:00Z', total: 100 }
    expect(quoteState(q, at('2026-11-14T20:59:00Z'))).toBe('open') // 23:59 EAT
    expect(quoteState(q, at('2026-11-14T21:01:00Z'))).toBe('expired')
  })
  it('handles drafts, zero totals and final states', () => {
    expect(quoteState({ status: 'draft', total: 100 }, now)).toBe('draft')
    expect(quoteState({ status: 'sent', total: 0 }, now)).toBe('draft')
    expect(quoteState({ status: 'accepted', validUntil: '2020-01-01', total: 100 }, now)).toBe('accepted')
    expect(quoteState({ status: 'declined', total: 100 }, now)).toBe('declined')
    expect(quoteState({ status: 'expired', total: 100 }, now)).toBe('expired')
  })
  it('end of day is 20:59:59.999 UTC', () => {
    expect(new Date(endOfDayEAT('2026-11-14T00:00:00Z')).toISOString()).toBe('2026-11-14T20:59:59.999Z')
  })
})

describe('daysUntil', () => {
  it('counts calendar days in Kenya time', () => {
    expect(daysUntil('2026-11-15T00:00:00Z', at('2026-11-14T22:30:00Z'))).toBe(0) // both 15 Nov in EAT
    expect(daysUntil('2026-12-05T00:00:00Z', at('2026-11-14T09:00:00Z'))).toBe(21)
    expect(daysUntil('2026-11-13T00:00:00Z', at('2026-11-14T09:00:00Z'))).toBe(-1)
  })
})

describe('dueActions', () => {
  const now = at('2026-11-14T09:00:00Z')
  const base = { status: 'deposit_paid', startDate: '2026-12-20T00:00:00Z', endDate: '2026-12-24T00:00:00Z', balanceDue: 900, balanceDueDate: '2026-11-20T00:00:00Z' }
  it('balance reminder from 7 days before the due date, once', () => {
    expect(dueActions(base, now).balanceReminder).toBe(true)
    expect(dueActions({ ...base, balanceDueDate: '2026-11-30T00:00:00Z' }, now).balanceReminder).toBe(false)
    expect(dueActions({ ...base, emails: { balanceReminderSentAt: '2026-11-13' } }, now).balanceReminder).toBe(false)
    expect(dueActions({ ...base, status: 'paid', balanceDue: 0 }, now).balanceReminder).toBe(false)
    expect(dueActions({ ...base, status: 'pending_deposit' }, now).balanceReminder).toBe(false)
  })
  it('eTA reminder within 21 days of travel, confirmed bookings only, once', () => {
    expect(dueActions(base, now).etaReminder).toBe(false) // 36 days away
    const soon = { ...base, startDate: '2026-12-05T00:00:00Z' }
    expect(dueActions(soon, now).etaReminder).toBe(true)
    expect(dueActions({ ...soon, status: 'paid' }, now).etaReminder).toBe(true)
    expect(dueActions({ ...soon, status: 'pending_deposit' }, now).etaReminder).toBe(false)
    expect(dueActions({ ...soon, emails: { etaReminderSentAt: '2026-11-13' } }, now).etaReminder).toBe(false)
  })
  it('moves to travelling on the start day and completed the day after the end', () => {
    expect(dueActions({ ...base, startDate: '2026-11-14T00:00:00Z' }, now).nextStatus).toBe('travelling')
    expect(dueActions({ ...base, status: 'pending_deposit', startDate: '2026-11-14T00:00:00Z' }, now).nextStatus).toBeUndefined()
    expect(dueActions({ ...base, status: 'travelling', startDate: '2026-11-10', endDate: '2026-11-14T00:00:00Z' }, now).nextStatus).toBeUndefined()
    expect(dueActions({ ...base, status: 'travelling', startDate: '2026-11-10', endDate: '2026-11-13T00:00:00Z' }, now).nextStatus).toBe('completed')
  })
  it('never acts on cancelled or completed bookings', () => {
    expect(dueActions({ ...base, status: 'cancelled', startDate: '2026-11-14' }, now)).toEqual({ balanceReminder: false, etaReminder: false })
  })
})

describe('nextPayment', () => {
  it('deposit first, then balance, then nothing', () => {
    expect(nextPayment({ status: 'pending_deposit', depositDue: 300, amountPaid: 0, total: 1000 })).toBe('deposit')
    expect(nextPayment({ status: 'deposit_paid', depositDue: 300, amountPaid: 300, total: 1000 })).toBe('balance')
    expect(nextPayment({ status: 'paid', depositDue: 300, amountPaid: 1000, total: 1000 })).toBeNull()
    expect(nextPayment({ status: 'cancelled', depositDue: 300, amountPaid: 0, total: 1000 })).toBeNull()
    expect(nextPayment({ status: 'pending_deposit', depositDue: 0, amountPaid: 0, total: 1000 })).toBe('balance')
  })
})
