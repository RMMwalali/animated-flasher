import type { Fact } from '@/lib/content'

/** Label / value table. Short, factual rows that search engines and AI assistants can quote. */
export function KeyFacts({ facts, heading = 'Key facts', className = '' }: { facts: Fact[]; heading?: string; className?: string }) {
  if (!facts.length) return null
  return (
    <section className={className} aria-labelledby={`facts-${heading.replace(/\W+/g, '-').toLowerCase()}`}>
      <h2 id={`facts-${heading.replace(/\W+/g, '-').toLowerCase()}`} className="eyebrow tone-accent">{heading}</h2>
      <dl className="mt-4 border-t border-current/40">
        {facts.map((f) => (
          <div key={f.label} className="grid gap-1 border-b border-current/20 py-3.5 sm:grid-cols-[minmax(10rem,1fr)_2fr] sm:gap-6">
            <dt className="font-semibold tabular-nums text-xs uppercase tracking-[0.06em] opacity-80">{f.label}</dt>
            <dd className="text-[1.05rem]">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
