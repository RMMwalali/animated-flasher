import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'
import { paymentReference } from '@/lib/ids'
import { syncBookingPayments } from '@/lib/payments/service'

const before: CollectionBeforeChangeHook = ({ data, operation, originalDoc }) => {
  if (operation === 'create') data.reference ??= paymentReference()
  if (data.status === 'success' && originalDoc?.status !== 'success' && !data.paidAt) data.paidAt = new Date().toISOString()
  return data
}

const after: CollectionAfterChangeHook = async ({ doc, previousDoc, req, context }) => {
  if (context?.skipPaymentHooks) return doc
  if (previousDoc?.status !== doc.status || previousDoc?.amount !== doc.amount) {
    await syncBookingPayments(req, doc, previousDoc)
  }
  return doc
}

export const onPaymentChange = { before, after }
