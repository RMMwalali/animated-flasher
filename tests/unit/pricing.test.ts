import { describe, expect, it } from 'vitest'
import { calcQuote, itemsFromTrip, lineTotal, roundMoney } from '@/lib/pricing'

describe('pricing', () => {
  it('rounds USD to cents and KES to shillings', () => {
    expect(roundMoney(10.005, 'USD')).toBe(10.01)
    expect(roundMoney(1234.6, 'KES')).toBe(1235)
  })

  it('computes line totals, ignoring negative inputs', () => {
    expect(lineTotal({ description: 'x', quantity: 2, unitPrice: 780 }, 'USD')).toBe(1560)
    expect(lineTotal({ description: 'x', quantity: -1, unitPrice: 780 }, 'USD')).toBe(0)
    expect(lineTotal({ description: 'x', quantity: null, unitPrice: 99.99 }, 'USD')).toBe(99.99)
  })

  it('applies discount and deposit', () => {
    const t = calcQuote(
      [{ description: 'Adults', quantity: 2, unitPrice: 1650 }, { description: 'Child', quantity: 1, unitPrice: 825 }],
      { discount: 75, depositPercent: 30, currency: 'USD' },
    )
    expect(t.subtotal).toBe(4125)
    expect(t.total).toBe(4050)
    expect(t.deposit).toBe(1215)
    expect(t.balance).toBe(2835)
  })

  it('never discounts below zero and clamps deposit %', () => {
    const t = calcQuote([{ description: 'x', quantity: 1, unitPrice: 100 }], { discount: 500, depositPercent: 150, currency: 'USD' })
    expect(t.total).toBe(0)
    expect(t.deposit).toBe(0)
    const u = calcQuote([{ description: 'x', quantity: 1, unitPrice: 100 }], { depositPercent: -10, currency: 'USD' })
    expect(u.deposit).toBe(0)
  })

  it('defaults deposit to 30% and KES to whole shillings', () => {
    const t = calcQuote([{ description: 'x', quantity: 3, unitPrice: 33333.33 }], { currency: 'KES' })
    expect(t.total).toBe(100000)
    expect(t.deposit).toBe(30000)
  })

  it('builds adult + child lines from a journey', () => {
    const items = itemsFromTrip({ title: 'Tsavo', priceFrom: 780, childPercent: 50, days: 3 }, 2, 1)
    expect(items).toHaveLength(2)
    expect(items[1]).toMatchObject({ quantity: 1, unitPrice: 390, unit: 'per_child' })
    expect(itemsFromTrip({ title: 'X', priceFrom: 100 }, 0, 0)[0]!.quantity).toBe(1)
  })
})
