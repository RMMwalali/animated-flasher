import { Icon } from '@/components/icons/Icon'
import Link from 'next/link'
import type { SettingsVM } from '@/lib/content'
import { visibleTrust } from '@/lib/trust'

/** Licences & memberships the owner enters in Business settings. Sample rows only show in preview. */
export function Trust({ settings, n = 6 }: { settings: SettingsVM; n?: number }) {
  const items = visibleTrust(settings)
  if (!items.length) return null
  return (
    <section data-tone="cream" className="py-24" aria-labelledby="trust-title">
      <div className="gutter mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_2fr]">
        <div>
          <p className="eyebrow text-teal-ink">{String(n).padStart(2, '0')} · Licensed & accountable</p>
          <h2 id="trust-title" className="mt-4 font-display text-4xl font-medium">Travel with a registered Kenyan operator.</h2>
          <Link href="/licences" className="mt-6 inline-flex items-center gap-2 underline underline-offset-4" data-cta="home-trust-licences">All licences & memberships</Link>
        </div>
        <ul className="grid border-t border-deep">
          {items.map((t) => (
            <li key={t.name} className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-b border-line py-5">
              <Icon name="shield" />
              <span>
                <span className="block font-semibold">{t.issuer ? `${t.issuer}: ` : ''}{t.name}</span>
                <span className="font-semibold tabular-nums text-sm text-deep/80">{t.number ? `No. ${t.number}` : 'Number to be added'}</span>
              </span>
              <span className="flex items-center gap-3">
                {t.sample && <span className="rounded-full border border-ochre-ink px-2 py-0.5 font-semibold tabular-nums text-[11px] uppercase text-ochre-ink">Sample</span>}
                {t.url && <a href={t.url} rel="noopener" className="grid size-11 place-items-center rounded-full border border-line" aria-label={`Verify: ${t.name}`}><Icon name="external-link" size={18} /></a>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
