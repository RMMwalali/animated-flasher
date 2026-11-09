import type { AdminViewServerProps } from 'payload'
import { LEAD_STAGES } from '@/lib/crm/stages'
import { Page } from '../ui'
import { PipelineBoard, type BoardLead } from './PipelineBoard'
import { Shell } from './Shell'

export async function PipelineView(props: AdminViewServerProps) {
  const { req } = props.initPageResult
  const mineOnly = props.searchParams?.mine === '1'
  const { docs } = await req.payload.find({
    collection: 'leads',
    where: mineOnly ? { assignedTo: { equals: req.user?.id } } : {},
    sort: '-createdAt', limit: 500, depth: 1, req,
  })
  const leads: BoardLead[] = docs.map((l) => ({
    id: l.id, title: l.title, status: l.status,
    contact: (l.contact as { fullName?: string })?.fullName ?? '',
    agent: (l.assignedTo as { name?: string })?.name ?? '',
    value: l.estimatedValue ?? null,
    channel: l.source?.channel ?? '', cta: l.source?.ctaId ?? '', utm: [l.source?.utmSource, l.source?.utmCampaign].filter(Boolean).join(' / '),
    page: l.source?.page ?? '',
    travelStart: l.travelStart ?? null, createdAt: l.createdAt,
  }))
  return (
    <Shell props={props} roles={['admin', 'sales']}>
      <Page eyebrow="Sales" title="Leads pipeline" intro="Move a lead with the arrows, or open it for full details. Source shows the channel, page and button that brought it in.">
        <PipelineBoard leads={leads} stages={LEAD_STAGES.map((s) => ({ value: s.value, label: s.label }))} mineOnly={mineOnly} />
      </Page>
    </Shell>
  )
}
