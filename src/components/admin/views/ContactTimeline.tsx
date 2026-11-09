import type { DocumentViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Icon, type IconName } from '@/components/icons/Icon'
import { formatMoney, type Currency } from '@/lib/pricing'
import { Page, Section } from '../ui'

const ICON: Record<string, IconName> = {
  note: 'note', email_in: 'mail', email_out: 'send', chat: 'chat', status: 'pipeline', lead: 'plus', quote: 'quote',
  booking: 'booking', payment: 'money', review: 'review', task: 'task', message: 'chat',
}

/** Contact > Timeline tab: every touchpoint for one person, newest first. */
export async function ContactTimeline(props: DocumentViewServerProps) {
  const { initPageResult } = props
  const { req } = initPageResult
  const id = initPageResult.docID!
  const contact = await req.payload.findByID({ collection: 'contacts', id, depth: 0, req })
  const [acts, convs, bookings, payments] = await Promise.all([
    req.payload.find({ collection: 'activities', where: { contact: { equals: id } }, sort: '-createdAt', limit: 200, depth: 1, req }),
    req.payload.find({ collection: 'conversations', where: { contact: { equals: id } }, limit: 50, depth: 0, req }),
    req.payload.find({ collection: 'bookings', where: { contact: { equals: id } }, limit: 50, depth: 0, req }),
    req.payload.find({ collection: 'payments', where: { contact: { equals: id } }, limit: 100, depth: 0, req }),
  ])
  const msgs = convs.docs.length
    ? await req.payload.find({ collection: 'messages', where: { conversation: { in: convs.docs.map((c) => c.id) } }, sort: '-createdAt', limit: 200, depth: 0, req })
    : { docs: [] }

  type Item = { at: string; icon: IconName; title: string; body?: string | null; href?: string }
  const items: Item[] = [
    ...acts.docs.filter((a) => a.type !== 'payment').map((a) => ({ at: a.createdAt, icon: ICON[a.type] ?? 'note', title: a.summary, body: a.body, href: a.lead ? `/admin/collections/leads/${typeof a.lead === 'object' ? a.lead.id : a.lead}` : undefined })),
    ...msgs.docs.map((m) => ({ at: m.createdAt, icon: (m.direction === 'in' ? 'mail' : m.direction === 'note' ? 'note' : 'send') as IconName, title: m.direction === 'in' ? `${m.channel === 'chat' ? 'Chat' : 'Email'} from guest` : m.direction === 'note' ? 'Internal note' : `${m.channel === 'chat' ? 'Chat' : 'Email'} reply`, body: m.body, href: `/admin/inbox?c=${typeof m.conversation === 'object' ? m.conversation.id : m.conversation}` })),
    ...payments.docs.map((p) => ({ at: p.paidAt ?? p.createdAt, icon: 'money' as IconName, title: `Payment ${p.status}: ${formatMoney(p.amount, p.currency as Currency)} (${p.kind})`, href: `/admin/collections/payments/${p.id}` })),
  ].sort((a, b) => b.at.localeCompare(a.at))

  return (
    <DefaultTemplate i18n={req.i18n} locale={initPageResult.locale} params={props.params} payload={req.payload} permissions={initPageResult.permissions} searchParams={props.searchParams} user={req.user ?? undefined} visibleEntities={initPageResult.visibleEntities}>
      <Page eyebrow="Contact" title={contact.fullName ?? contact.firstName} intro={[contact.email, contact.phone, contact.country].filter(Boolean).join(' · ')}>
        <Section n={1} title={`Timeline · ${items.length}`}>
          {items.length === 0 ? <p className="ng-empty">No activity yet.</p> : (
            <ol className="ng-timeline">
              {items.map((it, i) => (
                <li key={i}>
                  <Icon name={it.icon} size={18} />
                  <div>
                    <p className="ng-timeline__title">{it.href ? <a href={it.href}>{it.title}</a> : it.title}</p>
                    {it.body && <p className="ng-timeline__body">{it.body.slice(0, 400)}</p>}
                    <p className="ng-label">{new Date(it.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Section>
        <Section n={2} title={`Bookings · ${bookings.totalDocs}`}>
          <ul className="ng-arrows">
            {bookings.docs.map((b) => (
              <li key={b.id}><a href={`/admin/collections/bookings/${b.id}`}><Icon name="arrow-right" size={18} className="ng-arrows__icon" /><span className="ng-arrows__label">{b.reference} · {b.title}</span><span className="ng-arrows__meta">{b.startDate?.slice(0, 10)}</span></a></li>
            ))}
          </ul>
        </Section>
      </Page>
    </DefaultTemplate>
  )
}
