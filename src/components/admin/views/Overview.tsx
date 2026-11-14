import type { AdminViewServerProps } from 'payload'
import Link from 'next/link'
import { hasRole } from '@/access'
import { missingSetup } from '@/lib/config'
import { stageLabel } from '@/lib/crm/stages'
import { formatMoney, type Currency } from '@/lib/pricing'
import { ArrowList, ButtonLink, Notice, Page, Section, Stat } from '../ui'

const day = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '')
const ago = (d?: string | null) => {
  if (!d) return ''
  const m = Math.round((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`
}

export async function OverviewView(props: AdminViewServerProps) {
  const { initPageResult } = props
  const { req } = initPageResult
  const { payload, user } = req
  const sales = hasRole(user as never, 'admin', 'sales')
  const isAdmin = hasRole(user as never, 'admin')
  const now = new Date()
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)
  const in30 = new Date(now.getTime() + 30 * 864e5)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const mine = (field: string) => (isAdmin ? {} : { [field]: { equals: user?.id } })

  const [tasks, leads, unanswered, bookings, payments, open] = sales
    ? await Promise.all([
        payload.find({ collection: 'tasks', where: { and: [{ done: { not_equals: true } }, { due: { less_than_equal: endOfToday.toISOString() } }, mine('assignedTo')] }, sort: 'due', limit: 8, depth: 0, req }),
        payload.find({ collection: 'leads', where: { status: { equals: 'new' } }, sort: '-createdAt', limit: 8, depth: 1, req }),
        payload.find({ collection: 'conversations', where: { and: [{ status: { equals: 'open' } }, { lastDirection: { equals: 'in' } }] }, sort: 'lastMessageAt', limit: 8, depth: 1, req }),
        payload.find({ collection: 'bookings', where: { and: [{ startDate: { greater_than_equal: new Date(now.toDateString()).toISOString() } }, { startDate: { less_than_equal: in30.toISOString() } }, { status: { not_equals: 'cancelled' } }] }, sort: 'startDate', limit: 8, depth: 1, req }),
        payload.find({ collection: 'payments', where: { and: [{ status: { equals: 'success' } }, { paidAt: { greater_than_equal: monthStart.toISOString() } }] }, limit: 1000, depth: 0, req }),
        payload.find({ collection: 'leads', where: { status: { not_in: ['travelled', 'review_requested', 'lost'] } }, limit: 1000, depth: 0, req, select: { estimatedValue: true } }),
      ])
    : [null, null, null, null, null, null]

  const revenue = new Map<string, number>()
  for (const p of payments?.docs ?? []) revenue.set(p.currency, (revenue.get(p.currency) ?? 0) + p.amount)
  const pipelineValue = (open?.docs ?? []).reduce((a, l) => a + (l.estimatedValue ?? 0), 0)
  const missing = isAdmin ? await missingSetup(props.initPageResult.req.payload) : []

  return (
    <>
      <Page
        eyebrow={now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        title={`Jambo, ${String((user as { name?: string })?.name ?? '').split(' ')[0] || 'team'}`}
        intro="Today at a glance. Everything below links straight to the record."
        actions={sales ? <ButtonLink href="/admin/inbox" icon="inbox">Open inbox</ButtonLink> : <ButtonLink href="/admin/collections/pages">Edit website</ButtonLink>}
      >
        {missing.length > 0 && (
          <Notice title={`${missing.length} service${missing.length > 1 ? 's' : ''} not connected yet`}>
            The site works without them, with reduced features. <Link href="/admin/setup">See the go-live setup</Link>.
          </Notice>
        )}

        {sales ? (
          <>
            <div className="ng-stats">
              <Stat icon="pipeline" label="New leads" value={leads!.totalDocs} />
              <Stat icon="inbox" label="Awaiting reply" value={unanswered!.totalDocs} />
              <Stat icon="calendar" label="Departures, 30 days" value={bookings!.totalDocs} />
              <Stat
                icon="money"
                label="Received this month"
                value={revenue.size ? [...revenue].map(([c, v]) => formatMoney(v, c as Currency)).join(' + ') : formatMoney(0)}
                note={`Open pipeline ${formatMoney(pipelineValue)}`}
              />
            </div>

            <Section n={1} title="Today's tasks" aside={<Link href="/admin/collections/tasks/create">Add task</Link>}>
              <ArrowList
                empty="No tasks due. Good work."
                items={tasks!.docs.map((t) => ({
                  href: `/admin/collections/tasks/${t.id}`,
                  label: t.title,
                  meta: day(t.due),
                  status: t.due && new Date(t.due) < new Date(now.toDateString()) ? { label: 'Overdue', tone: 'alert' } : undefined,
                }))}
              />
            </Section>

            <Section n={2} title="New leads" aside={<Link href="/admin/pipeline">Pipeline</Link>}>
              <ArrowList
                empty="No new leads right now."
                items={leads!.docs.map((l) => ({
                  href: `/admin/collections/leads/${l.id}`,
                  label: l.title,
                  meta: `${l.source?.channel ?? 'form'} · ${ago(l.createdAt)}`,
                  status: l.assignedTo ? undefined : { label: 'Unassigned', tone: 'ochre' },
                }))}
              />
            </Section>

            <Section n={3} title="Unanswered conversations" aside={<Link href="/admin/inbox">Inbox</Link>}>
              <ArrowList
                empty="Every guest has a reply."
                items={unanswered!.docs.map((c) => ({
                  href: `/admin/inbox?c=${c.id}`,
                  label: `${(c.contact as { fullName?: string })?.fullName ?? 'Guest'}: ${c.lastMessagePreview ?? c.subject}`,
                  meta: ago(c.lastMessageAt),
                  status: { label: c.channel === 'chat' ? 'Chat' : 'Email', tone: 'teal' },
                }))}
              />
            </Section>

            <Section n={4} title="Upcoming departures" aside={<Link href="/admin/calendar">Calendar</Link>}>
              <ArrowList
                empty="No departures in the next 30 days."
                items={bookings!.docs.map((b) => ({
                  href: `/admin/collections/bookings/${b.id}`,
                  label: `${b.reference} · ${b.title}`,
                  meta: `${day(b.startDate)} · ${b.pax ?? '?'} pax`,
                  status: b.status === 'pending_deposit' ? { label: 'No deposit', tone: 'alert' } : b.status === 'deposit_paid' ? { label: `Balance ${formatMoney(b.balanceDue, b.currency as Currency)}`, tone: 'ochre' } : { label: 'Paid', tone: 'teal' },
                }))}
              />
            </Section>

            <Section n={5} title="Revenue this month">
              <ArrowList
                empty="No payments received yet this month."
                items={(payments!.docs ?? []).slice(0, 8).map((p) => ({
                  href: `/admin/collections/payments/${p.id}`,
                  label: `${formatMoney(p.amount, p.currency as Currency)} · ${p.kind}`,
                  meta: day(p.paidAt),
                  status: p.reconciled ? { label: 'Reconciled', tone: 'teal' } : { label: 'To reconcile', tone: 'ochre' },
                }))}
              />
            </Section>
          </>
        ) : (
          <Section n={1} title="Website content">
            <ArrowList
              items={[
                { href: '/admin/globals/home', label: 'Home page' },
                { href: '/admin/collections/trips', label: 'Journeys' },
                { href: '/admin/collections/destinations', label: 'Destinations' },
                { href: '/admin/collections/posts', label: 'Blog' },
                { href: '/admin/collections/pages', label: 'Pages' },
                { href: '/admin/collections/media', label: 'Photos & videos' },
              ]}
            />
          </Section>
        )}
        {sales && (
          <p className="ng-foot">
            Stages: {['new', 'contacted', 'quoted', 'deposit_paid', 'confirmed', 'travelled', 'review_requested'].map(stageLabel).join(' → ')}
          </p>
        )}
      </Page>
    </>
  )
}
