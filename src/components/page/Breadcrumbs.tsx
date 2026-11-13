import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'
import { breadcrumbs, JsonLd } from '@/lib/seo/jsonld'

export type Crumb = { name: string; path: string }

/** Visible breadcrumb trail + BreadcrumbList JSON-LD. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: 'Home', path: '/' }, ...items]
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] opacity-85">
          {all.map((c, i) => (
            <li key={c.path} className="flex items-center gap-1.5">
              {i > 0 && <Icon name="chevron-right" size={12} />}
              {i < all.length - 1 ? (
                <Link href={c.path} className="link-u">{c.name}</Link>
              ) : (
                <span aria-current="page">{c.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbs(all)} />
    </>
  )
}
