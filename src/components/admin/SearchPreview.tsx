'use client'
import { useFormFields } from '@payloadcms/ui'
import { DESCRIPTION_MAX, SITE_NAME, TITLE_MAX, clampText, searchTitle } from '@/lib/seo/text'

export type SearchPreviewProps = {
  /** Field holding the page's name, e.g. "title" or "name". */
  titleField: string
  /** Fields to describe the page from, first non-empty wins, e.g. ["excerpt"]. */
  descriptionFields: string[]
  /** Address before the slug, e.g. "/blog/". */
  basePath?: string
  /** For journeys: address by the "type" field. */
  typePaths?: Record<string, string>
}

/**
 * How this page will look on Google, live while editing. Empty "Search &
 * sharing" fields show what the website writes automatically.
 */
export function SearchPreview({ titleField, descriptionFields, basePath = '/', typePaths }: SearchPreviewProps) {
  const v = useFormFields(([f]) => {
    const get = (p: string) => (typeof f[p]?.value === 'string' ? (f[p]!.value as string) : '')
    return {
      name: get(titleField),
      source: descriptionFields.map(get).find((x) => x.trim()) ?? '',
      slug: get('slug'),
      type: get('type'),
      seoTitle: get('seo.title'),
      seoDescription: get('seo.description'),
      noIndex: Boolean(f['seo.noIndex']?.value),
    }
  })
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const path = `${(typePaths && typePaths[v.type]) || basePath}${v.slug}`
  const title = searchTitle(v.seoTitle || v.name, SITE_NAME).text
  const description = clampText(v.seoDescription || v.source)
  const crumbs = [origin.replace(/^https?:\/\//, ''), ...path.split('/').filter(Boolean)].join(' › ')
  const titleLen = (v.seoTitle || v.name).length

  return (
    <div className="ng-serp" aria-label="Google preview">
      <p className="ng-serp__label">Google preview{!v.seoTitle && !v.seoDescription ? ' · written automatically' : ''}</p>
      {v.noIndex ? (
        <p className="ng-notice ng-notice--ochre">Hidden from search engines: this page will not appear on Google.</p>
      ) : (
        <div className="ng-serp__card">
          <div className="ng-serp__site">
            <img src="/brand/icon-192.png" alt="" width={28} height={28} />
            <span>
              <strong>{SITE_NAME}</strong>
              <small>{crumbs}</small>
            </span>
          </div>
          <p className="ng-serp__title">{title || 'Add a title'}</p>
          <p className="ng-serp__desc">{description || 'Add a summary or a description below and it will appear here.'}</p>
        </div>
      )}
      <p className="ng-serp__hint">
        Title {titleLen}/{TITLE_MAX} characters{titleLen > TITLE_MAX ? ' (Google may cut it short)' : ''} · description {description.length}/{DESCRIPTION_MAX}.
        {' '}Fill in the fields below only if you want to change what is written automatically.
      </p>
    </div>
  )
}
