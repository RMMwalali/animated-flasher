import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'

const SKIP = new Set(['audit-logs', 'rate-limits', 'activities', 'messages', 'payload-locked-documents', 'payload-preferences', 'payload-migrations', 'payload-kv', 'payload-jobs'])
const IGNORED_FIELDS = new Set(['updatedAt', 'createdAt', '_status', 'unread', 'lastMessageAt', 'lastMessagePreview', 'lastDirection'])

const ipOf = (headers?: Headers) => headers?.get('x-forwarded-for')?.split(',')[0]?.trim() || headers?.get('x-real-ip') || undefined

function changed(a: Record<string, unknown> = {}, b: Record<string, unknown> = {}): string[] {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  return [...keys].filter((k) => !IGNORED_FIELDS.has(k) && JSON.stringify(a[k]) !== JSON.stringify(b[k])).slice(0, 30)
}

const titleOf = (doc: Record<string, any>, c: CollectionConfig) => {
  const key = (c.admin?.useAsTitle as string) ?? 'id'
  return String(doc?.[key] ?? doc?.id ?? '')
}

/** Adds an audit trail to every collection except internal/high-volume ones. */
export function withAudit(c: CollectionConfig): CollectionConfig {
  if (SKIP.has(c.slug)) return c
  const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req, context }) => {
    if (context?.seeding || context?.fromMessage) return doc
    const fields = operation === 'update' ? changed(previousDoc, doc) : []
    if (operation === 'update' && fields.length === 0) return doc
    await req.payload
      .create({
        collection: 'audit-logs', req, overrideAccess: true,
        data: {
          user: req.user?.collection === 'users' ? req.user.id : undefined,
          action: operation, collectionSlug: c.slug, docId: String(doc.id),
          summary: `${operation === 'create' ? 'Created' : 'Updated'} ${c.slug}: ${titleOf(doc, c)}`.slice(0, 250),
          changedFields: c.slug === 'users' ? fields.filter((f) => !/password|salt|hash|token/i.test(f)) : fields,
          ip: ipOf(req.headers),
        },
      })
      .catch((e) => req.payload.logger.warn(`audit failed: ${e}`))
    return doc
  }
  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    await req.payload
      .create({
        collection: 'audit-logs', req, overrideAccess: true,
        data: { user: req.user?.id, action: 'delete', collectionSlug: c.slug, docId: String(doc.id), summary: `Deleted ${c.slug}: ${titleOf(doc, c)}`.slice(0, 250), ip: ipOf(req.headers) },
      })
      .catch(() => undefined)
    return doc
  }
  return {
    ...c,
    hooks: {
      ...c.hooks,
      afterChange: [...(c.hooks?.afterChange ?? []), afterChange],
      afterDelete: [...(c.hooks?.afterDelete ?? []), afterDelete],
    },
  }
}
