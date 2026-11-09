'use client'
import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Icon } from '@/components/icons/Icon'

export type BoardLead = {
  id: number; title: string; status: string; contact: string; agent: string; value: number | null
  channel: string; cta: string; utm: string; page: string; travelStart: string | null; createdAt: string
}

const usd = (v: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

export function PipelineBoard({ leads: initial, stages, mineOnly }: { leads: BoardLead[]; stages: { value: string; label: string }[]; mineOnly: boolean }) {
  const [leads, setLeads] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const order = stages.map((s) => s.value)

  const move = (lead: BoardLead, dir: -1 | 1) => {
    const flow = order.filter((s) => s !== 'lost')
    const i = flow.indexOf(lead.status)
    const next = i === -1 ? 'new' : flow[i + dir]
    if (!next) return
    update(lead, next)
  }
  const update = (lead: BoardLead, status: string) => {
    const prev = leads
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, status } : l)))
    start(async () => {
      const res = await fetch(`/api/leads/${lead.id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      if (!res.ok) {
        setLeads(prev)
        setError('Could not update that lead. You may not have permission.')
      }
    })
  }
  const byStage = useMemo(() => Object.fromEntries(order.map((s) => [s, leads.filter((l) => l.status === s)])), [leads, order])

  return (
    <div className="ng-board-wrap" aria-busy={pending}>
      {error && <p className="ng-notice ng-notice--ochre" role="alert">{error}</p>}
      <TabGroup>
        <div className="ng-toolbar">
          <TabList className="ng-tabs">
            <Tab className="ng-tab">Board</Tab>
            <Tab className="ng-tab">List</Tab>
          </TabList>
          <Link className="ng-link" href={mineOnly ? '/admin/pipeline' : '/admin/pipeline?mine=1'}>{mineOnly ? 'Show everyone\'s' : 'Show only mine'}</Link>
        </div>
        <TabPanels>
          <TabPanel>
            <div className="ng-board">
              {stages.map((s, si) => {
                const items = byStage[s.value] ?? []
                const total = items.reduce((a, l) => a + (l.value ?? 0), 0)
                return (
                  <section key={s.value} className="ng-col" aria-label={s.label}>
                    <header className="ng-col__head">
                      <span className="ng-num">{String(si + 1).padStart(2, '0')}</span>
                      <h3>{s.label}</h3>
                      <span className="ng-col__count">{items.length}{total ? ` · ${usd(total)}` : ''}</span>
                    </header>
                    <ul>
                      {items.map((l) => (
                        <li key={l.id} className="ng-card">
                          <Link href={`/admin/collections/leads/${l.id}`} className="ng-card__title">{l.title}</Link>
                          <p className="ng-card__meta">{[l.agent || 'Unassigned', l.travelStart ? new Date(l.travelStart).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : null].filter(Boolean).join(' · ')}</p>
                          <p className="ng-card__src">{[l.channel, l.cta, l.utm].filter(Boolean).join(' · ') || 'direct'}</p>
                          {s.value !== 'lost' && (
                            <div className="ng-card__actions">
                              <button type="button" onClick={() => move(l, -1)} disabled={si === 0} aria-label={`Move ${l.title} back a stage`}><Icon name="arrow-left" size={16} /></button>
                              <button type="button" onClick={() => update(l, 'lost')} aria-label={`Mark ${l.title} as lost`} className="ng-card__lost">Lost</button>
                              <button type="button" onClick={() => move(l, 1)} disabled={s.value === 'review_requested'} aria-label={`Move ${l.title} forward a stage`}><Icon name="arrow-right" size={16} /></button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          </TabPanel>
          <TabPanel>
            <table className="ng-table">
              <thead><tr><th>Lead</th><th>Stage</th><th>Agent</th><th>Channel</th><th>CTA</th><th>Campaign</th><th>Page</th><th>Received</th></tr></thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td><Link href={`/admin/collections/leads/${l.id}`}>{l.title}</Link></td>
                    <td>{stages.find((s) => s.value === l.status)?.label}</td>
                    <td>{l.agent || '-'}</td>
                    <td>{l.channel || '-'}</td>
                    <td>{l.cta || '-'}</td>
                    <td>{l.utm || '-'}</td>
                    <td>{l.page || '-'}</td>
                    <td>{new Date(l.createdAt).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  )
}
