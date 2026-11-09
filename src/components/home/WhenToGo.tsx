import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'
import type { HomeVM } from '@/lib/content'

const M = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const
const KIND: Record<string, { cls: string; icon: 'sun' | 'rain' | 'binoculars' | 'wave' }> = {
  dry: { cls: 'bg-ochre', icon: 'sun' },
  rains: { cls: 'bg-teal-ink', icon: 'rain' },
  migration: { cls: 'bg-green', icon: 'binoculars' },
  marine: { cls: 'bg-teal', icon: 'wave' },
}

/** Season strip: one row per season, months as columns (a real table for screen readers). */
export function WhenToGo({ home, n = 5 }: { home: HomeVM; n?: number }) {
  return (
    <section data-tone="coast" className="py-24 sm:py-32" aria-labelledby="when-title">
      <div className="gutter mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-teal-ink" data-reveal>{String(n).padStart(2, '0')} · When to go</p>
            <h2 id="when-title" className="statement mt-4 max-w-[18ch] !text-[clamp(1.9rem,4vw,3.6rem)]" data-reveal>{home.whenStatement}</h2>
          </div>
          <Link href="/when-to-go" className="btn btn-ghost" data-cta="home-when-link"><span>Month by month</span> <Icon name="arrow-right" size={18} /></Link>
        </div>
        <div className="relative mt-12 overflow-x-auto" data-reveal>
          <table className="w-full min-w-[720px] border-collapse text-left">
            <caption className="sr-only">Kenya seasons by month</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[30%] pb-3 font-mono text-xs uppercase tracking-widest text-teal-ink">Season</th>
                {M.map((m) => <th key={m} scope="col" className="pb-3 text-center font-mono text-xs uppercase tracking-widest">{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {home.seasons.map((s, i) => {
                const k = KIND[s.kind] ?? KIND.dry!
                return (
                  <tr key={i} className="border-t border-deep/20">
                    <th scope="row" className="py-4 pr-4 font-normal">
                      <span className="flex items-center gap-3">
                        <Icon name={k.icon} size={20} />
                        <span>
                          <span className="block font-display text-lg font-medium">{s.label}</span>
                          {s.note && <span className="text-sm text-deep/80">{s.note}</span>}
                        </span>
                      </span>
                    </th>
                    {M.map((m) => {
                      const on = (s.months as readonly string[]).includes(m)
                      return (
                        <td key={m} className="px-0.5 py-4">
                          <span className={`block h-2.5 rounded-full ${on ? k.cls : 'bg-deep/10'}`} />
                          <span className="sr-only">{on ? 'Yes' : 'No'}</span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
