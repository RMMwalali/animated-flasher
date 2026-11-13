import { Emphasis } from '@/components/site/Emphasis'

export function SectionHead({ n, eyebrow, title, emphasis, intro, id, className = '' }: { n?: number; eyebrow: string; title: string; emphasis?: string; intro?: string; id?: string; className?: string }) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <p className="eyebrow tone-accent" data-reveal>{n != null ? `${String(n).padStart(2, '0')} · ` : ''}{eyebrow}</p>
      <h2 id={id} className="mt-4 font-display text-4xl font-medium leading-[1.05] sm:text-5xl" data-reveal>
        <Emphasis text={title} emphasis={emphasis} />
      </h2>
      {intro && <p className="mt-5 text-lg leading-relaxed opacity-90" data-reveal>{intro}</p>}
    </div>
  )
}
