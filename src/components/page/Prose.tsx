import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/** Rich text from the CMS with the site's reading styles. */
export function Prose({ data, className = '' }: { data: unknown; className?: string }) {
  if (!data || typeof data !== 'object' || !('root' in (data as object))) return null
  return (
    <div className={`prose-ngina ${className}`}>
      <RichText data={data as SerializedEditorState} />
    </div>
  )
}
