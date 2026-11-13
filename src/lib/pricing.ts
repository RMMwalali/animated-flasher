/** Quote pricing. Pure functions so they can be unit-tested. */
export type Currency = 'USD' | 'KES'
export type PriceUnit = 'per_person' | 'per_child' | 'per_group' | 'fixed'

export type QuoteItem = { description: string; unit?: PriceUnit | null; quantity?: number | null; unitPrice: number }

export type QuoteTotals = { subtotal: number; discount: number; total: number; deposit: number; balance: number; lines: number[] }

/** USD to cents precision; KES is quoted in whole shillings. */
export const roundMoney = (v: number, currency: Currency) =>
  currency === 'KES' ? Math.round(v) : Math.round((v + Number.EPSILON) * 100) / 100

export function lineTotal(item: QuoteItem, currency: Currency): number {
  const qty = Math.max(0, item.quantity ?? 1)
  const price = Math.max(0, item.unitPrice || 0)
  return roundMoney(qty * price, currency)
}

export function calcQuote(
  items: QuoteItem[],
  opts: { discount?: number | null; depositPercent?: number | null; currency: Currency },
): QuoteTotals {
  const lines = items.map((i) => lineTotal(i, opts.currency))
  const subtotal = roundMoney(lines.reduce((a, b) => a + b, 0), opts.currency)
  const discount = Math.min(subtotal, Math.max(0, opts.discount ?? 0))
  const total = roundMoney(subtotal - discount, opts.currency)
  const pct = Math.min(100, Math.max(0, opts.depositPercent ?? 30))
  const deposit = roundMoney((total * pct) / 100, opts.currency)
  return { subtotal, discount, total, deposit, balance: roundMoney(total - deposit, opts.currency), lines }
}

/** Starting price lines for a quote built from a journey. */
export function itemsFromTrip(
  trip: { title: string; priceFrom?: number | null; childPercent?: number | null; days?: number | null },
  adults: number,
  children: number,
): QuoteItem[] {
  const price = trip.priceFrom ?? 0
  const items: QuoteItem[] = [
    { description: `${trip.title}${trip.days ? ` (${trip.days} days)` : ''}: adult`, unit: 'per_person', quantity: Math.max(1, adults), unitPrice: price },
  ]
  if (children > 0) {
    const pct = trip.childPercent ?? 50
    items.push({ description: `${trip.title}: child`, unit: 'per_child', quantity: children, unitPrice: roundMoney((price * pct) / 100, 'USD') })
  }
  return items
}

export const formatMoney = (v: number | null | undefined, currency: Currency = 'USD') =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency, maximumFractionDigits: currency === 'KES' ? 0 : 2 }).format(v ?? 0)
