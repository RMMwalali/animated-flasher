import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'
import { stageLabel } from '@/lib/crm/stages'
import { notifyAgentOfLead } from '@/lib/crm/notify'

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number | string }).id : (v as number | string | undefined))

const before: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (operation === 'create' || data.status !== originalDoc?.status) data.statusChangedAt = new Date().toISOString()
  return data
}

const after: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req, context }) => {
  if (context?.skipLeadHooks) return doc
  const contact = idOf(doc.contact)
  const by = req.user?.id
  if (operation === 'create') {
    await req.payload.create({
      collection: 'activities', req, overrideAccess: true,
      data: { type: 'lead', summary: `New lead: ${doc.title}`, body: doc.message ?? undefined, contact, lead: doc.id, by, meta: { source: doc.source } },
    })
  } else if (previousDoc?.status !== doc.status) {
    await req.payload.create({
      collection: 'activities', req, overrideAccess: true,
      data: { type: 'status', summary: `${stageLabel(previousDoc?.status)} → ${stageLabel(doc.status)}`, contact, lead: doc.id, by },
    })
  }
  const assignee = idOf(doc.assignedTo)
  if (assignee && assignee !== idOf(previousDoc?.assignedTo) && assignee !== by && !context?.seeding) {
    await notifyAgentOfLead(req, doc.id, assignee).catch((e) => req.payload.logger.warn(`lead notify failed: ${e}`))
  }
  return doc
}

export const onLeadChange = { before, after }
