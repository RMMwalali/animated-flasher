import type { CollectionConfig } from 'payload'
import { admins, crmAccess, isAdmin, salesTeam } from '@/access'
import { onQuoteChange } from '@/hooks/quotes'
import { onBookingChange } from '@/hooks/bookings'
import { onPaymentChange } from '@/hooks/payments'

const OPS = '02 Operations'
const MONEY = '03 Money'

const currency = {
  name: 'currency', type: 'select' as const, required: true, defaultValue: 'USD',
  options: [{ label: 'US$', value: 'USD' }, { label: 'KES', value: 'KES' }],
}

export const Quotes: CollectionConfig = {
  slug: 'quotes',
  labels: { singular: 'Quote', plural: 'Quotes' },
  admin: {
    useAsTitle: 'number',
    group: OPS,
    defaultColumns: ['number', 'title', 'contact', 'total', 'status', 'validUntil'],
    description: 'Build a quote from a journey, adjust prices, then send it. The guest accepts online.',
    components: { edit: { beforeDocumentControls: ['/components/admin/QuoteActions#QuoteActions'] } },
  },
  access: crmAccess,
  fields: [
    { name: 'number', type: 'text', unique: true, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'status', type: 'select', defaultValue: 'draft', required: true, admin: { position: 'sidebar' }, options: [
      { label: 'Draft', value: 'draft' }, { label: 'Sent', value: 'sent' }, { label: 'Viewed', value: 'viewed' },
      { label: 'Accepted', value: 'accepted' }, { label: 'Declined', value: 'declined' }, { label: 'Expired', value: 'expired' },
    ] },
    { name: 'validUntil', type: 'date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } } },
    { name: 'title', type: 'text', required: true },
    { type: 'row', fields: [
      { name: 'lead', type: 'relationship', relationTo: 'leads' },
      { name: 'contact', type: 'relationship', relationTo: 'contacts', required: true },
    ] },
    { name: 'trip', type: 'relationship', relationTo: 'trips', admin: { description: 'Pick a journey and save: its day-by-day plan and price fill in automatically.' } },
    { type: 'row', fields: [
      { name: 'startDate', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
      { name: 'adults', type: 'number', min: 1, defaultValue: 2 },
      { name: 'children', type: 'number', min: 0, defaultValue: 0 },
    ] },
    {
      name: 'items', type: 'array', label: 'Price lines', admin: { initCollapsed: false },
      fields: [
        { name: 'description', type: 'text', required: true },
        { type: 'row', fields: [
          { name: 'unit', type: 'select', defaultValue: 'per_person', options: [
            { label: 'Per adult', value: 'per_person' }, { label: 'Per child', value: 'per_child' }, { label: 'Per group', value: 'per_group' }, { label: 'Fixed', value: 'fixed' },
          ] },
          { name: 'quantity', type: 'number', min: 0, defaultValue: 1 },
          { name: 'unitPrice', type: 'number', min: 0, required: true },
        ] },
      ],
    },
    { type: 'row', fields: [
      currency,
      { name: 'discount', type: 'number', min: 0, defaultValue: 0, admin: { description: 'Amount off.' } },
      { name: 'depositPercent', type: 'number', min: 0, max: 100, defaultValue: 30 },
    ] },
    { type: 'row', fields: [
      { name: 'subtotal', type: 'number', admin: { readOnly: true } },
      { name: 'total', type: 'number', admin: { readOnly: true } },
      { name: 'deposit', type: 'number', admin: { readOnly: true } },
    ] },
    {
      name: 'days', type: 'array', label: 'Day by day', admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'overnight', type: 'text' },
      ],
    },
    { name: 'inclusions', type: 'textarea' },
    { name: 'exclusions', type: 'textarea' },
    { name: 'notes', type: 'textarea', label: 'Note to guest' },
    { name: 'acceptToken', type: 'text', index: true, admin: { hidden: true } },
    { name: 'sentAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'viewedAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'acceptedAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'booking', type: 'relationship', relationTo: 'bookings', admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: { beforeChange: [onQuoteChange.before], afterChange: [onQuoteChange.after] },
}

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: { singular: 'Booking', plural: 'Bookings' },
  admin: {
    useAsTitle: 'reference',
    group: OPS,
    defaultColumns: ['reference', 'contact', 'startDate', 'status', 'total', 'amountPaid'],
    components: { edit: { beforeDocumentControls: ['/components/admin/BookingActions#BookingActions'] } },
  },
  access: crmAccess,
  fields: [
    { name: 'reference', type: 'text', unique: true, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'status', type: 'select', required: true, defaultValue: 'pending_deposit', admin: { position: 'sidebar' }, options: [
      { label: 'Awaiting deposit', value: 'pending_deposit' }, { label: 'Deposit paid', value: 'deposit_paid' },
      { label: 'Paid in full', value: 'paid' }, { label: 'Travelling', value: 'travelling' },
      { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' },
    ] },
    { name: 'title', type: 'text', required: true },
    { type: 'row', fields: [
      { name: 'contact', type: 'relationship', relationTo: 'contacts', required: true },
      { name: 'lead', type: 'relationship', relationTo: 'leads' },
      { name: 'quote', type: 'relationship', relationTo: 'quotes' },
    ] },
    { type: 'row', fields: [
      { name: 'trip', type: 'relationship', relationTo: 'trips' },
      { name: 'departure', type: 'relationship', relationTo: 'departures' },
    ] },
    { type: 'row', fields: [
      { name: 'startDate', type: 'date', required: true, index: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
      { name: 'endDate', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
      { name: 'pax', type: 'number', min: 1, defaultValue: 2, label: 'Travellers' },
    ] },
    { type: 'row', fields: [
      currency,
      { name: 'total', type: 'number', min: 0, required: true },
      { name: 'depositDue', type: 'number', min: 0 },
    ] },
    { type: 'row', fields: [
      { name: 'amountPaid', type: 'number', defaultValue: 0, admin: { readOnly: true, description: 'Updated automatically from successful payments.' } },
      { name: 'balanceDue', type: 'number', admin: { readOnly: true } },
      { name: 'balanceDueDate', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
    ] },
    { name: 'travellers', type: 'relationship', relationTo: 'travellers', hasMany: true },
    {
      name: 'services', type: 'array', label: 'Suppliers & services', admin: { initCollapsed: true },
      fields: [
        { type: 'row', fields: [
          { name: 'supplier', type: 'relationship', relationTo: 'suppliers', required: true },
          { name: 'date', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
          { name: 'status', type: 'select', defaultValue: 'requested', options: ['requested', 'confirmed', 'paid', 'cancelled'] },
        ] },
        { type: 'row', fields: [
          { name: 'service', type: 'text' },
          { name: 'cost', type: 'number', min: 0 },
          { name: 'confirmationRef', type: 'text' },
        ] },
      ],
    },
    { name: 'notes', type: 'textarea' },
    { name: 'reviewRequested', type: 'checkbox', defaultValue: false, admin: { readOnly: true, position: 'sidebar' } },
  ],
  hooks: { beforeChange: [onBookingChange.before], afterChange: [onBookingChange.after] },
}

export const Travellers: CollectionConfig = {
  slug: 'travellers',
  labels: { singular: 'Traveller', plural: 'Travellers' },
  admin: { useAsTitle: 'name', group: OPS, defaultColumns: ['name', 'nationality', 'contact'], description: 'People on a booking. Collect only what the trip needs.' },
  access: crmAccess,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'contact', type: 'relationship', relationTo: 'contacts' },
    { type: 'row', fields: [
      { name: 'nationality', type: 'text', admin: { description: 'Affects park fees (resident / non-resident).' } },
      { name: 'isChild', type: 'checkbox', defaultValue: false },
      { name: 'ageOnTravel', type: 'number', min: 0 },
    ] },
    { name: 'dietary', type: 'text' },
    { name: 'medicalNotes', type: 'textarea', access: { read: ({ req }) => isAdmin(req.user as never) || Boolean((req.user as { roles?: string[] })?.roles?.includes('sales')) } },
    { type: 'row', fields: [{ name: 'emergencyName', type: 'text' }, { name: 'emergencyPhone', type: 'text' }] },
  ],
}

export const Suppliers: CollectionConfig = {
  slug: 'suppliers',
  labels: { singular: 'Supplier', plural: 'Suppliers' },
  admin: { useAsTitle: 'name', group: OPS, defaultColumns: ['name', 'type', 'location', 'phone'], description: 'Lodges, camps, drivers, guides, boats and vehicles.' },
  access: crmAccess,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'type', type: 'select', required: true, options: [
      { label: 'Lodge / camp', value: 'lodge' }, { label: 'Hotel', value: 'hotel' }, { label: 'Driver', value: 'driver' },
      { label: 'Guide', value: 'guide' }, { label: 'Vehicle', value: 'vehicle' }, { label: 'Boat / dhow', value: 'boat' }, { label: 'Other', value: 'other' },
    ] },
    { type: 'row', fields: [{ name: 'contactName', type: 'text' }, { name: 'phone', type: 'text' }, { name: 'email', type: 'email' }] },
    { name: 'location', type: 'relationship', relationTo: 'destinations' },
    { name: 'rates', type: 'textarea', admin: { description: 'Rate notes, contract season, payment terms.' } },
    { name: 'licence', type: 'text', admin: { description: 'e.g. PSV licence, guide certification.' } },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
}

export const Departures: CollectionConfig = {
  slug: 'departures',
  labels: { singular: 'Departure', plural: 'Departures' },
  admin: { useAsTitle: 'label', group: OPS, defaultColumns: ['label', 'startDate', 'status', 'capacity', 'guide'], description: 'Scheduled trips with vehicles and guides. See the calendar for the month view.' },
  access: crmAccess,
  fields: [
    { name: 'label', type: 'text', admin: { readOnly: true } },
    { name: 'trip', type: 'relationship', relationTo: 'trips', required: true },
    { type: 'row', fields: [
      { name: 'startDate', type: 'date', required: true, index: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
      { name: 'endDate', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
      { name: 'capacity', type: 'number', defaultValue: 6, min: 1 },
    ] },
    { type: 'row', fields: [
      { name: 'guide', type: 'relationship', relationTo: 'suppliers', filterOptions: { type: { in: ['guide', 'driver'] } } },
      { name: 'vehicle', type: 'relationship', relationTo: 'suppliers', filterOptions: { type: { equals: 'vehicle' } } },
      { name: 'status', type: 'select', defaultValue: 'scheduled', options: ['scheduled', 'confirmed', 'running', 'done', 'cancelled'] },
    ] },
    { name: 'notes', type: 'textarea' },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (data.trip && data.startDate) {
          const tripId = typeof data.trip === 'object' ? data.trip.id : data.trip
          const trip = await req.payload.findByID({ collection: 'trips', id: tripId, depth: 0, req, overrideAccess: true }).catch(() => null)
          data.label = `${String(data.startDate).slice(0, 10)} · ${trip?.title ?? 'Trip'}`
          if (!data.endDate && trip?.days) {
            const end = new Date(data.startDate)
            end.setUTCDate(end.getUTCDate() + trip.days - 1)
            data.endDate = end.toISOString()
          }
        }
        return data
      },
    ],
  },
}

export const Payments: CollectionConfig = {
  slug: 'payments',
  labels: { singular: 'Payment', plural: 'Payments' },
  admin: {
    useAsTitle: 'reference',
    group: MONEY,
    defaultColumns: ['reference', 'booking', 'kind', 'amount', 'currency', 'status', 'paidAt', 'reconciled'],
    description: 'Deposit and balance payments. Successful Paystack payments (M-Pesa or card) appear here automatically.',
    components: { edit: { beforeDocumentControls: ['/components/admin/PaymentActions#PaymentActions'] } },
  },
  access: { read: salesTeam, create: salesTeam, update: salesTeam, delete: admins },
  fields: [
    { name: 'reference', type: 'text', unique: true, admin: { readOnly: true } },
    { type: 'row', fields: [
      { name: 'booking', type: 'relationship', relationTo: 'bookings', required: true, index: true },
      { name: 'contact', type: 'relationship', relationTo: 'contacts' },
    ] },
    { type: 'row', fields: [
      { name: 'kind', type: 'select', required: true, defaultValue: 'deposit', options: [{ label: 'Deposit', value: 'deposit' }, { label: 'Balance', value: 'balance' }, { label: 'Other', value: 'other' }] },
      { name: 'amount', type: 'number', required: true, min: 0 },
      currency,
    ] },
    { type: 'row', fields: [
      { name: 'status', type: 'select', required: true, defaultValue: 'pending', index: true, options: [
        { label: 'Waiting for guest', value: 'pending' }, { label: 'Paid', value: 'success' }, { label: 'Failed', value: 'failed' },
        { label: 'Abandoned', value: 'abandoned' }, { label: 'Refunded', value: 'refunded' },
      ] },
      { name: 'provider', type: 'select', required: true, defaultValue: 'paystack', options: [
        { label: 'Paystack (M-Pesa / card)', value: 'paystack' }, { label: 'Bank transfer / cash (manual)', value: 'manual' }, { label: 'M-Pesa Daraja', value: 'mpesa' },
      ] },
      { name: 'method', type: 'select', options: [{ label: 'Card', value: 'card' }, { label: 'M-Pesa', value: 'mobile_money' }, { label: 'Bank', value: 'bank' }, { label: 'Cash', value: 'cash' }] },
    ] },
    { type: 'row', fields: [
      { name: 'exchangeRate', type: 'number', min: 0, admin: { description: 'Only when paying in a different currency from the booking: KES per 1 US$.' } },
      { name: 'credited', type: 'number', admin: { readOnly: true, description: 'Amount credited to the booking, in the booking currency.' } },
    ] },
    { name: 'payUrl', type: 'text', label: 'Payment link', admin: { readOnly: true } },
    { name: 'providerRef', type: 'text', admin: { readOnly: true } },
    { name: 'paidAt', type: 'date', admin: { readOnly: true } },
    { name: 'receiptNumber', type: 'text', admin: { readOnly: true } },
    { name: 'fees', type: 'number', admin: { readOnly: true, description: 'Provider fees, in the payment currency.' } },
    { name: 'reconciled', type: 'checkbox', defaultValue: false, admin: { description: 'Tick when matched against your bank / Paystack settlement.' } },
    { name: 'notes', type: 'textarea' },
    { name: 'raw', type: 'json', admin: { readOnly: true }, access: { read: ({ req }) => isAdmin(req.user as never) } },
  ],
  hooks: { beforeChange: [onPaymentChange.before], afterChange: [onPaymentChange.after] },
}

export const ReviewRequests: CollectionConfig = {
  slug: 'review-requests',
  labels: { singular: 'Review request', plural: 'Review requests' },
  admin: {
    useAsTitle: 'label',
    group: '01 Sales',
    defaultColumns: ['label', 'status', 'sentAt', 'reminderSentAt', 'clickedPlatform'],
    description: 'After each trip every guest is asked the same way, with one reminder. We never offer rewards or choose who is asked.',
  },
  access: { read: salesTeam, create: salesTeam, update: salesTeam, delete: admins },
  fields: [
    { name: 'label', type: 'text', admin: { readOnly: true } },
    { type: 'row', fields: [
      { name: 'booking', type: 'relationship', relationTo: 'bookings', required: true },
      { name: 'contact', type: 'relationship', relationTo: 'contacts', required: true },
    ] },
    { name: 'status', type: 'select', required: true, defaultValue: 'scheduled', index: true, options: [
      { label: 'Scheduled', value: 'scheduled' }, { label: 'Sent', value: 'sent' }, { label: 'Reminder sent', value: 'reminded' },
      { label: 'Link clicked', value: 'clicked' }, { label: 'Guest opted out', value: 'opted_out' }, { label: 'Could not send', value: 'failed' },
    ] },
    { name: 'sendAfter', type: 'date', index: true },
    { name: 'sentAt', type: 'date', admin: { readOnly: true } },
    { name: 'reminderSentAt', type: 'date', admin: { readOnly: true } },
    { name: 'clickedAt', type: 'date', admin: { readOnly: true } },
    { name: 'clickedPlatform', type: 'text', admin: { readOnly: true } },
    { name: 'token', type: 'text', index: true, admin: { hidden: true } },
  ],
}

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: { singular: 'Audit entry', plural: 'Audit log' },
  admin: { useAsTitle: 'summary', group: '05 Team', defaultColumns: ['createdAt', 'user', 'action', 'collectionSlug', 'summary'], description: 'Who changed what, and when. Read-only.' },
  access: { read: admins, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'action', type: 'select', required: true, options: ['create', 'update', 'delete', 'login', 'send', 'payment'] },
    { name: 'collectionSlug', type: 'text', index: true },
    { name: 'docId', type: 'text' },
    { name: 'summary', type: 'text' },
    { name: 'changedFields', type: 'text', hasMany: true },
    { name: 'ip', type: 'text' },
  ],
}

export const RateLimits: CollectionConfig = {
  slug: 'rate-limits',
  admin: { hidden: true },
  access: { read: () => false, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'count', type: 'number', required: true, defaultValue: 0 },
    { name: 'resetAt', type: 'date', required: true, index: true },
  ],
}
